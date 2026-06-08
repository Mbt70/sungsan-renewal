import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { writeSetupSqlFile } from './gnuboard-setup.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(repoRoot, 'docs', 'generated', 'sungsan-setup.sql');
const writeSqlTemplatePath = process.env.GNUBOARD_WRITE_SQL_TEMPLATE
  ? path.resolve(process.env.GNUBOARD_WRITE_SQL_TEMPLATE)
  : path.join(repoRoot, 'tools', 'setup', 'sql_write.template.sql');

const result = await writeSetupSqlFile({
  outputPath,
  writeSqlTemplatePath,
});

console.log(`Wrote ${result.outputPath}`);
