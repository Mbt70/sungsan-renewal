import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const source = resolve('src/scss/main.scss');
const target = resolve('src/theme/sungsan/css/sungsan.css');

const css = await readFile(source, 'utf8');
const output = css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
  .trim();

await mkdir(dirname(target), { recursive: true });
await writeFile(target, `${output}\n`, 'utf8');

console.log(`Built ${target}`);
