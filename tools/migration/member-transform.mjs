import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { mapLegacyMemberLevel } from './legacy-map.mjs';

const MEMBER_INSERT_FIELDS = Object.freeze([
  'mb_id',
  'mb_password',
  'mb_name',
  'mb_nick',
  'mb_nick_date',
  'mb_email',
  'mb_homepage',
  'mb_level',
  'mb_sex',
  'mb_birth',
  'mb_tel',
  'mb_hp',
  'mb_certify',
  'mb_adult',
  'mb_dupinfo',
  'mb_zip1',
  'mb_zip2',
  'mb_addr1',
  'mb_addr2',
  'mb_addr3',
  'mb_addr_jibeon',
  'mb_signature',
  'mb_recommend',
  'mb_point',
  'mb_today_login',
  'mb_login_ip',
  'mb_datetime',
  'mb_ip',
  'mb_leave_date',
  'mb_intercept_date',
  'mb_email_certify',
  'mb_email_certify2',
  'mb_memo',
  'mb_lost_certify',
  'mb_mailling',
  'mb_sms',
  'mb_open',
  'mb_profile',
  'mb_memo_call',
  'mb_1',
  'mb_2',
  'mb_3',
  'mb_4',
  'mb_5',
  'mb_6',
  'mb_7',
  'mb_8',
  'mb_9',
  'mb_10',
]);

function escapeSqlString(value) {
  return String(value ?? '').replaceAll("'", "''");
}

function readField(row, key, fallback = '') {
  const value = row?.[key];
  return value === undefined || value === null ? fallback : String(value);
}

function normalizeMemberId(value, fallbackSeed) {
  const sanitized = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);

  if (sanitized) {
    return sanitized;
  }

  return `legacy_${String(fallbackSeed || 'member').replace(/[^0-9a-zA-Z_]+/g, '_')}`.slice(0, 20);
}

export function mapLegacyMemberRow(row) {
  const legacyMemberId = readField(row, 'mb_id');
  const legacyMemberNo = readField(row, 'mb_no', legacyMemberId);
  const name = readField(row, 'mb_name', legacyMemberId);
  const nick = readField(row, 'mb_nick') || name || legacyMemberId;
  const emailCertify = readField(row, 'mb_email_certify');

  const fields = {
    mb_id: normalizeMemberId(legacyMemberId, legacyMemberNo),
    mb_password: '',
    mb_name: name,
    mb_nick: nick,
    mb_nick_date: readField(row, 'mb_nick_date'),
    mb_email: readField(row, 'mb_email'),
    mb_homepage: readField(row, 'mb_homepage'),
    mb_level: String(mapLegacyMemberLevel(readField(row, 'mb_level'))),
    mb_sex: readField(row, 'mb_sex'),
    mb_birth: readField(row, 'mb_birth'),
    mb_tel: readField(row, 'mb_tel'),
    mb_hp: readField(row, 'mb_hp'),
    mb_certify: readField(row, 'mb_certify'),
    mb_adult: readField(row, 'mb_adult', '0'),
    mb_dupinfo: readField(row, 'mb_dupinfo'),
    mb_zip1: readField(row, 'mb_zip1'),
    mb_zip2: readField(row, 'mb_zip2'),
    mb_addr1: readField(row, 'mb_addr1'),
    mb_addr2: readField(row, 'mb_addr2'),
    mb_addr3: readField(row, 'mb_addr3'),
    mb_addr_jibeon: readField(row, 'mb_addr_jibeon'),
    mb_signature: readField(row, 'mb_signature'),
    mb_recommend: readField(row, 'mb_recommend'),
    mb_point: readField(row, 'mb_point', '0'),
    mb_today_login: readField(row, 'mb_today_login'),
    mb_login_ip: readField(row, 'mb_login_ip'),
    mb_datetime: readField(row, 'mb_datetime'),
    mb_ip: readField(row, 'mb_ip'),
    mb_leave_date: readField(row, 'mb_leave_date'),
    mb_intercept_date: readField(row, 'mb_intercept_date'),
    mb_email_certify: emailCertify,
    mb_email_certify2: readField(row, 'mb_email_certify2'),
    mb_memo: readField(row, 'mb_memo'),
    mb_lost_certify: readField(row, 'mb_lost_certify'),
    mb_mailling: readField(row, 'mb_mailling', '0'),
    mb_sms: readField(row, 'mb_sms', '0'),
    mb_open: readField(row, 'mb_open', '0'),
    mb_profile: readField(row, 'mb_profile'),
    mb_memo_call: readField(row, 'mb_memo_call'),
    mb_1: 'legacy_member',
    mb_2: legacyMemberNo,
    mb_3: 'password_reset_required',
    mb_4: readField(row, 'mb_4'),
    mb_5: readField(row, 'mb_5'),
    mb_6: readField(row, 'mb_6'),
    mb_7: readField(row, 'mb_7'),
    mb_8: readField(row, 'mb_8'),
    mb_9: readField(row, 'mb_9'),
    mb_10: readField(row, 'mb_10'),
  };

  return {
    legacyMemberId,
    legacyMemberNo,
    fields,
  };
}

export function buildMemberInsertSql(mappedMember, { tablePrefix = 'g5_' } = {}) {
  if (!mappedMember?.fields) {
    throw new Error('mappedMember must contain fields');
  }

  const columns = MEMBER_INSERT_FIELDS.map((field) => `\`${field}\``).join(', ');
  const values = MEMBER_INSERT_FIELDS
    .map((field) => `'${escapeSqlString(mappedMember.fields[field])}'`)
    .join(', ');
  const updates = MEMBER_INSERT_FIELDS
    .filter((field) => field !== 'mb_id')
    .map((field) => `\`${field}\` = VALUES(\`${field}\`)`)
    .join(', ');

  return `INSERT INTO \`${tablePrefix}member\` (${columns}) VALUES (${values}) ON DUPLICATE KEY UPDATE ${updates};`;
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
  const [, , inputPath, outputPath, tablePrefix = 'g5_'] = process.argv;

  if (!inputPath || !outputPath) {
    console.error('Usage: node tools/migration/member-transform.mjs <members.json|jsonl> <output.sql> [tablePrefix]');
    process.exit(1);
  }

  const rows = parseInputRows(await readFile(inputPath, 'utf8'));
  const output = rows
    .map(mapLegacyMemberRow)
    .map((member) => buildMemberInsertSql(member, { tablePrefix }))
    .join('\n');

  await writeFile(outputPath, `${output}\n`, 'utf8');
  console.log(`Wrote ${rows.length} member inserts to ${outputPath}`);
}
