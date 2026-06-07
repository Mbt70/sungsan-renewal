import { LEGACY_BOARD_MAP } from './legacy-map.mjs';

const format = process.argv.includes('--csv') ? 'csv' : 'json';

if (format === 'csv') {
  const rows = [
    ['legacyBoard', 'legacyName', 'target', 'category', 'groupSlug', 'visibility', 'introSection', 'reason'],
    ...Object.values(LEGACY_BOARD_MAP).map((item) => [
      item.legacyBoard,
      item.legacyName,
      item.target,
      item.category ?? '',
      item.groupSlug ?? '',
      item.visibility,
      item.introSection ?? '',
      item.reason ?? '',
    ]),
  ];

  console.log(rows.map((row) => row.map(csvEscape).join(',')).join('\n'));
} else {
  console.log(JSON.stringify(LEGACY_BOARD_MAP, null, 2));
}

function csvEscape(value) {
  const text = String(value ?? '');

  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

