import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { writeSetupSqlFile } from './gnuboard-setup.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(repoRoot, 'docs', 'generated', 'sungsan-setup.sql');
const writeSqlTemplatePath = path.join(repoRoot, 'www', 'adm', 'sql_write.sql');

const result = await writeSetupSqlFile({
  outputPath,
  writeSqlTemplatePath,
});

console.log(`Wrote ${result.outputPath}`);
