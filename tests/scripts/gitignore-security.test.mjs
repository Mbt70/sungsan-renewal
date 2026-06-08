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

  it('keeps the operator security checklist readable in Korean', () => {
    const checklist = readFileSync('docs/operations/security-checklist.md', 'utf8');
    const mojibakePattern = /(?:�|\?[가-힣]|[가-힣]\?|\?{2,}|泥|湲|蹂|濡|鍮|議|怨|寃|洹|臾|醫|珥|釉|誘|媛|遺|沅|뚯|꾩|먯|쒕|볤)/;

    for (const expected of [
      '기본 `admin` ID는 사용하지 않습니다.',
      '`free` 목록은 비회원에게 제목만 보여주되 본문, 작성, 첨부는 회원 이상으로 제한합니다.',
      '`news/free` 서버 허용 확장자는 `jpg/jpeg/png/gif/webp/mp4/mov/webm/pdf/hwp/hwpx/doc/docx/xls/xlsx/ppt/pptx/txt`로 유지합니다.',
      'PHP 오류는 화면에 표시하지 않고 로그로만 남깁니다.',
      '비회원으로 회원 전용 글 본문 접근 차단 확인',
    ]) {
      assert.match(checklist, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }

    assert.doesNotMatch(checklist, mojibakePattern);
  });
});
