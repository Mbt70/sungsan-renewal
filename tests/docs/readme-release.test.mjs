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
      '.manifest.json',
      'Get-FileHash -Algorithm SHA256',
      'docs/operations/cafe24-deployment.md',
    ]) {
      assert.match(source, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });

  it('documents redirect exclusions for review-required migration records', () => {
    const source = readFileSync('README.md', 'utf8');

    assert.match(source, /wr_7=review_required/);
    assert.match(source, /redirect CSV\/Apache output/);
  });

  it('documents reproducible setup SQL export inputs', () => {
    const source = readFileSync('README.md', 'utf8');

    assert.match(source, /tools\/setup\/sql_write\.template\.sql/);
    assert.match(source, /GNUBOARD_WRITE_SQL_TEMPLATE/);
    assert.match(source, /www\/adm\/sql_write\.sql/);
  });

  it('documents that release zip is a post-install overlay', () => {
    const readme = readFileSync('README.md', 'utf8');
    const runbook = readFileSync('docs/operations/cafe24-deployment.md', 'utf8');

    for (const source of [readme, runbook]) {
      assert.match(source, /post-install overlay/);
      assert.match(source, /install\/, data\/, shop\//);
      assert.match(source, /data\/dbconfig\.php/);
      assert.match(source, /그누보드 설치를 먼저 완료/);
      assert.match(source, /\.manifest\.json/);
    }
  });

  it('documents remaining external dependency checks before production cutover', () => {
    const source = readFileSync('README.md', 'utf8');

    for (const expected of [
      '남은 외부 의존 작업',
      'PHP와 Docker',
      'scripts/bootstrap-gnuboard.ps1',
      'docker compose build',
      'docker compose up -d',
      'http://localhost:8080',
      '브라우저',
      'Cafe24 스테이징',
      'docs/operations/staging-validation-checklist.md',
    ]) {
      assert.match(source, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
});
