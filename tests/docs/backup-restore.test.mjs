import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

function expectIncludes(source, expected, context) {
  assert.match(
    source,
    new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    `${context} should include ${expected}`,
  );
}

describe('backup restore operating handoff', () => {
  it('requires checksum evidence and rollback ownership for restore drills', () => {
    const source = readFileSync('docs/operations/backup-and-restore.md', 'utf8');

    for (const expected of [
      'Get-FileHash -Algorithm SHA256',
      '.sha256',
      'rehearsal-summary.json',
      'blockedRecords',
      'wr_7=review_required',
      'z6_2',
      'z6_3',
      'redirect',
      '복구 담당자',
      '검수일',
      '통과',
      '보류',
      'rollback',
      'backups/',
      '/renewal/data',
      'www/data',
    ]) {
      expectIncludes(source, expected, 'docs/operations/backup-and-restore.md');
    }
  });

  it('links backup restore rules from deployment handoff docs', () => {
    for (const path of ['README.md', 'docs/operations/cafe24-deployment.md']) {
      const source = readFileSync(path, 'utf8');
      expectIncludes(source, 'docs/operations/backup-and-restore.md', path);
    }
  });
});
