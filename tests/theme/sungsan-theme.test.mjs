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

  it('keeps the login skin focused on Sungsan membership, not commerce flows', () => {
    const source = read('src/skin/member/sungsan/login.skin.php');

    for (const forbidden of ['비회원 구매', '비회원 주문조회', '상품구입', 'orderform.php', 'orderinquiry.php']) {
      assert.doesNotMatch(source, new RegExp(forbidden), `login skin should not include ${forbidden}`);
    }

    assert.match(source, /성산회 회원 로그인/);
    assert.match(source, /회원가입/);
    assert.match(source, /아이디\/비밀번호 찾기/);
    assert.match(source, /flogin_submit/);
  });

  it('keeps registration consent copy aligned with Sungsan communications', () => {
    const source = [
      read('src/skin/member/sungsan/register.skin.php'),
      read('src/skin/member/sungsan/register_form.skin.php'),
    ].join('\n');

    for (const forbidden of ['상품/서비스', '사은/판촉행사', '프로모션', '맞춤형 혜택', '고객서비스', 'CS대응']) {
      assert.doesNotMatch(source, new RegExp(forbidden), `registration consent should not include ${forbidden}`);
    }

    assert.match(source, /성산회 소식과 행사 안내/);
    assert.match(source, /회 운영 안내/);
    assert.match(source, /회원 관리와 회 운영 안내/);
  });

  it('keeps board skins free of inline styles and emoji-only cues', () => {
    for (const file of [
      'src/skin/board/sungsan_news/list.skin.php',
      'src/skin/board/sungsan_news/view.skin.php',
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_news/download.head.skin.php',
      'src/skin/board/sungsan_news/write_update.head.skin.php',
      'src/skin/board/sungsan_free/list.skin.php',
      'src/skin/board/sungsan_free/view.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
      'src/skin/board/sungsan_free/write_update.head.skin.php',
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

  it('renders home media posts with GnuBoard thumbnails when available', () => {
    const extend = read('src/extend/sungsan.php');
    const index = read('src/theme/sungsan/index.php');
    const css = read('src/scss/main.scss');

    assert.match(extend, /get_list_thumbnail\(\$board_id,\s*\$row\['wr_id'\]/);
    assert.match(extend, /thumb_src/);
    assert.match(index, /'thumbnail'\s*=>\s*true/);
    assert.match(index, /<img class="ss-media-thumb"/);
    assert.match(index, /loading="lazy"/);
    assert.match(css, /object-fit:\s*cover/);
  });

  it('guards news attachment downloads with per-post visibility', () => {
    const file = 'src/skin/board/sungsan_news/download.head.skin.php';

    assert.equal(existsSync(path.join(repoRoot, file)), true, `${file} should exist`);

    const source = read(file);
    const extend = read('src/extend/sungsan.php');

    assert.match(source, /\$write\['wr_2'\]/);
    assert.match(source, /sungsan_can_read_news_post\(\$write\)/);
    assert.match(source, /sungsan_get_visibility_label\(\$visibility\)/);
    assert.match(source, /login\.php/);
    assert.match(source, /get_pretty_url\(\$bo_table,\s*\$wr_id\)/);
    assert.match(source, /alert\(/);
    assert.match(extend, /sungsan_can_read_visibility\(\$visibility\)/);
  });

  it('preserves migrated news audit metadata when posts are edited', () => {
    const source = read('src/skin/board/sungsan_news/write.skin.php');

    for (const field of ['wr_5', 'wr_6', 'wr_7', 'wr_8']) {
      assert.match(source, new RegExp(`name="${field}"`));
      assert.match(source, new RegExp(`\\$write\\['${field}'\\]`));
    }
  });

  it('keeps review-required migrated news hidden from non-admin readers', () => {
    const extend = read('src/extend/sungsan.php');
    const list = read('src/skin/board/sungsan_news/list.skin.php');
    const view = read('src/skin/board/sungsan_news/view.skin.php');
    const download = read('src/skin/board/sungsan_news/download.head.skin.php');

    assert.match(extend, /function sungsan_is_review_restricted/);
    assert.match(extend, /function sungsan_can_read_news_post/);
    assert.match(extend, /wr_7/);
    assert.match(extend, /review_required/);
    assert.match(extend, /wr_7 <> 'review_required'/);

    assert.match(list, /sungsan_can_read_news_post\(\$list\[\$i\]\)/);
    assert.match(view, /sungsan_can_read_news_post\(\$view\)/);
    assert.match(download, /sungsan_can_read_news_post\(\$write\)/);
  });

  it('blocks executable or browser-active board upload extensions before storage', () => {
    const extend = read('src/extend/sungsan.php');

    assert.match(extend, /function sungsan_reject_blocked_uploads/);
    for (const extension of ['php', 'html', 'js', 'svg']) {
      assert.match(extend, new RegExp(`'${extension}'`));
    }

    for (const file of [
      'src/skin/board/sungsan_news/write_update.head.skin.php',
      'src/skin/board/sungsan_free/write_update.head.skin.php',
    ]) {
      const source = read(file);
      assert.match(source, /sungsan_reject_blocked_uploads\(\$_FILES\)/);
      assert.match(source, /alert\(/);
    }
  });
});
