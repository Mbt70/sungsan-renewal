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

  it('requires evidence notes for external-only staging checks', () => {
    const checklist = readFileSync(checklistPath, 'utf8');

    for (const expected of [
      '증거',
      '화면 캡처',
      '명령 출력',
      '테스트 계정',
      '보류 사유',
      '재검수 담당자',
      '재검수일',
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

  it('documents operator-managed Sungsan group label overrides', () => {
    const deployment = readFileSync('docs/operations/cafe24-deployment.md', 'utf8');
    const checklist = readFileSync(checklistPath, 'utf8');
    const backup = readFileSync('docs/operations/backup-and-restore.md', 'utf8');

    for (const expected of [
      'data/sungsan.groups.php',
      '소속',
      'slug',
      'return array',
      checklistPath,
    ]) {
      expectIncludes(deployment, expected, 'docs/operations/cafe24-deployment.md');
    }

    for (const expected of ['data/sungsan.groups.php', '소속', 'slug']) {
      expectIncludes(checklist, expected, checklistPath);
      expectIncludes(backup, expected, 'docs/operations/backup-and-restore.md');
    }
  });

  it('documents operator-managed news category labels from board settings', () => {
    const deployment = readFileSync('docs/operations/cafe24-deployment.md', 'utf8');
    const checklist = readFileSync(checklistPath, 'utf8');

    for (const expected of [
      'bo_category_list',
      '공지|행사|자료|규정|활동소식',
      '소식 종류',
      '작성/목록',
    ]) {
      expectIncludes(deployment, expected, 'docs/operations/cafe24-deployment.md');
      expectIncludes(checklist, expected, checklistPath);
    }
  });

  it('documents that board-managed news categories drive home summary links', () => {
    const deployment = readFileSync('docs/operations/cafe24-deployment.md', 'utf8');
    const checklist = readFileSync(checklistPath, 'utf8');

    for (const expected of [
      '홈 요약 링크',
      '최근 공지',
      '다가오는 일정',
      '자료와 규정',
      '활동소식 보기',
    ]) {
      expectIncludes(deployment, expected, 'docs/operations/cafe24-deployment.md');
      expectIncludes(checklist, expected, checklistPath);
    }
  });

  it('documents official news comments and free-board community comment checks', () => {
    const checklist = readFileSync(checklistPath, 'utf8');

    for (const expected of [
      '`news` 게시판 상세는 댓글 UI를 노출하지 않고 의견 수렴은 `free` 게시판에서 처리함',
      '`free` 게시판 상세에서 회원 댓글 작성/답글/수정/삭제 UX가 동작함',
    ]) {
      expectIncludes(checklist, expected, checklistPath);
    }
  });
});
