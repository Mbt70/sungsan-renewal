import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const BOARD_FILE_INSERT_FIELDS = Object.freeze([
  'bo_table',
  'wr_id',
  'bf_no',
  'bf_source',
  'bf_file',
  'bf_download',
  'bf_content',
  'bf_fileurl',
  'bf_thumburl',
  'bf_storage',
  'bf_filesize',
  'bf_width',
  'bf_height',
  'bf_type',
  'bf_datetime',
]);

const BLOCKED_ATTACHMENT_EXTENSIONS = Object.freeze([
  'php',
  'php3',
  'php4',
  'php5',
  'phtml',
  'phar',
  'html',
  'htm',
  'xhtml',
  'shtml',
  'js',
  'mjs',
  'cjs',
  'svg',
  'svgz',
]);

function escapeSqlString(value) {
  return String(value ?? '').replaceAll("'", "''");
}

function readField(row, key, fallback = '') {
  const value = row?.[key];
  return value === undefined || value === null ? fallback : String(value);
}

function toPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function sanitizePathSegment(value) {
  return String(value ?? '')
    .split(/[\\/]/)
    .filter(Boolean)
    .pop() ?? '';
}

function sanitizeFileName(value) {
  const basename = sanitizePathSegment(value);
  return basename.replace(/[^0-9A-Za-z._-]+/g, '_').replace(/^_+/, '');
}

function buildTargetFileName({ legacyBoard, legacyPostId, sourceFile }) {
  const safeBoard = String(legacyBoard).replace(/[^0-9A-Za-z_]+/g, '_');
  return `${safeBoard}_${legacyPostId}_${sourceFile}`;
}

function getFileExtension(fileName) {
  const match = String(fileName).match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

function isBlockedAttachment(fileName) {
  return BLOCKED_ATTACHMENT_EXTENSIONS.includes(getFileExtension(fileName));
}

export function buildAttachmentCopyPlan({
  legacyBoard,
  legacyPostId,
  targetBoard,
  targetPostId,
  files = [],
  legacyDataRoot = '/renewal/data/file',
  targetDataRoot = 'data/file',
} = {}) {
  const normalizedLegacyPostId = toPositiveNumber(legacyPostId);
  const normalizedTargetPostId = toPositiveNumber(targetPostId);

  if (!['news', 'free'].includes(targetBoard) || !normalizedLegacyPostId || !normalizedTargetPostId) {
    return {
      copyRecords: [],
      fileRows: [],
      blockedRecords: [],
    };
  }

  const copyRecords = [];
  const fileRows = [];
  const blockedRecords = [];

  for (const file of files) {
    const sourceFile = sanitizeFileName(readField(file, 'bf_file'));

    if (!sourceFile) {
      continue;
    }

    if (isBlockedAttachment(sourceFile)) {
      blockedRecords.push({
        sourcePath: `${legacyDataRoot}/${legacyBoard}/${sourceFile}`,
        legacyBoard,
        legacyPostId: normalizedLegacyPostId,
        targetBoard,
        targetPostId: normalizedTargetPostId,
        sourceFile,
        extension: getFileExtension(sourceFile),
        reason: 'blocked-extension',
      });
      continue;
    }

    const targetFile = buildTargetFileName({
      legacyBoard,
      legacyPostId: normalizedLegacyPostId,
      sourceFile,
    });

    copyRecords.push({
      sourcePath: `${legacyDataRoot}/${legacyBoard}/${sourceFile}`,
      targetPath: `${targetDataRoot}/${targetBoard}/${targetFile}`,
      legacyBoard,
      legacyPostId: normalizedLegacyPostId,
      targetBoard,
      targetPostId: normalizedTargetPostId,
      sourceFile,
      targetFile,
    });

    fileRows.push({
      bo_table: targetBoard,
      wr_id: normalizedTargetPostId,
      bf_no: readField(file, 'bf_no', String(fileRows.length)),
      bf_source: readField(file, 'bf_source', sourceFile),
      bf_file: targetFile,
      bf_download: readField(file, 'bf_download', '0'),
      bf_content: readField(file, 'bf_content'),
      bf_fileurl: readField(file, 'bf_fileurl'),
      bf_thumburl: readField(file, 'bf_thumburl'),
      bf_storage: readField(file, 'bf_storage'),
      bf_filesize: readField(file, 'bf_filesize', '0'),
      bf_width: readField(file, 'bf_width', '0'),
      bf_height: readField(file, 'bf_height', '0'),
      bf_type: readField(file, 'bf_type', '0'),
      bf_datetime: readField(file, 'bf_datetime'),
    });
  }

  return {
    copyRecords,
    fileRows,
    blockedRecords,
  };
}

export function buildBoardFileInsertSql(fileRow, { tablePrefix = 'g5_' } = {}) {
  if (!fileRow) {
    throw new Error('fileRow is required');
  }

  const columns = BOARD_FILE_INSERT_FIELDS.map((field) => `\`${field}\``).join(', ');
  const values = BOARD_FILE_INSERT_FIELDS
    .map((field) => `'${escapeSqlString(fileRow[field])}'`)
    .join(', ');
  const updates = BOARD_FILE_INSERT_FIELDS
    .filter((field) => !['bo_table', 'wr_id', 'bf_no'].includes(field))
    .map((field) => `\`${field}\` = VALUES(\`${field}\`)`)
    .join(', ');

  return `INSERT INTO \`${tablePrefix}board_file\` (${columns}) VALUES (${values}) ON DUPLICATE KEY UPDATE ${updates};`;
}

function parseInputRows(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }

  return trimmed.split(/\r?\n/).map((line) => JSON.parse(line));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [, , inputPath, copyPlanPath, sqlPath, tablePrefix = 'g5_'] = process.argv;

  if (!inputPath || !copyPlanPath || !sqlPath) {
    console.error('Usage: node tools/migration/file-plan.mjs <attachments.json|jsonl> <copy-plan.json> <board-file.sql> [tablePrefix]');
    process.exit(1);
  }

  const rows = parseInputRows(await readFile(inputPath, 'utf8'));
  const mergedPlan = rows
    .map((row) => buildAttachmentCopyPlan(row))
    .reduce(
      (accumulator, plan) => ({
        copyRecords: [...accumulator.copyRecords, ...plan.copyRecords],
        fileRows: [...accumulator.fileRows, ...plan.fileRows],
        blockedRecords: [...accumulator.blockedRecords, ...plan.blockedRecords],
      }),
      { copyRecords: [], fileRows: [], blockedRecords: [] },
    );
  const sql = mergedPlan.fileRows
    .map((fileRow) => buildBoardFileInsertSql(fileRow, { tablePrefix }))
    .join('\n');

  await writeFile(copyPlanPath, `${JSON.stringify(mergedPlan, null, 2)}\n`, 'utf8');
  await writeFile(sqlPath, `${sql}\n`, 'utf8');
  console.log(`Wrote ${mergedPlan.copyRecords.length} attachment copy records to ${copyPlanPath}`);
  console.log(`Wrote ${mergedPlan.fileRows.length} board_file inserts to ${sqlPath}`);
  console.log(`Flagged ${mergedPlan.blockedRecords.length} blocked attachments for review`);
}
