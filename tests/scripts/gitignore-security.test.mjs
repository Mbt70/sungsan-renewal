import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

function gitignoreLines() {
  return readFileSync('.gitignore', 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

describe('sensitive local artifact git exclusions', () => {
  it('excludes backups dumps and deployment secrets from version control', () => {
    const lines = gitignoreLines();

    for (const pattern of [
      '.env',
      '.env.*',
      'data/',
      'db/',
      'backups/',
      '*.sql',
      '*.sql.gz',
      '*.sql.zip',
      '*.dump',
      '*.dump.gz',
      '*.bak',
      '*.tar.gz',
      '*.tgz',
      '*.7z',
      '*.pem',
      '*.key',
      '*.ppk',
      '*.p12',
      'secrets/',
      'deploy.env',
      'cafe24*.env',
      'sftp*.json',
    ]) {
      assert.ok(lines.includes(pattern), `.gitignore should exclude ${pattern}`);
    }

    assert.ok(lines.includes('!.env.example'), '.env.example should remain commit-safe');
    assert.ok(lines.includes('!docs/generated/sungsan-setup.sql'), 'generated setup SQL should remain tracked');
  });

  it('documents the same backup and deployment secret exclusions for operators', () => {
    const checklist = readFileSync('docs/operations/security-checklist.md', 'utf8');

    for (const expected of ['.env', '*.sql.zip', '*.dump.gz', '*.tar.gz', '*.pem', '*.key', 'deploy.env', 'cafe24*.env', 'sftp*.json']) {
      assert.match(checklist, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
});
