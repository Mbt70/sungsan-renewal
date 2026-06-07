import { getLegacyBoardMapping } from './legacy-map.mjs';

const INSERT_FIELDS = Object.freeze([
  'wr_num',
  'wr_reply',
  'wr_parent',
  'wr_is_comment',
  'wr_comment',
  'wr_comment_reply',
  'ca_name',
  'wr_option',
  'wr_subject',
  'wr_content',
  'wr_seo_title',
  'wr_link1',
  'wr_link2',
  'wr_link1_hit',
  'wr_link2_hit',
  'wr_hit',
  'wr_good',
  'wr_nogood',
  'mb_id',
  'wr_password',
  'wr_name',
  'wr_email',
  'wr_homepage',
  'wr_datetime',
  'wr_file',
  'wr_last',
  'wr_ip',
  'wr_facebook_user',
  'wr_twitter_user',
  'wr_1',
  'wr_2',
  'wr_3',
  'wr_4',
  'wr_5',
  'wr_6',
  'wr_7',
  'wr_8',
  'wr_9',
  'wr_10',
]);

function escapeSqlString(value) {
  return String(value ?? '').replaceAll("'", "''");
}

function readField(row, key, fallback = '') {
  const value = row?.[key];
  return value === undefined || value === null ? fallback : String(value);
}

function normalizeDateToken(token) {
  if (!token || !/^\d{8}$/.test(token)) {
    return '';
  }

  return `${token.slice(0, 4)}-${token.slice(4, 6)}-${token.slice(6, 8)}`;
}

function detectManualReviewReason(mapping, row) {
  const subject = readField(row, 'wr_subject');
  const content = readField(row, 'wr_content');
  const combined = `${subject}\n${content}`;

  if (mapping.legacyBoard === 'z5_4' && /회원\s*(명부|명단|정보|주소록|연락처)|주소록|명부/.test(combined)) {
    return 'possible-member-directory';
  }

  return '';
}

export function extractScheduleDates(subject) {
  const match = String(subject ?? '').match(/\[(\d{8})(?:\s*~\s*(\d{8}))?\]/);

  if (!match) {
    return { startDate: '', endDate: '' };
  }

  const startDate = normalizeDateToken(match[1]);
  const endDate = normalizeDateToken(match[2] || match[1]);

  return { startDate, endDate };
}

export function mapLegacyPostRow(legacyBoard, row) {
  const mapping = getLegacyBoardMapping(legacyBoard);
  const legacyPostId = readField(row, 'wr_id');

  if (mapping.target === 'exclude' || mapping.target === 'intro') {
    return {
      legacyBoard,
      legacyPostId,
      targetBoard: mapping.target,
      reason: mapping.reason || mapping.introSection,
      fields: null,
    };
  }

  const { startDate, endDate } = mapping.target === 'news' && mapping.category === '행사'
    ? extractScheduleDates(readField(row, 'wr_subject'))
    : { startDate: '', endDate: '' };
  const reviewReason = detectManualReviewReason(mapping, row);

  const fields = {
    wr_num: readField(row, 'wr_num', legacyPostId ? `-${legacyPostId}` : '0'),
    wr_reply: readField(row, 'wr_reply'),
    wr_parent: readField(row, 'wr_parent', legacyPostId),
    wr_is_comment: readField(row, 'wr_is_comment', '0'),
    wr_comment: readField(row, 'wr_comment', '0'),
    wr_comment_reply: readField(row, 'wr_comment_reply'),
    ca_name: mapping.target === 'news' ? mapping.category : readField(row, 'ca_name'),
    wr_option: readField(row, 'wr_option'),
    wr_subject: readField(row, 'wr_subject'),
    wr_content: readField(row, 'wr_content'),
    wr_seo_title: '',
    wr_link1: readField(row, 'wr_link1'),
    wr_link2: readField(row, 'wr_link2'),
    wr_link1_hit: readField(row, 'wr_link1_hit', '0'),
    wr_link2_hit: readField(row, 'wr_link2_hit', '0'),
    wr_hit: readField(row, 'wr_hit', '0'),
    wr_good: readField(row, 'wr_good', '0'),
    wr_nogood: readField(row, 'wr_nogood', '0'),
    mb_id: readField(row, 'mb_id'),
    wr_password: readField(row, 'wr_password'),
    wr_name: readField(row, 'wr_name'),
    wr_email: readField(row, 'wr_email'),
    wr_homepage: readField(row, 'wr_homepage'),
    wr_datetime: readField(row, 'wr_datetime'),
    wr_file: readField(row, 'wr_file', '0'),
    wr_last: readField(row, 'wr_last', readField(row, 'wr_datetime')),
    wr_ip: readField(row, 'wr_ip'),
    wr_facebook_user: readField(row, 'wr_facebook_user'),
    wr_twitter_user: readField(row, 'wr_twitter_user'),
    wr_1: mapping.groupSlug || '',
    wr_2: mapping.visibility || 'member',
    wr_3: startDate,
    wr_4: endDate,
    wr_5: legacyBoard,
    wr_6: legacyPostId,
    wr_7: reviewReason ? 'review_required' : '',
    wr_8: reviewReason,
    wr_9: '',
    wr_10: '',
  };

  return {
    legacyBoard,
    legacyPostId,
    targetBoard: mapping.target,
    fields,
  };
}

export function buildPostInsertSql(mappedPost, { tablePrefix = 'g5_' } = {}) {
  if (!mappedPost?.fields) {
    throw new Error('mappedPost must contain fields');
  }

  const columns = INSERT_FIELDS.map((field) => `\`${field}\``).join(', ');
  const values = INSERT_FIELDS.map((field) => `'${escapeSqlString(mappedPost.fields[field])}'`).join(', ');

  return `INSERT INTO \`${tablePrefix}write_${mappedPost.targetBoard}\` (${columns}) VALUES (${values});`;
}
