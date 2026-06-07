import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_TABLE_PREFIX = 'g5_';
const DEFAULT_GROUP_ID = 'sungsan';

const SUNGSAN_CONFIG_SETTINGS = Object.freeze({
  cf_theme: 'sungsan',
  cf_title: '성산회',
  cf_member_skin: 'sungsan',
  cf_mobile_member_skin: 'sungsan',
  cf_register_level: 1,
  cf_use_homepage: 0,
  cf_req_homepage: 0,
  cf_use_tel: 0,
  cf_req_tel: 0,
  cf_use_addr: 0,
  cf_req_addr: 0,
  cf_use_signature: 0,
  cf_req_signature: 0,
  cf_use_profile: 0,
  cf_req_profile: 0,
  cf_use_recommend: 0,
  cf_use_member_icon: 0,
  cf_member_icon_size: 0,
  cf_member_icon_width: 0,
  cf_member_icon_height: 0,
  cf_member_img_size: 0,
  cf_member_img_width: 0,
  cf_member_img_height: 0,
});

const DEFAULT_BOARD_SETTINGS = Object.freeze({
  gr_id: DEFAULT_GROUP_ID,
  bo_device: 'both',
  bo_admin: '',
  bo_reply_level: 2,
  bo_count_modify: 1,
  bo_count_delete: 1,
  bo_read_point: 0,
  bo_write_point: 0,
  bo_comment_point: 0,
  bo_download_point: 0,
  bo_use_sideview: 0,
  bo_use_file_content: 0,
  bo_use_secret: 0,
  bo_use_dhtml_editor: 0,
  bo_use_rss_view: 0,
  bo_use_good: 0,
  bo_use_nogood: 0,
  bo_use_name: 0,
  bo_use_signature: 0,
  bo_use_ip_view: 0,
  bo_use_list_view: 0,
  bo_use_list_content: 0,
  bo_use_email: 0,
  bo_table_width: 100,
  bo_subject_len: 80,
  bo_mobile_subject_len: 40,
  bo_page_rows: 15,
  bo_mobile_page_rows: 15,
  bo_new: 48,
  bo_hot: 100,
  bo_image_width: 960,
  bo_include_head: '_head.php',
  bo_include_tail: '_tail.php',
  bo_content_head: '',
  bo_content_tail: '',
  bo_mobile_content_head: '',
  bo_mobile_content_tail: '',
  bo_insert_content: '',
  bo_gallery_cols: 4,
  bo_gallery_width: 202,
  bo_gallery_height: 150,
  bo_mobile_gallery_width: 125,
  bo_mobile_gallery_height: 100,
  bo_upload_count: 5,
  bo_upload_size: 10485760,
  bo_reply_order: 1,
  bo_use_search: 1,
  bo_order: 0,
});

export const SUNGSAN_BOARD_CONFIGS = Object.freeze([
  Object.freeze({
    ...DEFAULT_BOARD_SETTINGS,
    bo_table: 'news',
    bo_subject: '소식',
    bo_list_level: 1,
    bo_read_level: 1,
    bo_write_level: 6,
    bo_comment_level: 2,
    bo_html_level: 6,
    bo_link_level: 6,
    bo_upload_level: 6,
    bo_download_level: 1,
    bo_use_category: 1,
    bo_category_list: '공지|행사|자료|규정|활동소식',
    bo_skin: 'sungsan_news',
    bo_mobile_skin: 'sungsan_news',
    bo_1_subj: '소속 slug',
    bo_2_subj: '공개 범위',
    bo_3_subj: '행사 시작일',
    bo_4_subj: '행사 종료일',
    bo_5_subj: '기존 보드 ID',
    bo_6_subj: '기존 글 ID',
    bo_7_subj: '이전 검토 플래그',
    bo_8_subj: '검토 사유',
    bo_order: 10,
  }),
  Object.freeze({
    ...DEFAULT_BOARD_SETTINGS,
    bo_table: 'free',
    bo_subject: '자유게시판',
    bo_list_level: 1,
    bo_read_level: 2,
    bo_write_level: 2,
    bo_comment_level: 2,
    bo_html_level: 2,
    bo_link_level: 2,
    bo_upload_level: 2,
    bo_download_level: 2,
    bo_use_category: 0,
    bo_category_list: '',
    bo_skin: 'sungsan_free',
    bo_mobile_skin: 'sungsan_free',
    bo_order: 20,
  }),
]);

