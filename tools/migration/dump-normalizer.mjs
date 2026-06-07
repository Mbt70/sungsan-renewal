import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export function decodeLegacyDump(buffer, sourceEncoding = 'euc-kr') {
  return new TextDecoder(sourceEncoding).decode(buffer);
}

export function normalizeSqlDump(sql) {
  return sql
    .replace(/SET\s+NAMES\s+euckr/gi, 'SET NAMES utf8mb4')
    .replace(/CHARSET=euckr/gi, 'CHARSET=utf8mb4')
    .replace(/CHARACTER\s+SET\s+euckr/gi, 'CHARACTER SET utf8mb4')
    .replace(/COLLATE\s+euckr_korean_ci/gi, 'COLLATE utf8mb4_unicode_ci');
}

export async function normalizeDumpFile({ input, output, sourceEncoding = 'euc-kr' }) {
  const buffer = await readFile(input);
  const decoded = decodeLegacyDump(buffer, sourceEncoding);
  const normalized = normalizeSqlDump(decoded);
  await writeFile(output, normalized, 'utf8');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [, , input, output, sourceEncoding = 'euc-kr'] = process.argv;

  if (!input || !output) {
    console.error('Usage: node tools/migration/dump-normalizer.mjs <input.sql> <output.sql> [sourceEncoding]');
    process.exit(1);
  }

  await normalizeDumpFile({ input, output, sourceEncoding });
  console.log(`Normalized ${input} -> ${output}`);
}
