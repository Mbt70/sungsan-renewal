import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { toRedirectRecord } from './legacy-map.mjs';

function toPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function buildRedirectRecords(rows) {
  return rows
    .map((row) => {
      const legacyPostId = toPositiveNumber(row.legacyPostId ?? row.wr_6 ?? row.wr_id);
      const targetPostId = toPositiveNumber(row.targetPostId ?? row.newWrId ?? row.new_wr_id);
      const legacyBoard = row.legacyBoard ?? row.boTable ?? row.wr_5;
      const targetBoard = row.targetBoard ?? row.newBoard;

      if (!legacyBoard || !targetBoard || !legacyPostId || !targetPostId) {
        return null;
      }

      if (!['news', 'free'].includes(targetBoard)) {
        return null;
      }

      return toRedirectRecord({
        boTable: legacyBoard,
        wrId: legacyPostId,
        newBoard: targetBoard,
        newWrId: targetPostId,
      });
    })
    .filter(Boolean);
}

function csvEscape(value) {
  const text = String(value ?? '');
  const shouldQuote = text.startsWith('/') || /[",\n]/.test(text);

  return shouldQuote ? `"${text.replaceAll('"', '""')}"` : text;
}

export function formatRedirectCsv(records) {
  const fields = ['legacyPath', 'targetPath', 'legacyBoard', 'legacyPostId', 'targetBoard', 'targetPostId'];
  const rows = [
    fields,
    ...records.map((record) => fields.map((field) => record[field])),
  ];

  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

function escapeRedirectMatchPath(path) {
  return String(path).replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

export function formatApacheRedirects(records) {
  return records
    .map((record) => `RedirectMatch 301 ^${escapeRedirectMatchPath(record.legacyPath)}$ ${record.targetPath}`)
    .join('\n');
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
  const [, , inputPath, outputPath, format = 'csv'] = process.argv;

  if (!inputPath || !outputPath) {
    console.error('Usage: node tools/migration/redirect-map.mjs <input.json|jsonl> <output> [csv|apache]');
    process.exit(1);
  }

  const rows = parseInputRows(await readFile(inputPath, 'utf8'));
  const records = buildRedirectRecords(rows);
  const output = format === 'apache' ? formatApacheRedirects(records) : formatRedirectCsv(records);

  await writeFile(outputPath, `${output}\n`, 'utf8');
  console.log(`Wrote ${records.length} redirects to ${outputPath}`);
}
