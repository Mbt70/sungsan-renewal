import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const checklistPath = 'docs/operations/staging-validation-checklist.md';

function expectIncludes(source, expected, context) {
  assert.match(
    source,
    new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    `${context} should include ${expected}`,
  );
}

describe('Cafe24 staging validation handoff', () => {
  it('keeps a concrete checklist for external staging verification', () => {
    assert.ok(existsSync(checklistPath), `${checklistPath} should exist`);

    const checklist = readFileSync(checklistPath, 'utf8');

    for (const expected of [
      '담당자',
      '검수일',
      '대기/통과/보류',
      'PHP 8.2',
      'MySQL/MariaDB',
      'HTTPS',
      'HttpOnly',
      'Secure',
      'data/.htaccess',
      'Get-FileHash -Algorithm SHA256',
      '.sha256',
      '375px',
      'news',
      'free',
      '비회원',
      '회원',
      '임원',
      '운영자',
      'PHP/HTML/JS/SVG',
      'wr_7=review_required',
      'z6_2',
      'z6_3',
      'redirect',
    ]) {
      expectIncludes(checklist, expected, checklistPath);
    }
  });

  it('links the staging checklist from operator-facing docs', () => {
    for (const path of ['README.md', 'docs/operations/cafe24-deployment.md']) {
      const source = readFileSync(path, 'utf8');
      expectIncludes(source, checklistPath, path);
    }
  });
});