export function escapeSqlString(value) {
  return String(value).replaceAll("'", "''");
}

function prefixedTable(name, tablePrefix = DEFAULT_TABLE_PREFIX) {
  return `\`${tablePrefix}${name}\``;
}

function buildSetClause(values) {
  return Object.entries(values)
    .map(([key, value]) => `    ${key} = '${escapeSqlString(value)}'`)
    .join(',\n');
}

export function buildBoardUpsertSql(boardConfig, { tablePrefix = DEFAULT_TABLE_PREFIX } = {}) {
  const insertValues = { ...DEFAULT_BOARD_SETTINGS, ...boardConfig };
  const updateKeys = Object.keys(insertValues).filter((key) => key !== 'bo_table');
  const updateClause = updateKeys.map((key) => `    ${key} = VALUES(${key})`).join(',\n');

  return `INSERT INTO ${prefixedTable('board', tablePrefix)} SET\n${buildSetClause(insertValues)}\nON DUPLICATE KEY UPDATE\n${updateClause};`;
}

export function buildWriteTableSql(boardId, writeSqlTemplate, { tablePrefix = DEFAULT_TABLE_PREFIX } = {}) {
  if (!writeSqlTemplate || !writeSqlTemplate.includes('__TABLE_NAME__')) {
    throw new Error('writeSqlTemplate must contain __TABLE_NAME__');
  }

  const tableName = `${tablePrefix}write_${boardId}`;

  return writeSqlTemplate
    .replace(/CREATE TABLE\s+`__TABLE_NAME__`/i, `CREATE TABLE IF NOT EXISTS \`${tableName}\``)
    .replaceAll('`__TABLE_NAME__`', `\`${tableName}\``)
    .replace(/DEFAULT CHARSET=utf8\b/gi, 'DEFAULT CHARSET=utf8mb4')
    .trim()
    .replace(/;?$/, ';');
}

export function buildGroupUpsertSql({ tablePrefix = DEFAULT_TABLE_PREFIX } = {}) {
  return `INSERT INTO ${prefixedTable('group', tablePrefix)} SET
    gr_id = '${DEFAULT_GROUP_ID}',
    gr_subject = '성산회',
    gr_device = 'both'
ON DUPLICATE KEY UPDATE
    gr_subject = VALUES(gr_subject),
    gr_device = VALUES(gr_device);`;
}

export function buildThemeUpdateSql({ tablePrefix = DEFAULT_TABLE_PREFIX } = {}) {
  return `UPDATE ${prefixedTable('config', tablePrefix)} SET\n${buildSetClause(SUNGSAN_CONFIG_SETTINGS)};`;
}

export function buildSetupSql({
  tablePrefix = DEFAULT_TABLE_PREFIX,
  writeSqlTemplate,
  boards = SUNGSAN_BOARD_CONFIGS,
} = {}) {
  if (!writeSqlTemplate) {
    throw new Error('writeSqlTemplate is required');
  }

  return [
    '-- Sungsan GnuBoard5 setup SQL',
    '-- Review on staging before applying to production.',
    buildThemeUpdateSql({ tablePrefix }),
    buildGroupUpsertSql({ tablePrefix }),
    ...boards.map((board) => buildBoardUpsertSql(board, { tablePrefix })),
    ...boards.map((board) => buildWriteTableSql(board.bo_table, writeSqlTemplate, { tablePrefix })),
  ].join('\n\n') + '\n';
}

export async function writeSetupSqlFile({
  outputPath,
  writeSqlTemplate,
  writeSqlTemplatePath,
  tablePrefix = DEFAULT_TABLE_PREFIX,
} = {}) {
  if (!outputPath) {
    throw new Error('outputPath is required');
  }

  const template = writeSqlTemplate ?? await readFile(writeSqlTemplatePath, 'utf8');
  const sql = buildSetupSql({ tablePrefix, writeSqlTemplate: template });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, sql, 'utf8');

  return { outputPath, sql };
}
