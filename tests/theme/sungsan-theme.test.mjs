import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('sungsan theme static contract', () => {
  it('provides member-facing skins and a mypage entry point', () => {
    for (const file of [
      'src/skin/member/sungsan/login.skin.php',
      'src/skin/member/sungsan/register.skin.php',
      'src/skin/member/sungsan/register_form.skin.php',
      'src/skin/member/sungsan/member_confirm.skin.php',
      'src/skin/member/sungsan/password_lost.skin.php',
      'src/skin/member/sungsan/style.css',
      'src/pages/mypage.php',
    ]) {
      assert.equal(existsSync(path.join(repoRoot, file)), true, `${file} should exist`);
    }
  });

  it('keeps board skins free of inline styles and emoji-only cues', () => {
    for (const file of [
      'src/skin/board/sungsan_news/list.skin.php',
      'src/skin/board/sungsan_news/view.skin.php',
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/list.skin.php',
      'src/skin/board/sungsan_free/view.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);
      assert.doesNotMatch(source, /\sstyle=/, `${file} should use CSS classes instead of inline styles`);
      assert.doesNotMatch(source, /[📌📎]/u, `${file} should not rely on emoji for meaning`);
    }
  });

  it('defines accessibility and responsive utility classes used by custom screens', () => {
    const css = read('src/scss/main.scss');

    for (const selector of [
      ':focus-visible',
      '.ss-page-header',
      '.ss-action-bar',
      '.ss-attachment-list',
      '.ss-member-shell',
      '.ss-media-grid',
      '.ss-review-note',
    ]) {
      assert.match(css, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
});
