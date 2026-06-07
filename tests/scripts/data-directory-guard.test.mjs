import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const templatePath = path.join(process.cwd(), 'docs', 'operations', 'data-htaccess-template.txt');

function readText(relativePath) {
  return readFileSync(path.join(process.cwd(), ...relativePath), 'utf8');
}

describe('data directory execution guard', () => {
  it('provides a Cafe24 htaccess template that blocks script execution in /data', () => {
    assert.ok(
      existsSync(templatePath),
      'docs/operations/data-htaccess-template.txt must document the /data/.htaccess guard',
    );

    const source = readFileSync(templatePath, 'utf8');

    assert.match(source, /Options\s+-Indexes/);
    assert.match(source, /RemoveHandler\s+.*\.php.*\.phtml.*\.phar.*\.cgi.*\.pl/s);
    assert.match(source, /RemoveType\s+.*\.php.*\.phtml.*\.phar.*\.cgi.*\.pl/s);
    assert.match(source, /php_flag\s+engine\s+off/);
    assert.match(source, /FilesMatch\s+"\\\.\(php\|phtml\|php\[0-9\]\?\|phar\|cgi\|pl\|asp\|aspx\|jsp\|jspx\|html\?\|shtml\|js\|mjs\|svg\|svgz\)\$"/);
    assert.match(source, /Require\s+all\s+denied/);
    assert.match(source, /Deny\s+from\s+all/);
  });

  it('requires operators to install the guard after GnuBoard creates /data', () => {
    const runbook = readText(['docs', 'operations', 'cafe24-deployment.md']);
    const checklist = readText(['docs', 'operations', 'security-checklist.md']);

    for (const source of [runbook, checklist]) {
      assert.match(source, /data-htaccess-template\.txt/);
      assert.match(source, /data\/\.htaccess/);
    }
  });
});
