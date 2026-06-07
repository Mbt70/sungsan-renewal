import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

describe('README release handoff instructions', () => {
  it('documents release zip creation and SHA256 verification', () => {
    const source = readFileSync('README.md', 'utf8');

    for (const expected of [
      'scripts/build-release.ps1',
      'release/sungsan-site-YYYYMMDD-HHMMSS.zip',
      '.sha256',
      'Get-FileHash -Algorithm SHA256',
      'docs/operations/cafe24-deployment.md',
    ]) {
      assert.match(source, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
});
