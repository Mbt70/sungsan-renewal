import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const gnuboardFormmailSendFixture = 'tests/fixtures/gnuboard/formmail_send.php';

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function phpFilesUnder(relativePath) {
  const root = path.join(repoRoot, relativePath);
  const files = [];

  for (const entry of readdirSync(root)) {
    const absolute = path.join(root, entry);
    const relative = path.join(relativePath, entry).replace(/\\/g, '/');

    if (statSync(absolute).isDirectory()) {
      files.push(...phpFilesUnder(relative));
    } else if (relative.endsWith('.php')) {
      files.push(relative);
    }
  }

  return files;
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

  it('keeps theme-applied member skins on the Sungsan skin for pc and mobile', () => {
    const source = read('src/theme/sungsan/theme.config.php');

    assert.match(source, /'cf_member_skin'\s*=>\s*'sungsan'/);
    assert.match(source, /'cf_mobile_member_skin'\s*=>\s*'sungsan'/);
    assert.doesNotMatch(source, /'cf_member_skin'\s*=>\s*'basic'/);
    assert.doesNotMatch(source, /'cf_mobile_member_skin'\s*=>\s*'basic'/);
  });

  it('escapes mypage action links before rendering member navigation', () => {
    const source = read('src/pages/mypage.php');

    for (const variable of ['edit_url', 'my_posts_url', 'logout_url', 'leave_url']) {
      assert.match(
        source,
        new RegExp(`href="<\\?php echo get_text\\(\\$${variable}\\); \\?>"`),
        `mypage should escape ${variable}`,
      );
      assert.doesNotMatch(
        source,
        new RegExp(`href="<\\?php echo \\$${variable}; \\?>"`),
        `mypage should not render raw ${variable}`,
      );
    }
  });

  it('makes account and password management obvious on mypage', () => {
    const mypage = read('src/pages/mypage.php');
    const css = read('src/scss/main.scss');

    assert.match(mypage, /<nav class="ss-panel ss-member-actions" aria-label="회원 메뉴">/);
    assert.match(mypage, /href="<\?php echo get_text\(\$edit_url\); \?>">내 정보·비밀번호 수정<\/a>/);
    assert.match(
      mypage,
      /<p class="ss-action-help">비밀번호 변경과 회원 탈퇴는 모두 본인 확인 후 진행됩니다\.<\/p>/,
    );
    assert.match(css, /\.ss-member-actions\s*\{[\s\S]*?display:\s*grid/);
    assert.match(css, /\.ss-member-action-buttons\s*\{[\s\S]*?display:\s*flex/);
    assert.match(css, /\.ss-action-help\s*\{/);
  });

  it('renders mypage last login as a semantic time when present', () => {
    const mypage = read('src/pages/mypage.php');

    assert.match(mypage, /\$sungsan_mypage_last_login = isset\(\$member\['mb_today_login'\]\) \? \$member\['mb_today_login'\] : '';/);
    assert.ok(mypage.includes("$sungsan_mypage_last_login_attr = ($sungsan_mypage_last_login !== '' && $sungsan_mypage_last_login !== '0000-00-00 00:00:00' && preg_match('/^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$/', $sungsan_mypage_last_login)) ? str_replace(' ', 'T', $sungsan_mypage_last_login) : '';"));
    assert.match(mypage, /<\?php if \(\$sungsan_mypage_last_login_attr !== ''\) \{ \?>\s*<time datetime="<\?php echo get_text\(\$sungsan_mypage_last_login_attr\); \?>"><\?php echo get_text\(\$sungsan_mypage_last_login\); \?><\/time>/);
    assert.match(mypage, /<\?php \} else \{ \?>\s*기록 없음\s*<\?php \} \?>/);
    assert.doesNotMatch(mypage, /<dd><\?php echo get_text\(isset\(\$member\['mb_today_login'\]\) \? \$member\['mb_today_login'\] : ''\); \?><\/dd>/);
  });

  it('exposes member withdrawal from mypage through password confirmation', () => {
    const mypage = read('src/pages/mypage.php');
    const confirm = read('src/skin/member/sungsan/member_confirm.skin.php');

    assert.match(mypage, /\$leave_url = G5_BBS_URL\.'\/member_confirm\.php\?url=member_leave\.php';/);
    assert.match(mypage, /href="<\?php echo get_text\(\$leave_url\); \?>">회원 탈퇴<\/a>/);
    assert.match(
      mypage,
      /비밀번호 변경과 회원 탈퇴는 모두 본인 확인 후 진행됩니다\./,
    );
    assert.match(confirm, /\$url == 'member_leave\.php'/);
    assert.match(confirm, /비밀번호를 입력하시면 회원탈퇴가 완료됩니다\./);
  });

  it('shows a recent own-post list on mypage using news and free boards', () => {
    const mypage = read('src/pages/mypage.php');
    const extend = read('src/extend/sungsan.php');

    assert.match(extend, /function sungsan_member_recent_posts\(\$member_id,\s*\$limit = 5\)/);
    assert.match(extend, /SUNGSAN_NEWS_BOARD\s*=>\s*'소식'/);
    assert.match(extend, /SUNGSAN_FREE_BOARD\s*=>\s*'자유게시판'/);
    assert.match(extend, /mb_id/);
    assert.match(extend, /sql_escape_string\(\$member_id\)/);
    assert.match(extend, /usort\(\$posts,/);
    assert.match(extend, /array_slice\(\$posts,\s*0,\s*\$limit\)/);

    assert.match(mypage, /\$recent_posts = function_exists\('sungsan_member_recent_posts'\) \? sungsan_member_recent_posts\(\$member\['mb_id'\],\s*5\) : array\(\);/);
    assert.match(mypage, /<section class="ss-panel ss-member-posts">/);
    assert.match(mypage, /<h2>내가 쓴 글<\/h2>/);
    assert.match(mypage, /for \(\$i = 0; \$i < count\(\$recent_posts\); \$i\+\+\)/);
    assert.match(mypage, /href="<\?php echo get_text\(\$recent_posts\[\$i\]\['href'\]\); \?>"/);
    assert.match(mypage, /get_text\(\$recent_posts\[\$i\]\['board_label'\]\)/);
    assert.match(mypage, /get_text\(\$recent_posts\[\$i\]\['subject'\]\)/);
    assert.match(mypage, /get_text\(\$recent_posts\[\$i\]\['date'\]\)/);
    assert.match(mypage, /아직 작성한 글이 없습니다\./);
  });

  it('keeps mypage recent news aligned with role-based visibility levels', () => {
    const extend = read('src/extend/sungsan.php');

    assert.match(extend, /function sungsan_member_recent_posts\(\$member_id,\s*\$limit = 5\)/);
    assert.match(extend, /\$level = isset\(\$member\['mb_level'\]\) \? \(int\) \$member\['mb_level'\] : 0;/);
    assert.match(extend, /if \(!\$is_admin && \$level < 2\) \{[\s\S]*?\(wr_2 = 'public' or wr_2 = ''\)/);
    assert.match(extend, /elseif \(!\$is_admin && \$level < 6\) \{[\s\S]*?\(wr_2 in \('public', 'member'\) or wr_2 = ''\)/);
    assert.match(extend, /elseif \(!\$is_admin && \$level < 10\) \{[\s\S]*?\(wr_2 in \('public', 'member', 'officer'\) or wr_2 = ''\)/);
  });

  it('keeps footer notices reachable from shared navigation', () => {
    const source = read('src/theme/sungsan/tail.php');

    assert.match(source, /<footer class="ss-site-footer">/);
    assert.match(source, /href="#email-collection-refusal"/);
    assert.match(source, /id="email-collection-refusal"/);
    assert.match(source, /이메일 주소 무단수집을 거부합니다/);
    for (const variable of [
      'ss_footer_home_url',
      'ss_footer_intro_url',
      'ss_footer_news_url',
      'ss_footer_free_url',
      'ss_footer_qalist_url',
    ]) {
      assert.match(source, new RegExp(`\\$${variable} = `), `footer should define ${variable}`);
      assert.match(
        source,
        new RegExp(`href="<\\?php echo get_text\\(\\$${variable}\\); \\?>"`),
        `footer should escape ${variable}`,
      );
    }
    assert.doesNotMatch(source, /href="<\?php echo G5_URL; \?>/);
    assert.doesNotMatch(source, /href="<\?php echo G5_BBS_URL; \?>/);
    assert.match(source, />관리 문의<\/a>/);
  });

  it('shows a visible label for the compact header search', () => {
    const head = read('src/theme/sungsan/head.php');
    const css = read('src/scss/main.scss');

    assert.match(head, /<form class="ss-search-form" method="get" action="<\?php echo get_text\(\$ss_search_action_url\); \?>">/);
    assert.match(head, /<input type="hidden" name="bo_table" value="news">/);
    assert.doesNotMatch(head, /\/search\.php/);
    assert.match(head, /<label class="ss-search-label" for="ss_stx">소식 검색<\/label>/);
    assert.doesNotMatch(head, /<label class="sound_only" for="ss_stx">/);
    assert.match(head, /<div class="ss-search-row">[\s\S]*?<input id="ss_stx" name="stx" type="search"/);
    assert.match(css, /\.ss-search-label\s*\{/);
    assert.match(css, /\.ss-search-form\s*\{[\s\S]*?display:\s*grid/);
    assert.match(css, /\.ss-search-form\s+\.ss-search-row\s*\{/);
  });

  it('connects the skip link to a keyboard-focusable main landmark', () => {
    const head = read('src/theme/sungsan/head.php');
    const css = read('src/scss/main.scss');

    assert.match(head, /<a href="#container" class="ss-skip-link">/);
    assert.match(head, /<main id="container" tabindex="-1">/);
    assert.doesNotMatch(head, /<main id="container">/);
    assert.match(css, /\.ss-skip-link\s*\{/);
    assert.match(css, /\.ss-skip-link:focus,\s*\n\.ss-skip-link:focus-visible\s*\{/);
  });

  it('uses the shared responsive Sungsan header on mobile', () => {
    const head = read('src/theme/sungsan/head.php');

    assert.doesNotMatch(head, /G5_THEME_MOBILE_PATH/);
    assert.doesNotMatch(head, /G5_IS_MOBILE[\s\S]*?return;/);
    assert.match(head, /<header class="ss-site-header">/);
    assert.match(head, /<main id="container" tabindex="-1">/);
  });

  it('preserves and escapes the compact header search term', () => {
    const head = read('src/theme/sungsan/head.php');
    const inputLine = head.split('\n').find((line) => line.includes('id="ss_stx"'));

    assert.match(head, /\$ss_header_search_value = isset\(\$stx\) \? stripslashes\(\$stx\) : '';/);
    assert.match(head, /<input id="ss_stx" name="stx" type="search" value="<\?php echo get_text\(\$ss_header_search_value\); \?>"/);
    assert.ok(inputLine, 'header should render the compact search input');
    assert.doesNotMatch(inputLine, /placeholder=/);
    assert.doesNotMatch(head, /value="<\?php echo \$stx; \?>"/);
  });

  it('requests the search action on mobile keyboards for compact header search', () => {
    const head = read('src/theme/sungsan/head.php');
    const inputLine = head.split('\n').find((line) => line.includes('id="ss_stx"'));

    assert.ok(inputLine, 'header should render the compact search input');
    assert.match(inputLine, /name="stx"/);
    assert.match(inputLine, /type="search"/);
    assert.match(inputLine, /enterkeyhint="search"/);
  });

  it('escapes shared header navigation and search URLs before rendering attributes', () => {
    const head = read('src/theme/sungsan/head.php');

    assert.match(head, /\$ss_site_title = \(isset\(\$config\['cf_title'\]\) && \$config\['cf_title'\] !== ''\) \? \$config\['cf_title'\] : '성산회';/);
    assert.match(head, /<span><\?php echo get_text\(\$ss_site_title\); \?><\/span>/);
    assert.doesNotMatch(head, /\$config\['cf_title'\] \? \$config\['cf_title'\]/);

    for (const variable of [
      'ss_home_url',
      'ss_intro_url',
      'ss_news_url',
      'ss_free_url',
      'ss_search_action_url',
      'ss_mypage_url',
    ]) {
      assert.match(head, new RegExp(`\\$${variable} = `), `header should define ${variable}`);
      assert.match(
        head,
        new RegExp(`(?:href|action)="<\\?php echo get_text\\(\\$${variable}\\); \\?>"`),
        `header should escape ${variable}`,
      );
    }

    assert.doesNotMatch(head, /href="<\?php echo G5_URL; \?>/);
    assert.doesNotMatch(head, /href="<\?php echo G5_BBS_URL; \?>/);
    assert.doesNotMatch(head, /action="<\?php echo G5_BBS_URL; \?>/);
  });

  it('shows a member account icon for the logged-in mypage entry', () => {
    const head = read('src/theme/sungsan/head.php');
    const css = read('src/scss/main.scss');

    assert.match(head, /\$ss_is_member = !empty\(\$is_member\);/);
    assert.match(head, /<\?php if \(\$ss_is_member\) \{ \?>/);
    assert.doesNotMatch(head, /<\?php if \(\$is_member\) \{ \?>/);
    assert.match(
      head,
      /<a class="ss-account-link ss-account-link-member" href="<\?php echo get_text\(\$ss_mypage_url\); \?>"<\?php echo \$ss_is_mypage \? ' aria-current="page"' : ''; \?>>/,
    );
    assert.match(head, /<span class="ss-account-icon" aria-hidden="true"><\/span>\s*<span class="ss-account-text">마이페이지<\/span>/);
    assert.match(css, /\.ss-account-icon\s*\{[\s\S]*?width:\s*24px;[\s\S]*?height:\s*24px;[\s\S]*?border-radius:\s*50%;/);
    assert.match(css, /\.ss-account-icon::before\s*\{[\s\S]*?border-radius:\s*50%;/);
    assert.match(css, /\.ss-account-icon::after\s*\{[\s\S]*?border-radius:\s*999px 999px 0 0;/);
  });

  it('returns guests to the current page after header login', () => {
    const head = read('src/theme/sungsan/head.php');

    assert.match(head, /\$ss_request_uri = isset\(\$_SERVER\['REQUEST_URI'\]\) \? \$_SERVER\['REQUEST_URI'\] : '';/);
    assert.match(head, /\$ss_login_url = sungsan_login_url\(\$ss_request_uri\);/);
    assert.match(head, /<a class="ss-account-link" href="<\?php echo get_text\(\$ss_login_url\); \?>">로그인<\/a>/);
    assert.doesNotMatch(head, /urlencode\(\$_SERVER\['REQUEST_URI'\]\)/);
    assert.doesNotMatch(head, /href="<\?php echo G5_BBS_URL; \?>\/login\.php">로그인<\/a>/);
  });

  it('centralizes member login return URLs through the Sungsan helper', () => {
    const extend = read('src/extend/sungsan.php');
    const head = read('src/theme/sungsan/head.php');
    const index = read('src/theme/sungsan/index.php');
    const mypage = read('src/pages/mypage.php');
    const newsDownload = read('src/skin/board/sungsan_news/download.head.skin.php');
    const newsView = read('src/skin/board/sungsan_news/view.skin.php');
    const freeList = read('src/skin/board/sungsan_free/list.skin.php');
    const freeView = read('src/skin/board/sungsan_free/view.skin.php');
    const freeDownload = read('src/skin/board/sungsan_free/download.head.skin.php');

    assert.match(extend, /function sungsan_login_url\(\$return_url = ''\)/);
    assert.match(extend, /htmlspecialchars_decode\(\$return_url, ENT_QUOTES\)/);
    assert.match(extend, /G5_BBS_URL\.'\/login\.php\?url='\.urlencode\(\$return_url\)/);

    assert.match(head, /\$ss_login_url = sungsan_login_url\(\$ss_request_uri\);/);
    assert.match(index, /\$sungsan_home_post_href = \$sungsan_requires_login \? sungsan_login_url\(\$sungsan_home_post_raw_href\) : \$sungsan_home_post_raw_href;/);
    assert.match(mypage, /\$sungsan_mypage_login_url = sungsan_login_url\(G5_URL\.'\/sungsan\/mypage\.php'\);/);
    assert.match(newsDownload, /\$sungsan_news_download_login_url = sungsan_login_url\(\$sungsan_news_download_return_url\);/);
    assert.match(newsView, /\$sungsan_login_url = sungsan_login_url\(\$sungsan_request_uri\);/);
    assert.match(freeList, /\$sungsan_post_href = \$sungsan_free_is_member \? \$sungsan_free_post_href : sungsan_login_url\(\$sungsan_free_post_href\);/);
    assert.match(freeView, /\$sungsan_free_login_url = sungsan_login_url\(\$sungsan_free_request_uri\);/);
    assert.match(freeDownload, /\$sungsan_free_download_login_url = sungsan_login_url\(\$sungsan_free_download_return_url\);/);

    for (const source of [head, index, mypage, newsDownload, newsView, freeList, freeView, freeDownload]) {
      assert.doesNotMatch(source, /G5_BBS_URL\.'\/login\.php\?url='\.urlencode/);
    }
  });

  it('prevents external login return URLs from becoming open redirects', () => {
    const extend = read('src/extend/sungsan.php');

    assert.match(extend, /function sungsan_url_origin\(\$url\)/);
    assert.match(extend, /parse_url\(\$url\)/);
    assert.match(extend, /function sungsan_sanitize_return_url\(\$return_url\)/);
    assert.match(extend, /htmlspecialchars_decode\(\$return_url, ENT_QUOTES\)/);
    assert.match(extend, /strpos\(\$decoded_return_url, '\/\/'\) === 0/);
    assert.match(extend, /preg_match\('\/\^\[a-z\]\[a-z0-9\+\.\-\]\*:\/i', \$return_url_to_check\)/);
    assert.match(extend, /\$allowed_origins = array_filter\(array\(sungsan_url_origin\(G5_URL\), sungsan_url_origin\(G5_BBS_URL\)\)\);/);
    assert.match(extend, /in_array\(\$return_origin, \$allowed_origins, true\)/);
    assert.match(extend, /return G5_URL;/);
    assert.match(extend, /\$return_url = sungsan_sanitize_return_url\(\$return_url\);/);
    assert.match(extend, /G5_BBS_URL\.'\/login\.php\?url='\.urlencode\(\$return_url\)/);
  });

  it('rejects encoded or backslash-prefixed login return URLs before redirecting', () => {
    const extend = read('src/extend/sungsan.php');

    assert.match(extend, /\$decoded_return_url = rawurldecode\(\$return_url\);/);
    assert.match(extend, /strpos\(\$decoded_return_url, '\\\\'\) !== false/);
    assert.match(extend, /strpos\(\$decoded_return_url, '\/\/'\) === 0/);
    assert.doesNotMatch(extend, /strpos\(\$return_url, '\/\/'\) === 0/);
  });

  it('checks decoded login return URLs for external schemes and nested encoding', () => {
    const extend = read('src/extend/sungsan.php');

    assert.match(extend, /for \(\$i = 0; \$i < 2; \$i\+\+\) \{/);
    assert.match(extend, /\$next_decoded_return_url = rawurldecode\(\$decoded_return_url\);/);
    assert.match(extend, /\$return_url_to_check = preg_match\('\/\^\[a-z\]\[a-z0-9\+\.\-\]\*:\/i', \$decoded_return_url\) \? \$decoded_return_url : \$return_url;/);
    assert.match(extend, /if \(preg_match\('\/\^\[a-z\]\[a-z0-9\+\.\-\]\*:\/i', \$return_url_to_check\)\) \{/);
    assert.match(extend, /\$return_origin = sungsan_url_origin\(\$return_url_to_check\);/);
    assert.match(extend, /return \$return_url_to_check;/);
    assert.doesNotMatch(extend, /if \(preg_match\('\/\^\[a-z\]\[a-z0-9\+\.\-\]\*:\/i', \$return_url\)\) \{/);
  });

  it('keeps board detail URLs raw until the render layer escapes them', () => {
    const extend = read('src/extend/sungsan.php');
    const index = read('src/theme/sungsan/index.php');
    const mypage = read('src/pages/mypage.php');

    assert.match(extend, /function sungsan_board_href\(\$bo_table, \$wr_id = 0\)/);
    assert.match(extend, /\$href = G5_BBS_URL\.'\/board\.php\?bo_table='\.urlencode\(\$bo_table\);/);
    assert.match(extend, /\$href \.= '&wr_id='\.\(int\) \$wr_id;/);
    assert.doesNotMatch(extend, /\$href \.= '&amp;wr_id='/);

    assert.match(index, /href="<\?php echo get_text\(\$sungsan_home_post_href\); \?>"/);
    assert.match(index, /href="<\?php echo get_text\(\$sungsan_home_media_href\); \?>"/);
    assert.match(mypage, /href="<\?php echo get_text\(\$recent_posts\[\$i\]\['href'\]\); \?>"/);
  });

  it('loads operator-managed Sungsan group labels from the data directory', () => {
    const source = read('src/extend/sungsan.php');

    assert.match(source, /function sungsan_load_group_overrides\(\$defaults\)/);
    assert.match(source, /defined\('G5_DATA_PATH'\)/);
    assert.match(source, /\$override_path = G5_DATA_PATH\.'\/sungsan\.groups\.php';/);
    assert.match(source, /is_file\(\$override_path\)/);
    assert.match(source, /\$overrides = include \$override_path;/);
    assert.match(source, /is_array\(\$overrides\)/);
    assert.match(source, /preg_match\('\/\^\[a-z0-9-\]\+\$\/',\s*\$slug\)/);
    assert.match(source, /array_replace\(\$defaults,\s*\$valid_overrides\)/);
    assert.match(source, /\$sungsan_groups = sungsan_load_group_overrides\(\$sungsan_groups\);/);
  });

  it('uses operator-managed news categories from board settings in list and write screens', () => {
    const extend = read('src/extend/sungsan.php');

    assert.match(extend, /function sungsan_get_news_categories\(\$board\)/);
    assert.match(extend, /isset\(\$board\['bo_category_list'\]\)/);
    assert.match(extend, /explode\('\|', \$category_list\)/);
    assert.match(extend, /array_unique\(\$categories\)/);

    for (const file of [
      'src/skin/board/sungsan_news/list.skin.php',
      'src/skin/board/sungsan_news/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /\$sungsan_news_category_options = sungsan_get_news_categories\(isset\(\$board\) \? \$board : array\(\)\);/);
      assert.match(source, /foreach \(\$sungsan_news_category_options as \$category\)/);
      assert.doesNotMatch(source, /foreach \(\$sungsan_news_categories as \$category\)/);
    }
  });

  it('renders news visibility write options from the centralized visibility labels', () => {
    const source = read('src/skin/board/sungsan_news/write.skin.php');

    assert.match(source, /\$sungsan_visibility_options = array\('public', 'member', 'officer'\);/);
    assert.match(source, /foreach \(\$sungsan_visibility_options as \$sungsan_visibility\)/);
    assert.match(source, /<option value="<\?php echo get_text\(\$sungsan_visibility\); \?>"<\?php echo sungsan_selected\(\$visibility, \$sungsan_visibility\); \?>><\?php echo get_text\(sungsan_get_visibility_label\(\$sungsan_visibility\)\); \?><\/option>/);
    assert.doesNotMatch(source, /<option value="public"<\?php echo sungsan_selected\(\$visibility, 'public'\); \?>>/);
    assert.doesNotMatch(source, /<option value="member"<\?php echo sungsan_selected\(\$visibility, 'member'\); \?>>/);
    assert.doesNotMatch(source, /<option value="officer"<\?php echo sungsan_selected\(\$visibility, 'officer'\); \?>>/);
  });

  it('connects news write metadata fields to concise guidance', () => {
    const source = read('src/skin/board/sungsan_news/write.skin.php');

    assert.match(source, /<p id="ss-news-meta-help" class="ss-form-help">/);
    for (const field of ['wr_1', 'wr_2', 'wr_3', 'wr_4']) {
      assert.match(source, new RegExp(`id="${field}"[\\s\\S]*?aria-describedby="ss-news-meta-help"`), `news write should connect ${field} to metadata guidance`);
    }
  });

  it('URL-encodes news board ids before building category filter links', () => {
    const source = read('src/skin/board/sungsan_news/list.skin.php');

    assert.match(source, /\$sungsan_news_board_param = urlencode\(\$sungsan_news_board_id\);/);
    assert.match(source, /\$sungsan_news_list_url = G5_BBS_URL\.'\/board\.php\?bo_table='.\$sungsan_news_board_param.\$sungsan_news_search_query;/);
    assert.match(source, /\$sungsan_category_href = G5_BBS_URL\.'\/board\.php\?bo_table='.\$sungsan_news_board_param\.'&sca='\.urlencode\(\$category\).\$sungsan_news_search_query;/);
    assert.doesNotMatch(source, /\$sungsan_news_board_param = urlencode\(\$bo_table\);/);
    assert.doesNotMatch(source, /\$sungsan_news_list_url = G5_BBS_URL\.'\/board\.php\?bo_table='\.\$bo_table;/);
    assert.doesNotMatch(source, /\$sungsan_category_href = G5_BBS_URL\.'\/board\.php\?bo_table='\.\$bo_table/);
  });

  it('keeps active news search terms when switching category filters', () => {
    const source = read('src/skin/board/sungsan_news/list.skin.php');

    assert.match(source, /\$sungsan_news_search_query = '';/);
    assert.match(source, /if \(\$sungsan_news_search_term !== ''\) \{/);
    assert.match(source, /\$sungsan_news_search_query = '&sfl=wr_subject%7C%7Cwr_content&sop=and&stx='\.urlencode\(\$sungsan_news_search_term\);/);
    assert.match(source, /\$sungsan_news_list_url = G5_BBS_URL\.'\/board\.php\?bo_table='.\$sungsan_news_board_param.\$sungsan_news_search_query;/);
    assert.match(source, /\$sungsan_category_href = G5_BBS_URL\.'\/board\.php\?bo_table='.\$sungsan_news_board_param\.'&sca='\.urlencode\(\$category\).\$sungsan_news_search_query;/);
  });

  it('uses board-managed news categories for home summary queries and filter links', () => {
    const extend = read('src/extend/sungsan.php');
    const index = read('src/theme/sungsan/index.php');

    assert.match(extend, /function sungsan_get_current_news_categories\(\)/);
    assert.match(extend, /select bo_category_list from \{\$g5\['board_table'\]\}/);
    assert.match(extend, /sungsan_get_news_categories\(\$board_row\)/);
    assert.match(extend, /function sungsan_get_news_category_at\(\$categories, \$preferred, \$index\)/);
    assert.match(extend, /function sungsan_get_news_categories_at\(\$categories, \$preferred, \$indexes\)/);

    assert.match(index, /\$sungsan_home_news_categories = sungsan_get_current_news_categories\(\);/);
    assert.match(index, /\$sungsan_home_notice_category = sungsan_get_news_category_at\(\$sungsan_home_news_categories, '공지', 0\);/);
    assert.match(index, /\$sungsan_home_event_category = sungsan_get_news_category_at\(\$sungsan_home_news_categories, '행사', 1\);/);
    assert.match(index, /\$sungsan_home_resource_categories = sungsan_get_news_categories_at\(\$sungsan_home_news_categories, array\('자료', '규정'\), array\(2, 3\)\);/);
    assert.match(index, /urlencode\(\$sungsan_home_notice_category\)/);
    assert.match(index, /urlencode\(\$sungsan_home_event_category\)/);
    assert.match(index, /urlencode\(\$sungsan_home_resource_category\)/);
    assert.match(index, /'category' => \$sungsan_home_notice_category/);
    assert.match(index, /'category' => \$sungsan_home_event_category/);
    assert.match(index, /'category' => \$sungsan_home_resource_categories/);
    assert.doesNotMatch(index, /urlencode\('공지'\)/);
    assert.doesNotMatch(index, /'category' => '공지'/);
  });

  it('marks active news category filters for assistive technology', () => {
    const extend = read('src/extend/sungsan.php');
    const list = read('src/skin/board/sungsan_news/list.skin.php');

    assert.match(extend, /function sungsan_aria_current\(\$current, \$value\)/);
    assert.match(extend, /return \$current === \$value \? ' aria-current="page"' : '';/);
    assert.match(list, /class="ss-chip<\?php echo sungsan_active_class\(\$current_category, ''\); \?>"<\?php echo sungsan_aria_current\(\$current_category, ''\); \?>/);
    assert.match(list, /class="ss-chip<\?php echo sungsan_active_class\(\$current_category, \$category\); \?>"<\?php echo sungsan_aria_current\(\$current_category, \$category\); \?>/);
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

  it('shows visible required markers on login fields', () => {
    const source = read('src/skin/member/sungsan/login.skin.php');

    assert.match(source, /<label for="login_id">아이디 <strong>필수<\/strong><\/label>/);
    assert.match(source, /<label for="login_pw">비밀번호 <strong>필수<\/strong><\/label>/);
    assert.doesNotMatch(source, /id="login_id"[^>]*placeholder=/);
    assert.doesNotMatch(source, /id="login_pw"[^>]*placeholder=/);
    assert.doesNotMatch(source, /<label for="login_id">아이디 <strong class="sound_only">필수<\/strong><\/label>/);
    assert.doesNotMatch(source, /<label for="login_pw">비밀번호 <strong class="sound_only">필수<\/strong><\/label>/);
  });

  it('escapes login account utility links before rendering attributes', () => {
    const source = read('src/skin/member/sungsan/login.skin.php');

    assert.match(source, /\$password_lost_url = G5_BBS_URL\.'\/password_lost\.php';/);
    assert.match(source, /\$register_url = G5_BBS_URL\.'\/register\.php';/);
    assert.match(source, /href="<\?php echo get_text\(\$password_lost_url\); \?>"/);
    assert.match(source, /href="<\?php echo get_text\(\$register_url\); \?>"/);
    assert.doesNotMatch(source, /href="<\?php echo G5_BBS_URL; \?>\/password_lost\.php"/);
    assert.doesNotMatch(source, /href="<\?php echo G5_BBS_URL; \?>\/register\.php"/);
  });

  it('escapes registration navigation URLs before rendering attributes', () => {
    const consent = read('src/skin/member/sungsan/register.skin.php');
    const result = read('src/skin/member/sungsan/register_result.skin.php');

    assert.match(consent, /\$sungsan_register_cancel_url = G5_URL;/);
    assert.match(result, /\$sungsan_register_home_url = G5_URL;/);
    assert.match(consent, /href="<\?php echo get_text\(\$sungsan_register_cancel_url\); \?>" class="btn_close"/);
    assert.match(result, /href="<\?php echo get_text\(\$sungsan_register_home_url\); \?>" class="btn_submit"/);
    assert.doesNotMatch(consent, /href="<\?php echo G5_URL/);
    assert.doesNotMatch(result, /href="<\?php echo G5_URL/);
  });

  it('normalizes registration agreement values before rendering consent text', () => {
    const source = read('src/skin/member/sungsan/register.skin.php');

    assert.match(source, /\$sungsan_register_stipulation = isset\(\$config\['cf_stipulation'\]\) \? \$config\['cf_stipulation'\] : '';/);
    assert.match(source, /\$sungsan_register_cert_enabled = !empty\(\$config\['cf_cert_use'\]\);/);
    assert.match(source, /<textarea readonly><\?php echo get_text\(\$sungsan_register_stipulation\); \?><\/textarea>/);
    assert.match(source, /\$sungsan_register_cert_enabled\) \? ", 생년월일, 휴대폰 번호/);
    assert.doesNotMatch(source, /get_text\(\$config\['cf_stipulation'\]\)/);
    assert.doesNotMatch(source, /\(\$config\['cf_cert_use'\]\)\?/);
  });

  it('uses scoped column headers on member privacy consent tables', () => {
    for (const file of [
      'src/skin/member/sungsan/register.skin.php',
      'src/skin/member/sungsan/member_cert_refresh.skin.php',
    ]) {
      const source = read(file);

      for (const heading of ['목적', '항목', '보유기간']) {
        assert.match(source, new RegExp(`<th scope="col">${heading}</th>`), `${file} should scope the ${heading} column header`);
        assert.doesNotMatch(source, new RegExp(`<th>${heading}</th>`), `${file} should not leave the ${heading} header unscoped`);
      }
    }
  });

  it('shows visible text on required registration consent checkboxes', () => {
    const register = read('src/skin/member/sungsan/register.skin.php');
    const certRefresh = read('src/skin/member/sungsan/member_cert_refresh.skin.php');
    const css = read('src/skin/member/sungsan/style.css');

    for (const [id, label] of [
      ['agree11', '회원가입약관의 내용에 동의합니다.'],
      ['agree21', '개인정보 수집 및 이용의 내용에 동의합니다.'],
      ['chk_all', '회원가입 약관에 모두 동의합니다'],
    ]) {
      assert.match(register, new RegExp(`<label for="${id}"><span></span>${label}</label>`), `register should show the ${id} consent label`);
      assert.doesNotMatch(register, new RegExp(`<label for="${id}"><span></span><b class="sound_only">`), `register should not hide the ${id} consent label`);
    }

    assert.match(certRefresh, /<label for="agree21"><span><\/span>추가 개인정보처리방침에 동의합니다\.<\/label>/);
    assert.doesNotMatch(certRefresh, /<label for="agree21"><span><\/span><b class="sound_only">/);
    assert.match(css, /\.member_cert_refresh_agree/);
    assert.match(css, /\.member_cert_refresh_agree input/);
  });

  it('shows visible text on optional registration consent checkbox labels', () => {
    const source = read('src/skin/member/sungsan/register_form.skin.php');

    for (const [id, label] of [
      ['reg_mb_marketing_agree', '(선택) 성산회 소식 수신을 위한 개인정보 수집 및 이용'],
      ['reg_mb_promotion_agree', '(선택) 광고성 정보 수신 동의'],
      ['reg_mb_mailling', '광고성 이메일 수신 동의'],
      ['reg_mb_sms', '광고성 SMS/카카오톡 수신 동의'],
      ['reg_mb_thirdparty_agree', '(선택) 개인정보 제3자 제공 동의'],
    ]) {
      assert.ok(source.includes(`<label for="${id}"><span></span>${label}</label>`), `register form should show the ${id} consent label`);
      assert.doesNotMatch(source, new RegExp(`<label for="${id}"><span></span><b class="sound_only">`), `register form should not hide the ${id} consent label`);
    }

    assert.doesNotMatch(source, /<span class="chk_li">/);
  });

  it('keeps registration consent modal readable and stylesheet-driven', () => {
    const modal = read('src/skin/member/sungsan/consent_modal.inc.php');
    const css = read('src/skin/member/sungsan/style.css');

    assert.match(modal, /<dialog id="consentDialog" aria-labelledby="consentDialogTitle" aria-describedby="consentDialogBody">/);
    assert.doesNotMatch(modal, /<style>[\s\S]*?<\/style>/);
    assert.match(css, /#consentDialog\s*\{/);
    assert.match(css, /\.cd-body\s*\{[\s\S]*?font-size:\s*1rem;/);
    assert.doesNotMatch(css, /\.cd-body\s*\{[^}]*font-size:\s*14px/);
    assert.match(css, /\.cd-actions button\s*\{[\s\S]*?min-height:\s*44px;/);
  });

  it('constrains registration consent modal selectors before DOM lookup', () => {
    const modal = read('src/skin/member/sungsan/consent_modal.inc.php');

    assert.match(modal, /const isSafeSelector = \(selector, prefix\) =>/);
    assert.match(modal, /isSafeSelector\(tplSel, '#tpl_'\)\s*\?\s*document\.querySelector\(tplSel\)\s*:\s*null/);
    assert.match(modal, /const checkSel\s*=\s*isSafeSelector\(dlg\.dataset\.check, '#reg_'\)\s*\?\s*dlg\.dataset\.check\s*:\s*'';/);
    assert.match(modal, /const groupSel\s*=\s*isSafeSelector\(dlg\.dataset\.checkGroup, '\.'\)\s*\?\s*dlg\.dataset\.checkGroup\s*:\s*'';/);
    assert.doesNotMatch(modal, /tplSel\s*\?\s*document\.querySelector\(tplSel\)\s*:\s*null/);
    assert.doesNotMatch(modal, /const sel\s*=\s*dlg\.dataset\.check;/);
    assert.doesNotMatch(modal, /const groupSel\s*=\s*dlg\.dataset\.checkGroup;/);
  });

  it('starts registration membership screens with visible page headings', () => {
    const register = read('src/skin/member/sungsan/register.skin.php');
    const registerForm = read('src/skin/member/sungsan/register_form.skin.php');
    const certRefresh = read('src/skin/member/sungsan/member_cert_refresh.skin.php');
    const css = read('src/skin/member/sungsan/style.css');

    assert.match(register, /<h1>회원가입 약관 동의<\/h1>/);
    assert.match(registerForm, /\$sungsan_form_title = \$w == 'u' \? '내 정보 수정' : '가입 정보 입력';/);
    assert.match(registerForm, /<h1><\?php echo get_text\(\$sungsan_form_title\); \?><\/h1>/);
    assert.match(certRefresh, /<h1>본인인증 정보 갱신<\/h1>/);
    assert.match(css, /\.member_cert_refresh,\s*\n\.mbskin,\s*\n\.register,\s*\n\.new_win_con/);
    assert.match(css, /\.member_cert_refresh h1,\s*\n\.member_cert_refresh h2/);
    assert.match(css, /\.member_cert_refresh form/);
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

  it('escapes third-party provider labels before rendering registration consent copy', () => {
    const source = read('src/skin/member/sungsan/register_form.skin.php');

    assert.match(source, /get_text\(implode\(', ', \$usedCompanies\)\)/);
    assert.doesNotMatch(source, /echo implode\(', ', \$usedCompanies\)/);
  });

  it('explains that registration is pending operator approval before member use', () => {
    const source = read('src/skin/member/sungsan/register_result.skin.php');

    assert.match(source, /가입 신청이 접수/);
    assert.match(source, /운영자 승인/);
    assert.match(source, /승인 전까지/);
    assert.doesNotMatch(source, /회원가입을 진심으로 축하/);
  });

  it('escapes account details shown on the registration result screen', () => {
    const source = read('src/skin/member/sungsan/register_result.skin.php');

    assert.match(source, /\$register_result_mb_name = isset\(\$mb\['mb_name'\]\) \? \$mb\['mb_name'\] : '';/);
    assert.match(source, /\$register_result_mb_id = isset\(\$mb\['mb_id'\]\) \? \$mb\['mb_id'\] : '';/);
    assert.match(source, /\$register_result_mb_email = isset\(\$mb\['mb_email'\]\) \? \$mb\['mb_email'\] : '';/);
    assert.match(source, /get_text\(\$register_result_mb_name\)/);
    assert.match(source, /get_text\(\$register_result_mb_id\)/);
    assert.match(source, /get_text\(\$register_result_mb_email\)/);
    assert.doesNotMatch(source, /get_text\(\$mb\['mb_name'\]\)/);
    assert.doesNotMatch(source, /get_text\(\$mb\['mb_id'\]\)/);
    assert.doesNotMatch(source, /get_text\(\$mb\['mb_email'\]\)/);
    assert.doesNotMatch(source, /echo \$mb\['mb_id'\]/);
    assert.doesNotMatch(source, /echo \$mb\['mb_email'\]/);
  });

  it('preserves hidden member compatibility fields before rendering the registration form', () => {
    const source = read('src/skin/member/sungsan/register_form.skin.php');

    for (const variable of ['w', 'urlencode', 'agree', 'agree2']) {
      assert.match(
        source,
        new RegExp(`name="${variable === 'urlencode' ? 'url' : variable}" value="<\\?php echo get_text\\(\\$${variable}\\); \\?>"`),
        `register form should escape ${variable}`,
      );
    }

    assert.match(source, /<div class="ss-register-compat-fields" hidden>/);
    assert.match(source, /\$sungsan_member_raw = function \(\$field, \$default = ''\) use \(\$member\)/);
    assert.match(source, /\$sungsan_member_value = function \(\$field, \$default = ''\) use \(\$sungsan_member_raw\)/);
    assert.match(source, /isset\(\$member\[\$field\]\) \? \$member\[\$field\] : \$default/);
    assert.match(source, /\$sungsan_member_zip = \$sungsan_member_value\('mb_zip1'\)\.\$sungsan_member_value\('mb_zip2'\);/);
    for (const field of ['mb_certify', 'mb_sex', 'mb_id', 'mb_name', 'mb_email', 'mb_hp', 'mb_nick']) {
      assert.match(
        source,
        new RegExp(`\\$sungsan_member_value\\('${field}'\\)`),
        `registration form should render ${field} through the member value helper`,
      );
      assert.doesNotMatch(
        source,
        new RegExp(`get_text\\(\\$member\\['${field}'\\]\\)`),
        `registration form should not read ${field} directly while rendering`,
      );
    }
    assert.match(source, /name="cert_type" value="<\?php echo \$sungsan_member_value\('mb_certify'\); \?>"/);
    assert.match(source, /name="mb_sex" value="<\?php echo \$sungsan_member_value\('mb_sex'\); \?>"/);
    assert.match(source, /name="mb_id" value="<\?php echo \$sungsan_member_value\('mb_id'\); \?>"/);
    assert.match(source, /name="old_email" value="<\?php echo \$sungsan_member_value\('mb_email'\); \?>"/);
    assert.match(source, /name="mb_email" value="<\?php echo \$sungsan_member_value\('mb_email'\); \?>"/);
    assert.match(source, /name="mb_homepage" value="<\?php echo \$sungsan_member_value\('mb_homepage'\); \?>"/);
    assert.match(source, /name="mb_tel" value="<\?php echo \$sungsan_member_value\('mb_tel'\); \?>"/);
    assert.match(source, /name="mb_zip" value="<\?php echo \$sungsan_member_zip; \?>"/);
    assert.match(source, /name="mb_addr1" value="<\?php echo \$sungsan_member_value\('mb_addr1'\); \?>"/);
    assert.match(source, /name="mb_addr2" value="<\?php echo \$sungsan_member_value\('mb_addr2'\); \?>"/);
    assert.match(source, /name="mb_addr3" value="<\?php echo \$sungsan_member_value\('mb_addr3'\); \?>"/);
    assert.match(source, /name="mb_addr_jibeon" value="<\?php echo \$sungsan_member_value\('mb_addr_jibeon'\); \?>"/);
    assert.match(source, /\$sungsan_member_value\('mb_signature'\)/);
    assert.match(source, /\$sungsan_member_value\('mb_profile'\)/);
    assert.match(source, /name="mb_open_default" value="<\?php echo \$sungsan_member_value\('mb_open'\); \?>"/);
    assert.match(source, /name="mb_open" value="<\?php echo \$sungsan_member_value\('mb_open'\); \?>"/);
    assert.match(source, /name="mb_recommend" value=""/);
    for (const field of ['mb_marketing_agree', 'mb_mailling', 'mb_sms', 'mb_thirdparty_agree']) {
      assert.match(
        source,
        new RegExp(`name="${field}_default" value="<\\?php echo \\$sungsan_member_value\\('${field}'\\); \\?>"`),
        `register form should escape ${field} defaults`,
      );
      assert.doesNotMatch(
        source,
        new RegExp(`name="${field}_default" value="<\\?php echo \\$member\\['${field}'\\]`),
        `register form should not echo raw ${field} defaults`,
      );
    }
    for (const field of ['mb_marketing_date', 'mb_mailling_date', 'mb_sms_date', 'mb_thirdparty_date']) {
      assert.match(
        source,
        new RegExp(`\\$sungsan_member_value\\('${field}'\\)`),
        `register form should escape ${field}`,
      );
      assert.doesNotMatch(
        source,
        new RegExp(`\\.\\$member\\['${field}'\\]`),
        `register form should not concatenate raw ${field}`,
      );
    }
    assert.doesNotMatch(source, /echo \$member\['mb_id'\]/);
    assert.doesNotMatch(source, /echo \$member\['mb_certify'\]/);
    assert.doesNotMatch(source, /echo \$member\['mb_sex'\]/);
    assert.doesNotMatch(source, /echo \$member\['mb_email'\]/);
    assert.doesNotMatch(source, /echo \$member\['mb_zip1'\]\.\$member\['mb_zip2'\]/);
    assert.doesNotMatch(source, /echo \$member\['mb_signature'\]/);
    assert.doesNotMatch(source, /echo \$member\['mb_profile'\]/);
  });

  it('normalizes optional registration consent values before rendering promotion controls', () => {
    const source = read('src/skin/member/sungsan/register_form.skin.php');

    assert.match(source, /\$sungsan_member_raw = function \(\$field, \$default = ''\) use \(\$member\)/);
    assert.match(source, /\$sungsan_member_value = function \(\$field, \$default = ''\) use \(\$sungsan_member_raw\)/);

    for (const field of ['mb_marketing_agree', 'mb_mailling', 'mb_sms', 'mb_thirdparty_agree']) {
      assert.match(
        source,
        new RegExp(`name="${field}_default" value="<\\?php echo \\$sungsan_member_value\\('${field}'\\); \\?>"`),
        `register form should render ${field} defaults through the normalized member helper`,
      );
      assert.doesNotMatch(source, new RegExp(`\\$member\\['${field}'\\]`));
    }

    for (const field of ['mb_marketing_date', 'mb_mailling_date', 'mb_sms_date', 'mb_thirdparty_date']) {
      assert.match(source, new RegExp(`\\$sungsan_member_value\\('${field}'`));
      assert.doesNotMatch(source, new RegExp(`\\$member\\['${field}'\\]`));
    }
  });

  it('renders registration consent dates as semantic time values when present', () => {
    const source = read('src/skin/member/sungsan/register_form.skin.php');

    assert.match(source, /\$sungsan_member_datetime_attr = function \(\$field\) use \(\$sungsan_member_raw\)/);
    assert.ok(source.includes("preg_match('/^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$/', $value)"));

    const cases = [
      { variable: 'sungsan_marketing_date_attr', field: 'mb_marketing_date' },
      { variable: 'sungsan_mailling_date_attr', field: 'mb_mailling_date' },
      { variable: 'sungsan_sms_date_attr', field: 'mb_sms_date' },
      { variable: 'sungsan_thirdparty_date_attr', field: 'mb_thirdparty_date' },
    ];

    for (const { variable, field } of cases) {
      assert.match(source, new RegExp(`\\$${variable} = \\$sungsan_member_datetime_attr\\('${field}'\\);`));
      assert.match(
        source,
        new RegExp(`<time datetime="<\\?php echo get_text\\(\\$${variable}\\); \\?>"><\\?php echo \\$sungsan_member_value\\('${field}'\\); \\?><\\/time>`),
      );
    }

    assert.doesNotMatch(source, /echo "\([^"]*"\.\$sungsan_member_value\('mb_marketing_date'\)\."\)"/);
    assert.doesNotMatch(source, /echo "\([^"]*"\.\$sungsan_member_value\('mb_mailling_date'\)\."\)"/);
    assert.doesNotMatch(source, /echo "\([^"]*"\.\$sungsan_member_value\('mb_sms_date'\)\."\)"/);
    assert.doesNotMatch(source, /echo "\([^"]*"\.\$sungsan_member_value\('mb_thirdparty_date'\)\."\)"/);
  });

  it('escapes public member profile fields before rendering the profile popup', () => {
    const source = read('src/skin/member/sungsan/profile.skin.php');

    assert.match(source, /get_text\(\$profile_member_nick_text\)/);
    assert.match(source, /get_text\(\$profile_homepage_text\)/);
    assert.match(source, /get_text\(\$profile_homepage_url\)/);
    assert.match(source, /get_text\(\$profile_member_intro_text\)/);
    assert.match(source, /\$profile_member_id = isset\(\$mb\['mb_id'\]\) \? \$mb\['mb_id'\] : '';/);
    assert.match(source, /\$profile_member_level = isset\(\$mb\['mb_level'\]\) \? \(int\) \$mb\['mb_level'\] : 0;/);
    assert.match(source, /\$profile_member_point = isset\(\$mb\['mb_point'\]\) \? \(int\) \$mb\['mb_point'\] : 0;/);
    assert.match(source, /\$profile_viewer_level = isset\(\$member\['mb_level'\]\) \? \(int\) \$member\['mb_level'\] : 0;/);
    assert.match(source, /\$profile_member_join_date = isset\(\$mb\['mb_datetime'\]\) \? substr\(\$mb\['mb_datetime'\], 0, 10\) : '';/);
    assert.ok(source.includes("$profile_member_join_date_attr = preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $profile_member_join_date) ? $profile_member_join_date : '';"));
    assert.match(source, /\$profile_member_today_login = isset\(\$mb\['mb_today_login'\]\) \? \$mb\['mb_today_login'\] : '';/);
    assert.ok(source.includes("$profile_member_today_login_attr = ($profile_member_today_login !== '0000-00-00 00:00:00' && preg_match('/^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$/', $profile_member_today_login)) ? str_replace(' ', 'T', $profile_member_today_login) : '';"));
    assert.match(source, /get_member_profile_img\(\$profile_member_id\)/);
    assert.match(source, /<td><\?php echo \$profile_member_level; \?><\/td>/);
    assert.match(source, /number_format\(\$profile_member_point\)/);
    assert.match(source, /<table>\s*<caption>회원 프로필 요약<\/caption>\s*<tbody>/);
    assert.match(source, /<\?php if \(\$profile_can_view_activity_dates && \$profile_member_join_date_attr !== ''\) \{ \?>\s*<time datetime="<\?php echo get_text\(\$profile_member_join_date_attr\); \?>"><\?php echo get_text\(\$profile_member_join_date\); \?><\/time>/);
    assert.match(source, /<\?php if \(\$profile_can_view_activity_dates && \$profile_member_today_login_attr !== ''\) \{ \?>\s*<time datetime="<\?php echo get_text\(\$profile_member_today_login_attr\); \?>"><\?php echo get_text\(\$profile_member_today_login\); \?><\/time>/);
    assert.doesNotMatch(source, /\$profile_can_view_activity_dates \? get_text\(\$profile_member_join_date\)/);
    assert.doesNotMatch(source, /\$profile_can_view_activity_dates \? get_text\(\$profile_member_today_login\)/);
    assert.doesNotMatch(source, /echo \$mb_nick/);
    assert.doesNotMatch(source, /get_text\(\$mb_nick\)/);
    assert.doesNotMatch(source, /echo \$mb_homepage/);
    assert.doesNotMatch(source, /get_text\(\$mb_homepage\)/);
    assert.doesNotMatch(source, /echo \$mb_profile/);
    assert.doesNotMatch(source, /get_text\(\$mb_profile\)/);
    assert.doesNotMatch(source, /echo \$mb\['mb_level'\]/);
    assert.doesNotMatch(source, /get_member_profile_img\(\$mb\['mb_id'\]\)/);
  });

  it('normalizes profile nickname and intro text before rendering the profile popup', () => {
    const source = read('src/skin/member/sungsan/profile.skin.php');

    assert.match(source, /\$profile_member_nick_text = isset\(\$mb_nick\) \? \$mb_nick : \(isset\(\$mb\['mb_nick'\]\) \? \$mb\['mb_nick'\] : ''\);/);
    assert.match(source, /\$profile_member_intro_text = isset\(\$mb_profile\) \? \$mb_profile : \(isset\(\$mb\['mb_profile'\]\) \? \$mb\['mb_profile'\] : ''\);/);
    assert.match(source, /<h1 id="win_title"><\?php echo get_text\(\$profile_member_nick_text\); \?>님의 프로필<\/h1>/);
    assert.match(source, /<\?php echo get_text\(\$profile_member_nick_text\); \?>\s*<\/div>/);
    assert.match(source, /<p><\?php echo get_text\(\$profile_member_intro_text\); \?><\/p>/);
    assert.doesNotMatch(source, /get_text\(\$mb_nick\)/);
    assert.doesNotMatch(source, /get_text\(\$mb_profile\)/);
  });

  it('limits profile homepage links to http and https URLs', () => {
    const source = read('src/skin/member/sungsan/profile.skin.php');

    assert.match(source, /\$profile_homepage_raw = isset\(\$mb\['mb_homepage'\]\) \? trim\(\$mb\['mb_homepage'\]\) : '';/);
    assert.match(source, /\$profile_homepage_scheme = parse_url\(\$profile_homepage_raw, PHP_URL_SCHEME\);/);
    assert.match(source, /in_array\(strtolower\(\(string\) \$profile_homepage_scheme\), array\('http', 'https'\), true\)/);
    assert.match(source, /\$profile_homepage_url = set_http\(\$profile_homepage_raw\);/);
    assert.match(source, /<\?php if \(\$profile_homepage_url !== ''\) \{/);
    assert.match(source, /href="<\?php echo get_text\(\$profile_homepage_url\); \?>"/);
    assert.doesNotMatch(source, /href="<\?php echo get_text\(set_http\(\$mb_homepage\)\); \?>"/);
  });

  it('renders profile homepage text from the normalized member homepage value', () => {
    const source = read('src/skin/member/sungsan/profile.skin.php');

    assert.match(source, /\$profile_homepage_text = \$profile_homepage_raw;/);
    assert.match(source, /<a href="<\?php echo get_text\(\$profile_homepage_url\); \?>" target="_blank" rel="noopener noreferrer"><\?php echo get_text\(\$profile_homepage_text\); \?><\/a>/);
    assert.doesNotMatch(source, /get_text\(\$mb_homepage\)/);
  });

  it('escapes form mail recipient details before rendering the popup', () => {
    const source = read('src/skin/member/sungsan/formmail.skin.php');

    assert.match(source, /\$formmail_recipient_name = isset\(\$name\) \? \$name : '';/);
    assert.match(source, /\$formmail_recipient_email = isset\(\$email\) \? \$email : '';/);
    assert.match(source, /id="win_title"><\?php echo get_text\(\$formmail_recipient_name\); \?>/);
    assert.match(source, /name="to" value="<\?php echo get_text\(\$formmail_recipient_email\); \?>"/);
    assert.match(source, /\$formmail_member_nick = isset\(\$member\['mb_nick'\]\) \? \$member\['mb_nick'\] : '';/);
    assert.match(source, /\$formmail_member_email = isset\(\$member\['mb_email'\]\) \? \$member\['mb_email'\] : '';/);
    assert.match(source, /name="fnick" value="<\?php echo get_text\(\$formmail_member_nick\); \?>"/);
    assert.match(source, /name="fmail" value="<\?php echo get_text\(\$formmail_member_email\); \?>"/);
    assert.doesNotMatch(source, /echo\s+\$name(?:\s|\?>)/);
    assert.doesNotMatch(source, /echo\s+\$email(?:\s|\?>)/);
    assert.doesNotMatch(source, /get_text\(\$name\)/);
    assert.doesNotMatch(source, /get_text\(\$email\)/);
    assert.doesNotMatch(source, /get_text\(\$member\['mb_nick'\]\)/);
    assert.doesNotMatch(source, /get_text\(\$member\['mb_email'\]\)/);
    assert.doesNotMatch(source, /\sstyle=/);
  });

  it('focuses the visible guest sender name field before falling back to subject in the form mail popup', () => {
    const source = read('src/skin/member/sungsan/formmail.skin.php');

    assert.match(source, /const senderNameField = document\.getElementById\('fnick'\);/);
    assert.match(source, /const subjectField = document\.fformmail\.subject;/);
    assert.match(source, /if \(senderNameField\) \{\s*senderNameField\.focus\(\);/);
    assert.match(source, /\} else if \(subjectField\) \{\s*subjectField\.focus\(\);/);
    assert.doesNotMatch(source, /with \(document\.fformmail\)/);
    assert.doesNotMatch(source, /typeof fname/);
    assert.doesNotMatch(source, /fname\.focus/);
  });

  it('escapes member confirmation form values before rendering the password confirmation screen', () => {
    const source = read('src/skin/member/sungsan/member_confirm.skin.php');

    assert.match(source, /<h1><\?php echo get_text\(\$g5\['title'\]\); \?><\/h1>/);
    assert.match(source, /action="<\?php echo get_text\(\$url\); \?>"/);
    assert.match(source, /\$member_confirm_mb_id = isset\(\$member\['mb_id'\]\) \? \$member\['mb_id'\] : '';/);
    assert.match(source, /name="mb_id" value="<\?php echo get_text\(\$member_confirm_mb_id\); \?>"/);
    assert.match(source, /id="mb_confirm_id"><\?php echo get_text\(\$member_confirm_mb_id\); \?><\/span>/);
    assert.doesNotMatch(source, /echo\s+\$g5\['title'\]/);
    assert.doesNotMatch(source, /echo\s+\$url(?:\s|\?>)/);
    assert.doesNotMatch(source, /get_text\(\$member\['mb_id'\]\)/);
  });

  it('escapes certification refresh hidden member values before rendering the form', () => {
    const source = read('src/skin/member/sungsan/member_cert_refresh.skin.php');

    assert.match(source, /action="<\?php echo get_text\(\$action_url\); \?>"/);
    assert.match(source, /name="w" value="<\?php echo get_text\(\$w\); \?>"/);
    assert.match(source, /name="url" value="<\?php echo get_text\(\$urlencode\); \?>"/);
    assert.match(source, /\$cert_refresh_member_value = function \(\$field, \$default = ''\) use \(\$member\)/);
    assert.match(source, /isset\(\$member\[\$field\]\) \? \$member\[\$field\] : \$default/);
    assert.match(source, /\$cert_refresh_member_dupinfo = isset\(\$member\['mb_dupinfo'\]\) \? \$member\['mb_dupinfo'\] : '';/);
    assert.match(source, /\$cert_refresh_requires_phone = empty\(\$cert_refresh_member_dupinfo\);/);
    assert.match(source, /<\?php echo \$cert_refresh_requires_phone \? ", [^"]+" : ""; \?>/);

    for (const field of ['mb_certify', 'mb_id', 'mb_hp', 'mb_name']) {
      assert.match(
        source,
        new RegExp(`name="${field === 'mb_certify' ? 'cert_type' : field}" value="<\\?php echo \\$cert_refresh_member_value\\('${field}'\\); \\?>"`),
        `certification refresh should escape ${field}`,
      );
      assert.doesNotMatch(
        source,
        new RegExp(`get_text\\(\\$member\\['${field}'\\]\\)`),
        `certification refresh should not read ${field} directly while rendering`,
      );
    }

    assert.doesNotMatch(source, /action="<\?php echo \$action_url/);
    assert.doesNotMatch(source, /name="w" value="<\?php echo \$w/);
    assert.doesNotMatch(source, /name="url" value="<\?php echo \$urlencode/);
    assert.doesNotMatch(source, /empty\(\$member\['mb_dupinfo'\]\)/);
  });

  it('renders certification refresh popup parameters as JSON string literals', () => {
    const source = read('src/skin/member/sungsan/member_cert_refresh.skin.php');

    assert.match(source, /\$cert_type_json = json_encode\(\$cert_type, JSON_UNESCAPED_SLASHES\);/);
    assert.match(source, /\$cert_url_json = json_encode\(\$cert_url, JSON_UNESCAPED_SLASHES\);/);
    assert.match(source, /certify_win_open\(<\?php echo \$cert_type_json; \?>, <\?php echo \$cert_url_json; \?> \+ params\);/);
    assert.doesNotMatch(source, /certify_win_open\("<\?php echo \$cert_type; \?>", "<\?php echo \$cert_url; \?>" \+ params\);/);
  });

  it('renders member account certification popup parameters as JSON string literals', () => {
    const files = [
      'src/skin/member/sungsan/password_lost.skin.php',
      'src/skin/member/sungsan/register_form.skin.php',
    ];

    for (const file of files) {
      const source = read(file);

      assert.match(source, /\$cert_type_json = json_encode\(\$cert_type, JSON_UNESCAPED_SLASHES\);/, `${file} should encode cert type`);
      assert.match(source, /\$cert_url_json = json_encode\(\$cert_url, JSON_UNESCAPED_SLASHES\);/, `${file} should encode cert URL`);
      assert.match(
        source,
        /certify_win_open\(<\?php echo \$cert_type_json; \?>, <\?php echo \$cert_url_json; \?> \+ params\);/,
        `${file} should render encoded popup parameters`,
      );
      assert.doesNotMatch(
        source,
        /certify_win_open\("<\?php echo \$cert_type; \?>", "<\?php echo \$cert_url; \?>"\s*\+\s*params\);/,
        `${file} should not echo raw popup parameters`,
      );
    }
  });

  it('initializes certification popup parameters before provider switches', () => {
    const files = [
      'src/skin/member/sungsan/member_cert_refresh.skin.php',
      'src/skin/member/sungsan/password_lost.skin.php',
      'src/skin/member/sungsan/register_form.skin.php',
    ];

    for (const file of files) {
      const source = read(file);

      assert.match(
        source,
        /\$cert_type = '';\s*\$cert_url = '';\s*switch\s*\(\$config\['cf_cert_hp'\]\)/,
        `${file} should define cert parameters before switch`,
      );
    }
  });

  it('escapes member input form actions and values before rendering account utility screens', () => {
    const cases = [
      {
        file: 'src/skin/member/sungsan/login.skin.php',
        expected: [/action="<\?php echo get_text\(\$login_action_url\); \?>"/],
        forbidden: [/action="<\?php echo \$login_action_url/],
      },
      {
        file: 'src/skin/member/sungsan/register.skin.php',
        expected: [/action="<\?php echo get_text\(\$register_action_url\); \?>"/],
        forbidden: [/action="<\?php echo \$register_action_url/],
      },
      {
        file: 'src/skin/member/sungsan/register_form.skin.php',
        expected: [/action="<\?php echo get_text\(\$register_action_url\); \?>"/],
        forbidden: [/action="<\?php echo \$register_action_url/],
      },
      {
        file: 'src/skin/member/sungsan/password_lost.skin.php',
        expected: [/action="<\?php echo get_text\(\$action_url\); \?>"/],
        forbidden: [/action="<\?php echo \$action_url/],
      },
      {
        file: 'src/skin/member/sungsan/password_reset.skin.php',
        expected: [/action="<\?php echo get_text\(\$action_url\); \?>"/],
        forbidden: [/action="<\?php echo \$action_url/],
      },
      {
        file: 'src/skin/member/sungsan/password.skin.php',
        expected: [
          /<h1><\?php echo get_text\(\$g5\['title'\]\); \?><\/h1>/,
          /action="<\?php echo get_text\(\$sungsan_password_action\); \?>"/,
        ],
        forbidden: [/<h1><\?php echo \$g5\['title'\]/, /action="<\?php echo \$action/, /action="<\?php echo get_text\(\$action\); \?>"/],
      },
      {
        file: 'src/skin/member/sungsan/memo_form.skin.php',
        expected: [
          /action="<\?php echo get_text\(\$memo_form_action_url\); \?>"/,
          /\$memo_send_point = isset\(\$config\['cf_memo_send_point'\]\) \? \(int\) \$config\['cf_memo_send_point'\] : 0;/,
          /name="me_recv_mb_id" value="<\?php echo get_text\(\$memo_form_recipient_id\); \?>"/,
          /if \(\$memo_send_point > 0\)/,
          /number_format\(\$memo_send_point\)/,
          /<textarea name="me_memo" id="me_memo" required class="required"><\?php echo get_text\(\$memo_form_content\); \?><\/textarea>/,
        ],
        forbidden: [
          /action="<\?php echo \$memo_action_url/,
          /get_text\(\$memo_action_url\)/,
          /if \(\$config\['cf_memo_send_point'\]\)/,
          /name="me_recv_mb_id" value="<\?php echo \$me_recv_mb_id/,
          /get_text\(\$me_recv_mb_id\)/,
          /number_format\(\$config\['cf_memo_send_point'\]\)/,
          /<textarea name="me_memo" id="me_memo" required class="required"><\?php echo \$content/,
          /get_text\(\$content\)/,
        ],
      },
      {
        file: 'src/skin/member/sungsan/formmail.skin.php',
        expected: [
          /\$formmail_action_url = '\.\/formmail_send\.php';/,
          /action="<\?php echo get_text\(\$formmail_action_url\); \?>"/,
        ],
        forbidden: [/action="\.\/formmail_send\.php"/],
      },
      {
        file: 'src/skin/member/sungsan/scrap_popin.skin.php',
        expected: [
          /name="bo_table" value="<\?php echo get_text\(\$scrap_popin_board_id\); \?>"/,
          /name="wr_id" value="<\?php echo \(int\) \$scrap_popin_wr_id; \?>"/,
          /\$scrap_popin_subject = isset\(\$write\['wr_subject'\]\) \? \$write\['wr_subject'\] : '';/,
          /<\?php echo get_text\(cut_str\(\$scrap_popin_subject, 255\)\) \?>/,
        ],
        forbidden: [
          /name="bo_table" value="<\?php echo \$bo_table/,
          /name="bo_table" value="<\?php echo get_text\(\$bo_table\); \?>"/,
          /name="wr_id" value="<\?php echo \$wr_id/,
          /name="wr_id" value="<\?php echo get_text\(\$wr_id\); \?>"/,
          /cut_str\(\$write\['wr_subject'\]/,
        ],
      },
    ];

    for (const { file, expected, forbidden } of cases) {
      const source = read(file);

      for (const pattern of expected) {
        assert.match(source, pattern, `${file} should render escaped form values`);
      }

      for (const pattern of forbidden) {
        assert.doesNotMatch(source, pattern, `${file} should not render raw form values`);
      }
    }
  });

  it('normalizes memo compose action recipient and content before rendering', () => {
    const source = read('src/skin/member/sungsan/memo_form.skin.php');

    assert.match(source, /\$memo_form_action_url = isset\(\$memo_action_url\) \? \$memo_action_url : '\.\/memo_form_update\.php';/);
    assert.match(source, /\$memo_form_recipient_id = isset\(\$me_recv_mb_id\) \? \$me_recv_mb_id : '';/);
    assert.match(source, /\$memo_form_content = isset\(\$content\) \? \$content : '';/);
    assert.match(source, /action="<\?php echo get_text\(\$memo_form_action_url\); \?>"/);
    assert.match(source, /name="me_recv_mb_id" value="<\?php echo get_text\(\$memo_form_recipient_id\); \?>"/);
    assert.match(source, /<textarea name="me_memo" id="me_memo" required class="required"><\?php echo get_text\(\$memo_form_content\); \?><\/textarea>/);
    assert.doesNotMatch(source, /get_text\(\$memo_action_url\)/);
    assert.doesNotMatch(source, /get_text\(\$me_recv_mb_id\)/);
    assert.doesNotMatch(source, /get_text\(\$content\)/);
  });

  it('normalizes memo list kind count and pagination before rendering', () => {
    const source = read('src/skin/member/sungsan/memo.skin.php');

    assert.match(source, /\$memo_current_kind = \(isset\(\$kind\) && \$kind === 'send'\) \? 'send' : 'recv';/);
    assert.match(source, /\$memo_kind_title = isset\(\$kind_title\) \? \$kind_title : \(\$memo_current_kind === 'send' \? '보낸' : '받은'\);/);
    assert.match(source, /\$memo_rows = \(isset\(\$list\) && is_array\(\$list\)\) \? \$list : array\(\);/);
    assert.match(source, /\$memo_total_count = isset\(\$total_count\) \? \(int\) \$total_count : 0;/);
    assert.match(source, /\$memo_write_pages = isset\(\$write_pages\) \? \$write_pages : '';/);
    assert.match(source, /전체 <\?php echo get_text\(\$memo_kind_title\); \?>쪽지 <\?php echo number_format\(\$memo_total_count\); \?>통/);
    assert.match(source, /<li class="<\?php if \(\$memo_current_kind == 'recv'\) \{  \?>selected<\?php \}  \?>"/);
    assert.match(source, /<li class="<\?php if \(\$memo_current_kind == 'send'\) \{  \?>selected<\?php \}  \?>"/);
    assert.match(source, /<\?php if \(\$memo_write_pages !== ''\) \{ echo \$memo_write_pages; \} \?>/);
    assert.match(source, /for \(\$i=0; \$i<count\(\$memo_rows\); \$i\+\+\)/);
    assert.match(source, /\$memo_row = \$memo_rows\[\$i\];/);
    assert.match(source, /if \(count\(\$memo_rows\) === 0\)/);
    assert.doesNotMatch(source, /get_text\(\$kind_title\)/);
    assert.doesNotMatch(source, /number_format\(\(int\) \$total_count\)/);
    assert.doesNotMatch(source, /if \(\$kind == 'recv'\)/);
    assert.doesNotMatch(source, /if \(\$kind == 'send'\)/);
    assert.doesNotMatch(source, /echo \$write_pages/);
    assert.doesNotMatch(source, /count\(\$list\)/);
    assert.doesNotMatch(source, /\$list\[\$i\]/);
  });

  it('normalizes memo detail navigation before rendering', () => {
    const source = read('src/skin/member/sungsan/memo_view.skin.php');

    assert.match(source, /\$memo_current_kind = \(isset\(\$kind\) && \$kind === 'send'\) \? 'send' : 'recv';/);
    assert.match(source, /\$memo_list_href = isset\(\$list_link\) \? \$list_link : '\.\/memo\.php\?kind='.\$memo_current_kind;/);
    assert.match(source, /\$memo_delete_href = isset\(\$del_link\) \? \$del_link : '';/);
    assert.match(source, /\$memo_prev_href = isset\(\$prev_link\) \? \$prev_link : '';/);
    assert.match(source, /\$memo_next_href = isset\(\$next_link\) \? \$next_link : '';/);
    assert.match(source, /\$memo_sender_sideview = get_sideview\(get_text\(\$memo_sender_id\), get_text\(\$memo_sender_nick\), get_text\(\$memo_sender_email\), get_text\(\$memo_sender_homepage\)\);/);
    assert.match(source, /<li class="memo_view_nick"><\?php echo \$memo_sender_sideview; \?><\/li>/);
    assert.match(source, /href="<\?php echo get_text\(\$memo_list_href\); \?>"/);
    assert.match(source, /href="<\?php echo get_text\(\$memo_delete_href\); \?>"/);
    assert.match(source, /<\?php if\(\$memo_prev_href !== ''\) \{  \?>/);
    assert.match(source, /href="<\?php echo get_text\(\$memo_prev_href\); \?>"/);
    assert.match(source, /<\?php if\(\$memo_next_href !== ''\) \{  \?>/);
    assert.match(source, /href="<\?php echo get_text\(\$memo_next_href\); \?>"/);
    assert.doesNotMatch(source, /\$nick = get_sideview/);
    assert.doesNotMatch(source, /echo \$nick/);
    assert.doesNotMatch(source, /get_text\(\$list_link\)/);
    assert.doesNotMatch(source, /get_text\(\$del_link\)/);
    assert.doesNotMatch(source, /get_text\(\$prev_link\)/);
    assert.doesNotMatch(source, /get_text\(\$next_link\)/);
  });

  it('normalizes password reset account identifiers before rendering the reset form', () => {
    const source = read('src/skin/member/sungsan/password_reset.skin.php');

    assert.match(source, /\$password_reset_mb_id = isset\(\$_POST\['mb_id'\]\) \? \$_POST\['mb_id'\] : '';/);
    assert.match(source, /회원 아이디 : <\?php echo get_text\(\$password_reset_mb_id\); \?>/);
    assert.doesNotMatch(source, /get_text\(\$_POST\['mb_id'\]\)/);
  });

  it('starts password recovery with a visible popup heading before recovery forms', () => {
    const source = read('src/skin/member/sungsan/password_lost.skin.php');
    const css = read('src/skin/member/sungsan/style.css');
    const headingIndex = source.indexOf('<h1 id="win_title">아이디/비밀번호 찾기</h1>');
    const formIndex = source.indexOf('<form name="fpasswordlost"');

    assert.ok(headingIndex > -1, 'password recovery should render a visible popup heading');
    assert.ok(formIndex > -1, 'password recovery should render the email recovery form');
    assert.ok(headingIndex < formIndex, 'password recovery heading should appear before recovery forms');
    assert.match(css, /\.new_win_con h1,\s*\n\.new_win_con h3/);
  });

  it('escapes member popup list and detail values before rendering community utilities', () => {
    const cases = [
      {
        file: 'src/skin/member/sungsan/memo.skin.php',
        expected: [
          /<\?php echo get_text\(\$g5\['title'\]\); \?>/,
          /\$memo_current_kind = \(isset\(\$kind\) && \$kind === 'send'\) \? 'send' : 'recv';/,
          /\$memo_kind_title = isset\(\$kind_title\) \? \$kind_title : \(\$memo_current_kind === 'send' \? '보낸' : '받은'\);/,
          /\$memo_total_count = isset\(\$total_count\) \? \(int\) \$total_count : 0;/,
          /\$memo_write_pages = isset\(\$write_pages\) \? \$write_pages : '';/,
          /<\?php echo get_text\(\$memo_kind_title\); \?>/,
          /<\?php echo number_format\(\$memo_total_count\); \?>/,
          /\$memo_row = \$memo_rows\[\$i\];/,
          /\$memo_read_datetime = isset\(\$memo_row\['me_read_datetime'\]\) \? \$memo_row\['me_read_datetime'\] : '';/,
          /\$memo_body = isset\(\$memo_row\['me_memo'\]\) \? \$memo_row\['me_memo'\] : '';/,
          /\$memo_member_id = isset\(\$memo_row\['mb_id'\]\) \? \$memo_row\['mb_id'\] : '';/,
          /\$memo_name = isset\(\$memo_row\['name'\]\) \? \$memo_row\['name'\] : '';/,
          /\$memo_send_datetime = isset\(\$memo_row\['send_datetime'\]\) \? \$memo_row\['send_datetime'\] : '';/,
          /\$memo_view_href = isset\(\$memo_row\['view_href'\]\) \? \$memo_row\['view_href'\] : '';/,
          /\$memo_del_href = isset\(\$memo_row\['del_href'\]\) \? \$memo_row\['del_href'\] : '';/,
          /get_member_profile_img\(\$memo_member_id\)/,
          /get_text\(strip_tags\(\$memo_name\)\)/,
          /get_text\(\$memo_send_datetime\)/,
          /href="<\?php echo get_text\(\$memo_view_href\); \?>"/,
          /<\?php echo get_text\(\$memo_preview\); \?>/,
          /href="<\?php echo get_text\(\$memo_del_href\); \?>"/,
          /\$memo_retention_days = isset\(\$config\['cf_memo_del'\]\) \? \(int\) \$config\['cf_memo_del'\] : 0;/,
          /number_format\(\$memo_retention_days\)/,
        ],
        forbidden: [
          /echo \$g5\['title'\]/,
          /echo \$kind_title/,
          /get_text\(\$kind_title\)/,
          /echo \$total_count/,
          /number_format\(\(int\) \$total_count\)/,
          /if \(\$kind == 'recv'\)/,
          /if \(\$kind == 'send'\)/,
          /echo \$write_pages/,
          /substr\(\$list\[\$i\]\['me_read_datetime'\]/,
          /strip_tags\(\$list\[\$i\]\['me_memo'\]\)/,
          /get_member_profile_img\(\$list\[\$i\]\['mb_id'\]\)/,
          /echo \$list\[\$i\]\['name'\]/,
          /get_text\(strip_tags\(\$list\[\$i\]\['name'\]\)\)/,
          /echo \$list\[\$i\]\['send_datetime'\]/,
          /get_text\(\$list\[\$i\]\['send_datetime'\]\)/,
          /href="<\?php echo \$list\[\$i\]\['view_href'\]/,
          /href="<\?php echo get_text\(\$list\[\$i\]\['view_href'\]\); \?>"/,
          /echo \$memo_preview/,
          /href="<\?php echo \$list\[\$i\]\['del_href'\]/,
          /href="<\?php echo get_text\(\$list\[\$i\]\['del_href'\]\); \?>"/,
          /echo \$config\['cf_memo_del'\]/,
          /number_format\(\(int\) \$config\['cf_memo_del'\]\)/,
          /\$memo_row = isset\(\$list\[\$i\]\) \? \$list\[\$i\] : array\(\);/,
          /count\(\$list\)/,
        ],
      },
      {
        file: 'src/skin/member/sungsan/memo_view.skin.php',
        expected: [
          /<h1 id="win_title"><\?php echo get_text\(\$g5\['title'\]\); \?><\/h1>/,
          /<\?php echo get_text\(\$kind_date\); \?>/,
          /\$memo_sender_id = isset\(\$mb\['mb_id'\]\) \? \$mb\['mb_id'\] : '';/,
          /\$memo_sender_nick = isset\(\$mb\['mb_nick'\]\) \? \$mb\['mb_nick'\] : '';/,
          /\$memo_sender_email = isset\(\$mb\['mb_email'\]\) \? \$mb\['mb_email'\] : '';/,
          /\$memo_sender_homepage = isset\(\$mb\['mb_homepage'\]\) \? \$mb\['mb_homepage'\] : '';/,
          /\$memo_sent_at = isset\(\$memo\['me_send_datetime'\]\) \? \$memo\['me_send_datetime'\] : '';/,
          /\$memo_body = isset\(\$memo\['me_memo'\]\) \? \$memo\['me_memo'\] : '';/,
          /\$memo_id = isset\(\$memo\['me_id'\]\) \? \(int\) \$memo\['me_id'\] : 0;/,
          /\$memo_current_kind = \(isset\(\$kind\) && \$kind === 'send'\) \? 'send' : 'recv';/,
          /\$memo_list_href = isset\(\$list_link\) \? \$list_link : '\.\/memo\.php\?kind='.\$memo_current_kind;/,
          /\$memo_delete_href = isset\(\$del_link\) \? \$del_link : '';/,
          /\$memo_prev_href = isset\(\$prev_link\) \? \$prev_link : '';/,
          /\$memo_next_href = isset\(\$next_link\) \? \$next_link : '';/,
          /\$memo_reply_href = '\.\/memo_form\.php\?me_recv_mb_id='\.urlencode\(\$memo_sender_id\)\.'&amp;me_id='.\$memo_id;/,
          /\$memo_sender_sideview = get_sideview\(get_text\(\$memo_sender_id\), get_text\(\$memo_sender_nick\), get_text\(\$memo_sender_email\), get_text\(\$memo_sender_homepage\)\);/,
          /get_member_profile_img\(\$memo_sender_id\)/,
          /<li class="memo_view_nick"><\?php echo \$memo_sender_sideview; \?><\/li>/,
          /<\?php echo get_text\(\$memo_sent_at\); \?>/,
          /href="<\?php echo get_text\(\$memo_list_href\); \?>"/,
          /href="<\?php echo get_text\(\$memo_delete_href\); \?>"/,
          /href="<\?php echo get_text\(\$memo_prev_href\); \?>"/,
          /href="<\?php echo get_text\(\$memo_next_href\); \?>"/,
          /conv_content\(\$memo_body, 0\)/,
          /href="<\?php echo get_text\(\$memo_reply_href\); \?>"/,
        ],
        forbidden: [
          /echo \$g5\['title'\]/,
          /echo \$kind_date/,
          /echo \$memo\['me_send_datetime'\]/,
          /get_text\(\$memo\['me_send_datetime'\]\)/,
          /conv_content\(\$memo\['me_memo'\], 0\)/,
          /get_member_profile_img\(\$mb\['mb_id'\]\)/,
          /href="<\?php echo \$list_link/,
          /get_text\(\$list_link\)/,
          /href="<\?php echo \$del_link/,
          /get_text\(\$del_link\)/,
          /href="<\?php echo \$prev_link/,
          /get_text\(\$prev_link\)/,
          /href="<\?php echo \$next_link/,
          /get_text\(\$next_link\)/,
          /me_recv_mb_id=<\?php echo get_text\(\$memo_sender_id\); \?>&amp;me_id=<\?php echo \$memo_id; \?>/,
          /me_recv_mb_id=<\?php echo \$mb\['mb_id'\]/,
          /me_recv_mb_id=<\?php echo get_text\(\$mb\['mb_id'\]\); \?>&amp;me_id=<\?php echo \(int\) \$memo\['me_id'\]; \?>/,
          /\$nick = get_sideview/,
          /echo \$nick/,
          /get_sideview\(\$mb\['mb_id'\], \$mb\['mb_nick'\], \$mb\['mb_email'\], \$mb\['mb_homepage'\]\)/,
          /get_sideview\(get_text\(\$mb\['mb_id'\]\), get_text\(\$mb\['mb_nick'\]\), get_text\(\$mb\['mb_email'\]\), get_text\(\$mb\['mb_homepage'\]\)\)/,
        ],
      },
      {
        file: 'src/skin/member/sungsan/point.skin.php',
        expected: [
          /<h1 id="win_title"><\?php echo get_text\(\$g5\['title'\]\); \?><\/h1>/,
          /<\?php echo get_text\(\$po_content\); \?>/,
          /<\?php echo get_text\(\$row_datetime\); \?>/,
          /'만료 '\.get_text\(substr\(str_replace\('-', '', \$row_expire_date\), 2\)\)/,
          /: get_text\(\$row_expire_date\); \?><\/time>/,
        ],
        forbidden: [
          /echo \$g5\['title'\]/,
          /echo \$po_content/,
          /echo \$row\['po_datetime'\]/,
          /get_text\(\$row\['po_datetime'\]\)/,
          /echo substr\(str_replace\('-', '', \$row\['po_expire_date'\]\), 2\)/,
          /get_text\(substr\(str_replace\('-', '', \$row\['po_expire_date'\]\), 2\)\)/,
          /: \$row\['po_expire_date'\]/,
          /: get_text\(\$row\['po_expire_date'\]\)/,
        ],
      },
      {
        file: 'src/skin/member/sungsan/scrap.skin.php',
        expected: [
          /<h1 id="win_title"><\?php echo get_text\(\$scrap_title\); \?><\/h1>/,
          /\$scrap_row = \$scrap_rows\[\$i\];/,
          /\$scrap_post_href = isset\(\$scrap_row\['opener_href_wr_id'\]\) \? \$scrap_row\['opener_href_wr_id'\] : '';/,
          /\$scrap_subject = isset\(\$scrap_row\['subject'\]\) \? \$scrap_row\['subject'\] : '';/,
          /\$scrap_board_href = isset\(\$scrap_row\['opener_href'\]\) \? \$scrap_row\['opener_href'\] : '';/,
          /\$scrap_board_subject = isset\(\$scrap_row\['bo_subject'\]\) \? \$scrap_row\['bo_subject'\] : '';/,
          /\$scrap_datetime = isset\(\$scrap_row\['ms_datetime'\]\) \? \$scrap_row\['ms_datetime'\] : '';/,
          /\$scrap_del_href = isset\(\$scrap_row\['del_href'\]\) \? \$scrap_row\['del_href'\] : '';/,
          /\$scrap_paging_pages = isset\(\$config\['cf_write_pages'\]\) \? \(int\) \$config\['cf_write_pages'\] : 0;/,
          /\$scrap_paging_page = isset\(\$page\) \? \(int\) \$page : 1;/,
          /\$scrap_paging_total = isset\(\$total_page\) \? \(int\) \$total_page : 1;/,
          /\$scrap_paging_qstr = isset\(\$qstr\) \? get_text\(\$qstr\) : '';/,
          /\$scrap_paging_url = '\?'\.\(\$scrap_paging_qstr !== '' \? \$scrap_paging_qstr\.'&amp;page=' : 'page='\);/,
          /href="<\?php echo get_text\(\$scrap_post_href\); \?>"/,
          /class="scrap_tit" target="_blank" rel="noopener noreferrer"/,
          /onclick="return sungsanOpenScrapLink\(this\);"/,
          /<\?php echo get_text\(\$scrap_subject\); \?>/,
          /href="<\?php echo get_text\(\$scrap_board_href\); \?>"/,
          /class="scrap_cate" target="_blank" rel="noopener noreferrer"/,
          /<\?php echo get_text\(\$scrap_board_subject\); \?>/,
          /<\?php echo get_text\(\$scrap_datetime\); \?>/,
          /href="<\?php echo get_text\(\$scrap_del_href\); \?>"/,
          /get_paging\(\$scrap_paging_pages, \$scrap_paging_page, \$scrap_paging_total, \$scrap_paging_url\)/,
        ],
        forbidden: [
          /echo \$g5\['title'\]/,
          /get_text\(\$g5\['title'\]\)/,
          /\$scrap_row = isset\(\$list\[\$i\]\) \? \$list\[\$i\] : array\(\);/,
          /href="<\?php echo \$list\[\$i\]\['opener_href_wr_id'\]/,
          /href="<\?php echo get_text\(\$list\[\$i\]\['opener_href_wr_id'\]\); \?>"/,
          /opener\.document\.location\.href='<\?php echo \$list\[\$i\]\['opener_href_wr_id'\]/,
          /onclick="opener\.document\.location\.href=this\.href; return false;"/,
          /echo \$list\[\$i\]\['subject'\]/,
          /get_text\(\$list\[\$i\]\['subject'\]\)/,
          /href="<\?php echo \$list\[\$i\]\['opener_href'\]/,
          /href="<\?php echo get_text\(\$list\[\$i\]\['opener_href'\]\); \?>"/,
          /echo \$list\[\$i\]\['bo_subject'\]/,
          /get_text\(\$list\[\$i\]\['bo_subject'\]\)/,
          /echo \$list\[\$i\]\['ms_datetime'\]/,
          /get_text\(\$list\[\$i\]\['ms_datetime'\]\)/,
          /href="<\?php echo \$list\[\$i\]\['del_href'\]/,
          /href="<\?php echo get_text\(\$list\[\$i\]\['del_href'\]\); \?>"/,
          /get_paging\(\$config\['cf_write_pages'\], \$page, \$total_page, "\?\$qstr&amp;page="\)/,
          /count\(\$list\)/,
        ],
      },
    ];

    for (const { file, expected, forbidden } of cases) {
      const source = read(file);

      for (const pattern of expected) {
        assert.match(source, pattern, `${file} should render escaped popup values`);
      }

      for (const pattern of forbidden) {
        assert.doesNotMatch(source, pattern, `${file} should not render raw popup values`);
      }
    }
  });

  it('normalizes point values before rendering the point popup', () => {
    const source = read('src/skin/member/sungsan/point.skin.php');

    assert.match(source, /\$member_point = isset\(\$member\['mb_point'\]\) \? \(int\) \$member\['mb_point'\] : 0;/);
    assert.match(source, /number_format\(\$member_point\)/);
    assert.match(source, /\$row_point = isset\(\$row\['po_point'\]\) \? \(int\) \$row\['po_point'\] : 0;/);
    assert.match(source, /\$row_content = isset\(\$row\['po_content'\]\) \? \$row\['po_content'\] : '';/);
    assert.match(source, /\$row_expired = isset\(\$row\['po_expired'\]\) \? \(int\) \$row\['po_expired'\] : 0;/);
    assert.match(source, /\$row_datetime = isset\(\$row\['po_datetime'\]\) \? \$row\['po_datetime'\] : '';/);
    assert.match(source, /\$row_expire_date = isset\(\$row\['po_expire_date'\]\) \? \$row\['po_expire_date'\] : '';/);
    assert.match(source, /if \(\$row_point > 0\)/);
    assert.match(source, /\$point1 = '\+' \.number_format\(\$row_point\);/);
    assert.match(source, /\$sum_point1 \+= \$row_point;/);
    assert.match(source, /\$point2 = number_format\(\$row_point\);/);
    assert.match(source, /\$sum_point2 \+= \$row_point;/);
    assert.match(source, /\$point_value = \$point1 \?: \$point2;/);
    assert.match(source, /\$po_content = \$row_content;/);
    assert.match(source, /if\(\$row_expired == 1\)/);
    assert.match(source, /get_text\(\$row_datetime\)/);
    assert.match(source, /get_text\(substr\(str_replace\('-', '', \$row_expire_date\), 2\)\)/);
    assert.match(source, /\$row_expire_date_attr = \(\$row_expire_date !== '' && \$row_expire_date !== '9999-12-31'\) \? \$row_expire_date : '';/);
    assert.match(source, /get_text\(\$row_expire_date\)/);
    assert.match(source, /<span class="point_num"><\?php echo get_text\(\$point_value\); \?><\/span>/);
    assert.match(source, /<span><\?php echo get_text\(\$sum_point1\); \?><\/span>/);
    assert.match(source, /<span><\?php echo get_text\(\$sum_point2\); \?><\/span>/);
    assert.match(source, /\$point_paging_pages = G5_IS_MOBILE \? \(int\) \$config\['cf_mobile_pages'\] : \(int\) \$config\['cf_write_pages'\];/);
    assert.match(source, /\$point_paging_page = isset\(\$page\) \? \(int\) \$page : 1;/);
    assert.match(source, /\$point_paging_total = isset\(\$total_page\) \? \(int\) \$total_page : 1;/);
    assert.match(source, /\$point_paging_script = isset\(\$_SERVER\['SCRIPT_NAME'\]\) \? get_text\(\$_SERVER\['SCRIPT_NAME'\]\) : '';/);
    assert.match(source, /\$point_paging_qstr = isset\(\$qstr\) \? get_text\(\$qstr\) : '';/);
    assert.match(source, /\$point_paging_query = \$point_paging_qstr !== '' \? \$point_paging_qstr\.'&amp;page=' : 'page=';/);
    assert.match(source, /\$point_paging_url = \$point_paging_script\.'\?'\.\$point_paging_query;/);
    assert.match(source, /get_paging\(\$point_paging_pages, \$point_paging_page, \$point_paging_total, \$point_paging_url\)/);
    assert.doesNotMatch(source, /number_format\(\$member\['mb_point'\]\)/);
    assert.doesNotMatch(source, /\$member_point = \(int\) \$member\['mb_point'\];/);
    assert.doesNotMatch(source, /\$row_point = \(int\) \$row\['po_point'\];/);
    assert.doesNotMatch(source, /\$row\['po_point'\] > 0/);
    assert.doesNotMatch(source, /\$po_content = \$row\['po_content'\];/);
    assert.doesNotMatch(source, /get_text\(\$row\['po_datetime'\]\)/);
    assert.doesNotMatch(source, /\$row\['po_expire_date'\] == '9999-12-31'/);
    assert.doesNotMatch(source, /echo \$sum_point1/);
    assert.doesNotMatch(source, /echo \$sum_point2/);
    assert.doesNotMatch(source, /\$point_paging_query = isset\(\$qstr\) && \$qstr !== '' \? \$qstr\.'&amp;page=' : 'page=';/);
    assert.doesNotMatch(source, /get_paging\(G5_IS_MOBILE \? \$config\['cf_mobile_pages'\] : \$config\['cf_write_pages'\], \$page, \$total_page, \$_SERVER\['SCRIPT_NAME'\]\.'\?'\.\$qstr\.'&amp;page='\)/);
  });

  it('renders point popup transaction dates as semantic time elements', () => {
    const source = read('src/skin/member/sungsan/point.skin.php');

    assert.match(source, /\$row_datetime_attr = \$row_datetime !== '' \? str_replace\(' ', 'T', \$row_datetime\) : '';/);
    assert.match(source, /<time class="point_date1" datetime="<\?php echo get_text\(\$row_datetime_attr\); \?>"><i class="fa fa-clock-o" aria-hidden="true"><\/i> <\?php echo get_text\(\$row_datetime\); \?><\/time>/);
    assert.doesNotMatch(source, /<span class="point_date1">/);
  });

  it('renders point popup expiry dates as semantic time elements when present', () => {
    const source = read('src/skin/member/sungsan/point.skin.php');

    assert.match(source, /\$row_expire_date_attr = \(\$row_expire_date !== '' && \$row_expire_date !== '9999-12-31'\) \? \$row_expire_date : '';/);
    assert.match(source, /<\?php if \(\$row_expire_date_attr !== ''\) \{ \?>\s*<time datetime="<\?php echo get_text\(\$row_expire_date_attr\); \?>"><\?php echo \$row_expired == 1 \? '만료 '\.get_text\(substr\(str_replace\('-', '', \$row_expire_date\), 2\)\) : get_text\(\$row_expire_date\); \?><\/time>/);
    assert.match(source, /<\?php \} else \{ \?>&nbsp;<\?php \} \?>/);
    assert.doesNotMatch(source, /\$row_expire_date == '9999-12-31' \? '&nbsp;' : get_text\(\$row_expire_date\)/);
  });

  it('renders member utility dates as semantic time elements', () => {
    const memo = read('src/skin/member/sungsan/memo.skin.php');
    const memoView = read('src/skin/member/sungsan/memo_view.skin.php');
    const scrap = read('src/skin/member/sungsan/scrap.skin.php');

    assert.match(memo, /\$memo_send_datetime_attr = \$memo_send_datetime !== '' \? str_replace\(' ', 'T', \$memo_send_datetime\) : '';/);
    assert.match(memo, /<time class="memo_datetime" datetime="<\?php echo get_text\(\$memo_send_datetime_attr\); \?>"><i class="fa fa-clock-o" aria-hidden="true"><\/i> <\?php echo get_text\(\$memo_send_datetime\); \?><\/time>/);
    assert.doesNotMatch(memo, /<span class="memo_datetime">/);

    assert.match(memoView, /\$memo_sent_at_attr = \$memo_sent_at !== '' \? str_replace\(' ', 'T', \$memo_sent_at\) : '';/);
    assert.match(memoView, /<time datetime="<\?php echo get_text\(\$memo_sent_at_attr\); \?>"><i class="fa fa-clock-o" aria-hidden="true"><\/i> <\?php echo get_text\(\$memo_sent_at\); \?><\/time>/);

    assert.match(scrap, /\$scrap_datetime_attr = \$scrap_datetime !== '' \? str_replace\(' ', 'T', \$scrap_datetime\) : '';/);
    assert.match(scrap, /<time class="scrap_datetime" datetime="<\?php echo get_text\(\$scrap_datetime_attr\); \?>"><i class="fa fa-clock-o" aria-hidden="true"><\/i> <\?php echo get_text\(\$scrap_datetime\); \?><\/time>/);
    assert.doesNotMatch(scrap, /<span class="scrap_datetime">/);
  });

  it('shows visible text on popup icon action links', () => {
    const cases = [
      {
        file: 'src/skin/member/sungsan/memo.skin.php',
        expected: [
          /class="memo_del"><i class="fa fa-trash-o" aria-hidden="true"><\/i> 삭제<\/a>/,
        ],
        forbidden: [
          /class="memo_del"><i class="fa fa-trash-o" aria-hidden="true"><\/i> <span class="sound_only">삭제<\/span><\/a>/,
        ],
      },
      {
        file: 'src/skin/member/sungsan/memo_view.skin.php',
        expected: [
          /class="btn_b01 btn"><i class="fa fa-list" aria-hidden="true"><\/i> 목록<\/a>/,
          /class="memo_del btn_b01 btn"><i class="fa fa-trash-o" aria-hidden="true"><\/i> 삭제<\/a>/,
        ],
        forbidden: [
          /class="btn_b01 btn"><i class="fa fa-list" aria-hidden="true"><\/i><span class="sound_only">목록<\/span><\/a>/,
          /class="memo_del btn_b01 btn"><i class="fa fa-trash-o" aria-hidden="true"><\/i> <span class="sound_only">삭제<\/span><\/a>/,
        ],
      },
      {
        file: 'src/skin/member/sungsan/scrap.skin.php',
        expected: [
          /class="scrap_del"><i class="fa fa-trash-o" aria-hidden="true"><\/i> 삭제<\/a>/,
        ],
        forbidden: [
          /class="scrap_del"><i class="fa fa-trash-o" aria-hidden="true"><\/i><span class="sound_only">삭제<\/span><\/a>/,
        ],
      },
    ];

    for (const { file, expected, forbidden } of cases) {
      const source = read(file);

      for (const pattern of expected) {
        assert.match(source, pattern, `${file} should show visible action text`);
      }

      for (const pattern of forbidden) {
        assert.doesNotMatch(source, pattern, `${file} should not hide action text behind sound_only`);
      }
    }
  });

  it('keeps member popup controls free of javascript pseudo-protocols', () => {
    for (const file of phpFilesUnder('src/skin/member/sungsan')) {
      const source = read(file);
      assert.doesNotMatch(source, /javascript:/i, `${file} should not use javascript: pseudo-protocols in controls`);
    }
  });

  it('falls back to normal scrap links when the opener window is unavailable', () => {
    const source = read('src/skin/member/sungsan/scrap.skin.php');

    assert.match(source, /function sungsanOpenScrapLink\(link\) \{/);
    assert.match(source, /if \(window\.opener && !window\.opener\.closed\) \{/);
    assert.match(source, /return false;/);
    assert.match(source, /return true;/);
    assert.match(source, /onclick="return sungsanOpenScrapLink\(this\);"/);
    assert.doesNotMatch(source, /opener\.document\.location\.href=this\.href/);
  });

  it('only redirects the scrap opener to same-origin links', () => {
    const source = read('src/skin/member/sungsan/scrap.skin.php');

    assert.match(source, /const targetUrl = new URL\(link\.href, window\.location\.href\);/);
    assert.match(source, /if \(targetUrl\.origin !== window\.location\.origin\) \{\s*return true;\s*\}/);
    assert.match(source, /window\.opener\.location\.href = targetUrl\.href;/);
    assert.doesNotMatch(source, /window\.opener\.location\.href = link\.href;/);
  });

  it('lets users close the scrap confirmation popup without submitting', () => {
    const source = read('src/skin/member/sungsan/scrap_popin.skin.php');

    assert.match(
      source,
      /<div class="win_btn">[\s\S]*?<button type="submit" class="btn_submit">스크랩 확인<\/button>[\s\S]*?<button type="button" onclick="window\.close\(\);" class="btn_close">창닫기<\/button>[\s\S]*?<\/div>/,
    );
  });

  it('normalizes scrap popup values before rendering', () => {
    const scrap = read('src/skin/member/sungsan/scrap.skin.php');

    assert.match(scrap, /\$scrap_title = isset\(\$g5\['title'\]\) \? \$g5\['title'\] : '스크랩';/);
    assert.match(scrap, /\$scrap_rows = \(isset\(\$list\) && is_array\(\$list\)\) \? \$list : array\(\);/);
    assert.match(scrap, /for \(\$i=0; \$i<count\(\$scrap_rows\); \$i\+\+\)/);
    assert.match(scrap, /\$scrap_row = \$scrap_rows\[\$i\];/);
    assert.match(scrap, /if \(count\(\$scrap_rows\) === 0\)/);
    assert.doesNotMatch(scrap, /count\(\$list\)/);
    assert.doesNotMatch(scrap, /\$list\[\$i\]/);

    const popin = read('src/skin/member/sungsan/scrap_popin.skin.php');

    assert.match(popin, /\$scrap_popin_board_id = isset\(\$bo_table\) \? \$bo_table : '';/);
    assert.match(popin, /\$scrap_popin_wr_id = isset\(\$wr_id\) \? \(int\) \$wr_id : 0;/);
    assert.match(popin, /name="bo_table" value="<\?php echo get_text\(\$scrap_popin_board_id\); \?>"/);
    assert.match(popin, /name="wr_id" value="<\?php echo \(int\) \$scrap_popin_wr_id; \?>"/);
    assert.doesNotMatch(popin, /get_text\(\$bo_table\)/);
    assert.doesNotMatch(popin, /get_text\(\$wr_id\)/);
  });

  it('shows visible labels on account utility form fields instead of relying on placeholders', () => {
    const visibleLabelCases = [
      {
        file: 'src/skin/member/sungsan/password_lost.skin.php',
        fields: ['mb_email'],
      },
      {
        file: 'src/skin/member/sungsan/password_reset.skin.php',
        fields: ['mb_pw', 'mb_pw2'],
      },
      {
        file: 'src/skin/member/sungsan/member_confirm.skin.php',
        fields: ['confirm_mb_password'],
      },
      {
        file: 'src/skin/member/sungsan/password.skin.php',
        fields: ['password_wr_password'],
      },
      {
        file: 'src/skin/member/sungsan/memo_form.skin.php',
        fields: ['me_recv_mb_id', 'me_memo'],
      },
      {
        file: 'src/skin/member/sungsan/formmail.skin.php',
        fields: ['fnick', 'fmail', 'subject', 'content'],
      },
    ];

    for (const { file, fields } of visibleLabelCases) {
      const source = read(file);

      for (const field of fields) {
        const fieldLine = source.split('\n').find((line) => line.includes(`id="${field}"`));

        assert.match(source, new RegExp(`<label for="${field}"(?![^>]*sound_only)`), `${file} should show a visible label for ${field}`);
        assert.doesNotMatch(source, new RegExp(`<label for="${field}"[^>]*class="sound_only"`), `${file} should not hide the ${field} label`);
        assert.ok(fieldLine, `${file} should render ${field}`);
        assert.doesNotMatch(fieldLine, /placeholder=/, `${file} should not duplicate ${field} label as placeholder`);
      }
    }
  });

  it('shows a visible required marker on memo content', () => {
    const source = read('src/skin/member/sungsan/memo_form.skin.php');

    assert.match(source, /<label for="me_memo">\uB0B4\uC6A9 <strong>\uD544\uC218<\/strong><\/label>/);
    assert.doesNotMatch(source, /<label for="me_memo">\uB0B4\uC6A9<\/label>/);
  });

  it('connects memo recipient guidance to the recipient field', () => {
    const source = read('src/skin/member/sungsan/memo_form.skin.php');

    assert.match(source, /id="me_recv_mb_id"[\s\S]*?aria-describedby="me_recv_help<\?php if \(\$memo_send_point > 0\) \{ \?> me_point_help<\?php \} \?>"/);
    assert.match(source, /<span id="me_recv_help" class="frm_info">/);
    assert.match(source, /<span id="me_point_help" class="frm_info">/);
    assert.doesNotMatch(source, /<span class="frm_info">여러 회원에게/);
  });

  it('starts password reset with a visible popup heading before form fields', () => {
    const source = read('src/skin/member/sungsan/password_reset.skin.php');
    const headingIndex = source.indexOf('<h1 id="win_title">비밀번호 재설정</h1>');
    const fieldsetIndex = source.indexOf('<fieldset id="info_fs">');

    assert.ok(headingIndex > -1, 'password reset should render a visible popup heading');
    assert.ok(fieldsetIndex > -1, 'password reset should render the password fieldset');
    assert.ok(headingIndex < fieldsetIndex, 'password reset heading should appear before form fields');
  });

  it('connects password recovery email guidance to the email field', () => {
    const source = read('src/skin/member/sungsan/password_lost.skin.php');

    assert.match(source, /<p id="password_lost_email_help">[\s\S]*회원가입 시 등록하신 이메일 주소/);
    assert.match(source, /id="mb_email"[^>]+aria-describedby="password_lost_email_help"/);
    assert.doesNotMatch(source, /<p>\s*회원가입 시 등록하신 이메일 주소/);
  });

  it('connects password reset guidance to both new password fields', () => {
    const source = read('src/skin/member/sungsan/password_reset.skin.php');

    assert.match(source, /<p id="password_reset_help">새로운 비밀번호를 입력해주세요\.<\/p>/);
    for (const field of ['mb_pw', 'mb_pw2']) {
      assert.match(source, new RegExp(`id="${field}"[^>]+aria-describedby="password_reset_help"`), `${field} should reference the reset guidance`);
    }
    assert.doesNotMatch(source, /<p>새로운 비밀번호를 입력해주세요\.<\/p>/);
  });

  it('connects member confirmation guidance to the password field', () => {
    const source = read('src/skin/member/sungsan/member_confirm.skin.php');

    assert.match(source, /<p id="member_confirm_help">[\s\S]*비밀번호를 한번 더 입력해주세요\./);
    assert.match(source, /id="confirm_mb_password"[^>]+aria-describedby="member_confirm_help"/);
    assert.doesNotMatch(source, /<p>\s*<strong>비밀번호를 한번 더 입력해주세요\.<\/strong>/);
  });

  it('connects board password guidance to the password field', () => {
    const source = read('src/skin/member/sungsan/password.skin.php');

    assert.match(source, /<p id="board_password_help">[\s\S]*작성자만 글을 수정할 수 있습니다\./);
    assert.match(source, /id="password_wr_password"[^>]+aria-describedby="board_password_help"/);
    assert.doesNotMatch(source, /<p>\s*<\?php if \(\$w == 'u'\) \{ \?>/);
  });

  it('connects scrap comment guidance to the optional comment textarea', () => {
    const source = read('src/skin/member/sungsan/scrap_popin.skin.php');

    assert.match(source, /<textarea name="wr_content" id="wr_content" aria-describedby="scrap_comment_help"><\/textarea>/);
    assert.match(source, /<p id="scrap_comment_help" class="win_desc">/);
    assert.doesNotMatch(source, /<textarea name="wr_content" id="wr_content"><\/textarea>/);
    assert.doesNotMatch(source, /<p class="win_desc">/);
  });

  it('uses semantic input types for member email and phone fields', () => {
    const cases = [
      {
        file: 'src/skin/member/sungsan/formmail.skin.php',
        id: 'fmail',
        type: 'email',
        autocomplete: 'email',
      },
      {
        file: 'src/skin/member/sungsan/password_lost.skin.php',
        id: 'mb_email',
        type: 'email',
        autocomplete: 'email',
      },
      {
        file: 'src/skin/member/sungsan/register_form.skin.php',
        id: 'reg_mb_email',
        type: 'email',
        autocomplete: 'email',
      },
      {
        file: 'src/skin/member/sungsan/register_form.skin.php',
        id: 'reg_mb_hp',
        type: 'tel',
        inputmode: 'tel',
        autocomplete: 'tel',
      },
    ];

    for (const { file, id, type, inputmode, autocomplete } of cases) {
      const source = read(file);
      const inputLine = source.split('\n').find((line) => line.includes(`id="${id}"`));

      assert.ok(inputLine, `${file} should render ${id}`);
      assert.match(inputLine, new RegExp(`type="${type}"`), `${file} should use ${type} for ${id}`);
      assert.doesNotMatch(inputLine, /type="text"/, `${file} should not leave ${id} as a text input`);

      if (inputmode) {
        assert.match(inputLine, new RegExp(`inputmode="${inputmode}"`), `${file} should set inputmode on ${id}`);
      }

      if (autocomplete) {
        assert.match(inputLine, new RegExp(`autocomplete="${autocomplete}"`), `${file} should set autocomplete on ${id}`);
      }
    }
  });

  it('marks new member password fields for password managers', () => {
    const cases = [
      {
        file: 'src/skin/member/sungsan/register_form.skin.php',
        ids: ['reg_mb_password', 'reg_mb_password_re'],
      },
      {
        file: 'src/skin/member/sungsan/password_reset.skin.php',
        ids: ['mb_pw', 'mb_pw2'],
      },
    ];

    for (const { file, ids } of cases) {
      const source = read(file);

      for (const id of ids) {
        const inputLine = source.split('\n').find((line) => line.includes(`id="${id}"`));

        assert.ok(inputLine, `${file} should render ${id}`);
        assert.match(inputLine, /type="password"/, `${file} should keep ${id} as a password input`);
        assert.match(inputLine, /autocomplete="new-password"/, `${file} should mark ${id} as a new password`);
      }
    }
  });

  it('keeps registration fields readable through visible labels, not duplicate placeholders', () => {
    const source = read('src/skin/member/sungsan/register_form.skin.php');

    for (const id of [
      'reg_mb_id',
      'reg_mb_password',
      'reg_mb_password_re',
      'reg_mb_name',
      'reg_mb_nick',
      'reg_mb_email',
      'reg_mb_hp',
    ]) {
      assert.match(source, new RegExp(`<label for="${id}"`), `registration form should show a visible label for ${id}`);
      assert.doesNotMatch(source, new RegExp(`id="${id}"[^\\n]*placeholder=`), `registration form should not duplicate ${id} label as placeholder`);
    }
  });

  it('groups form mail format choices with a visible legend', () => {
    const source = read('src/skin/member/sungsan/formmail.skin.php');
    const css = read('src/skin/member/sungsan/style.css');

    assert.match(source, /<fieldset class="ss-choice-group">[\s\S]*?<legend>메일 형식<\/legend>[\s\S]*?<div class="ss-choice-options">[\s\S]*?id="type_text"[\s\S]*?id="type_html"[\s\S]*?id="type_both"[\s\S]*?<\/div>[\s\S]*?<\/fieldset>/);
    assert.doesNotMatch(source, /<span class="sound_only">형식<\/span>/);
    assert.match(css, /\.ss-choice-group\s*\{/);
    assert.match(css, /\.ss-choice-group\s+legend\s*\{/);
    assert.match(css, /\.ss-choice-options\s*\{/);
  });

  it('shows plain visible labels for form mail attachment fields', () => {
    const source = read('src/skin/member/sungsan/formmail.skin.php');

    for (const [field, label] of [
      ['file1', '첨부 파일 1'],
      ['file2', '첨부 파일 2'],
    ]) {
      assert.match(source, new RegExp(`<label for="${field}">${label}</label>`), `form mail should show ${label} as visible text`);
      assert.doesNotMatch(source, new RegExp(`<label for="${field}" class="lb_icon"`), `form mail should not use an icon-only label for ${field}`);
      assert.doesNotMatch(source, new RegExp(`<label for="${field}"[\\s\\S]*?<span class="sound_only">\\s*${label}</span>`), `form mail should not hide ${label}`);
    }
  });

  it('connects form mail attachment guidance to both file fields', () => {
    const source = read('src/skin/member/sungsan/formmail.skin.php');

    assert.match(source, /<div id="formmail_attachment_help" class="frm_info">/);
    for (const field of ['file1', 'file2']) {
      assert.match(source, new RegExp(`id="${field}"[^\\n]+aria-describedby="formmail_attachment_help"`), `form mail should connect ${field} to attachment guidance`);
    }
    assert.doesNotMatch(source, /<input type="file" name="file2" id="file2" class="frm_file full_input">/);
  });

  it('limits form mail attachment pickers to common passive files', () => {
    const source = read('src/skin/member/sungsan/formmail.skin.php');

    assert.match(source, /\$formmail_upload_limit_mb = 20;/);
    assert.match(
      source,
      /\$formmail_attachment_accept = '\.jpg,\.jpeg,\.png,\.gif,\.webp,\.pdf,\.hwp,\.hwpx,\.doc,\.docx,\.xls,\.xlsx,\.ppt,\.pptx,\.txt';/,
    );
    assert.match(source, /파일 한 개당 <\?php echo number_format\(\(int\) \$formmail_upload_limit_mb\); \?>MB 이하/);

    for (const field of ['file1', 'file2']) {
      assert.match(
        source,
        new RegExp(`id="${field}"[^\\n]+accept="<\\?php echo get_text\\(\\$formmail_attachment_accept\\); \\?>"[^\\n]+aria-describedby="formmail_attachment_help"`),
        `form mail should apply the picker filter to ${field}`,
      );
    }

    const acceptLine = source.match(/\$formmail_attachment_accept = '([^']+)';/);
    assert.ok(acceptLine, 'form mail should expose an attachment accept list');
    for (const blocked of ['php', 'php7', 'php8', 'html', 'js', 'svg', 'htaccess', 'user.ini']) {
      assert.doesNotMatch(acceptLine[1], new RegExp(`\\.${blocked}(?:,|$)`), `form mail should not suggest ${blocked} attachments`);
    }

    assert.match(source, /PHP, HTML, JS, SVG/);
    assert.match(source, /\.htaccess/);
    assert.match(source, /\.user\.ini/);
    assert.match(source, /shell\.php7/);
    assert.match(source, /shell\.php8/);
    assert.match(source, /shell\.php\.jpg/);
  });

  it('keeps optional registration address profile and recommender controls out of the visible form', () => {
    const source = read('src/skin/member/sungsan/register_form.skin.php');

    assert.doesNotMatch(source, /<h2>기타 개인설정<\/h2>/);
    assert.doesNotMatch(source, /cf_use_homepage/);
    assert.doesNotMatch(source, /cf_use_addr/);
    assert.doesNotMatch(source, /cf_use_signature/);
    assert.doesNotMatch(source, /cf_use_profile/);
    assert.doesNotMatch(source, /cf_use_member_icon/);
    assert.doesNotMatch(source, /cf_member_img_/);
    assert.doesNotMatch(source, /cf_use_recommend/);

    for (const field of [
      'reg_mb_homepage',
      'reg_mb_tel',
      'reg_mb_zip',
      'reg_mb_addr1',
      'reg_mb_addr2',
      'reg_mb_addr3',
      'reg_mb_signature',
      'reg_mb_profile',
      'reg_mb_icon',
      'reg_mb_img',
      'reg_mb_open',
      'reg_mb_recommend',
    ]) {
      assert.doesNotMatch(source, new RegExp(`id="${field}"`), `registration form should not show ${field}`);
      assert.doesNotMatch(source, new RegExp(`<label for="${field}"`), `registration form should not label ${field}`);
    }
  });

  it('uses spec-aligned registration and profile edit action labels', () => {
    const source = read('src/skin/member/sungsan/register_form.skin.php');

    assert.match(source, /\$sungsan_cancel_url = \$w == 'u' \? G5_URL\.'\/sungsan\/mypage\.php' : G5_URL;/);
    assert.match(source, /\$sungsan_submit_label = \$w == '' \? '가입 신청' : '저장';/);
    assert.match(source, /<a href="<\?php echo get_text\(\$sungsan_cancel_url\); \?>" class="btn_close">취소<\/a>/);
    assert.match(source, /<button type="submit" id="btn_submit" class="btn_submit" accesskey="s"><\?php echo get_text\(\$sungsan_submit_label\); \?><\/button>/);
    assert.doesNotMatch(source, /href="<\?php echo G5_URL \?>"/);
    assert.doesNotMatch(source, /\$w==''\?'회원가입':'정보수정'/);
  });

  it('shows visible labels on board list search forms instead of relying on placeholders', () => {
    const cases = [
      ['src/skin/board/sungsan_news/list.skin.php', 'board_stx'],
      ['src/skin/board/sungsan_free/list.skin.php', 'free_board_stx'],
    ];

    for (const [file, field] of cases) {
      const source = read(file);
      const fieldLine = source.split('\n').find((line) => line.includes(`id="${field}"`));

      assert.match(source, new RegExp(`<label for="${field}"(?![^>]*sound_only)`), `${file} should show a visible search label`);
      assert.match(source, new RegExp(`<label for="${field}">제목과 내용 검색어</label>`), `${file} should describe the board search scope in the visible label`);
      assert.doesNotMatch(source, new RegExp(`<label[^>]*class="sound_only"[^>]*for="${field}"`), `${file} should not hide the search label`);
      assert.ok(fieldLine, `${file} should render ${field}`);
      assert.doesNotMatch(fieldLine, /placeholder=/, `${file} should not duplicate the search label as placeholder`);
      assert.match(source, /<div class="ss-search-row">/, `${file} should keep search input and button grouped`);
    }
  });

  it('styles visible account utility labels and textareas for scan-friendly forms', () => {
    const css = read('src/skin/member/sungsan/style.css');

    assert.match(css, /#login_fs\s*>\s*label:not\(\.sound_only\)/);
    assert.match(css, /#info_fs\s*>\s*label:not\(\.sound_only\)/);
    assert.match(css, /#mb_confirm\s+fieldset\s*>\s*label:not\(\.sound_only\)/);
    assert.match(css, /#pw_confirm\s+fieldset\s*>\s*label:not\(\.sound_only\)/);
    assert.match(css, /\.form_01\s+li\s*>\s*label:not\(\.sound_only\)/);
    assert.match(css, /\.form_01\s+li\s*>\s*\.frm_label/);
    assert.match(css, /display:\s*block/);
    assert.match(css, /margin-bottom:\s*6px/);
    assert.match(css, /font-weight:\s*800/);
    assert.match(css, /\.form_01\s+textarea/);
    assert.match(css, /min-height:\s*180px/);
  });

  it('uses defined Sungsan theme tokens in member skin CSS', () => {
    const css = read('src/skin/member/sungsan/style.css');

    assert.match(css, /var\(--ss-color-text-muted,\s*#464c53\)/);
    assert.match(css, /var\(--ss-color-error,\s*#d92d20\)/);
    assert.doesNotMatch(css, /--ss-color-muted/);
    assert.doesNotMatch(css, /--ss-color-danger/);
  });

  it('keeps static label targets connected to fields in custom PHP templates', () => {
    for (const file of phpFilesUnder('src')) {
      const source = read(file);
      const ids = new Set([...source.matchAll(/\bid="([A-Za-z][A-Za-z0-9_-]*)"/g)].map((match) => match[1]));
      const labels = [...source.matchAll(/<label\b[^>]*\bfor="([A-Za-z][A-Za-z0-9_-]*)"[^>]*>/g)].map((match) => match[1]);
      const missingTargets = [...new Set(labels.filter((target) => !ids.has(target)))];

      assert.deepEqual(missingTargets, [], `${file} has labels whose for target is missing`);
    }
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
      'src/skin/board/sungsan_free/view_comment.skin.php',
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
      '.ss-search-row',
    ]) {
      assert.match(css, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });

  it('keeps board touch targets at least 44px high', () => {
    const css = read('src/scss/main.scss');
    const chipBlock = css.match(/\.ss-chip\s*\{([^}]*)\}/);
    const commentActionBlock = css.match(/\.ss-comment-actions a\s*\{([^}]*)\}/);
    const paginationBlock = css.match(/\.ss-pagination a,\s*\n\.ss-pagination strong,\s*\n\.ss-pagination span\s*\{([^}]*)\}/);

    assert.ok(chipBlock, 'category chips should be styled');
    assert.ok(commentActionBlock, 'comment actions should be styled');
    assert.ok(paginationBlock, 'pagination controls should be styled');
    assert.match(chipBlock[1], /min-height:\s*44px;/);
    assert.match(commentActionBlock[1], /display:\s*inline-flex;/);
    assert.match(commentActionBlock[1], /min-height:\s*44px;/);
    assert.match(paginationBlock[1], /min-width:\s*44px;/);
    assert.match(paginationBlock[1], /min-height:\s*44px;/);
  });

  it('keeps scannable badges and required markers readable for older members', () => {
    const scss = read('src/scss/main.scss');
    const css = read('src/theme/sungsan/css/sungsan.css');

    for (const selector of ['ss-badge', 'ss-pin-label', 'ss-access-label', 'ss-required']) {
      const scssBlock = scss.match(new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`));

      assert.ok(scssBlock, `${selector} should be styled`);
      assert.match(scssBlock[1], /font-size:\s*0\.94rem;/, `${selector} should stay readable in source CSS`);
      assert.match(css, new RegExp(`\\.${selector}\\{[^}]*font-size:0\\.94rem`), `${selector} should stay readable in generated CSS`);
      assert.doesNotMatch(css, new RegExp(`\\.${selector}\\{[^}]*font-size:0\\.88rem`), `${selector} should not regress to tiny generated text`);
    }
  });

  it('styles board list search labels without changing the compact header search', () => {
    const css = read('src/scss/main.scss');

    assert.match(css, /\.ss-board-search\s*\{/);
    assert.match(css, /\.ss-board-search\s+label:not\(\.sound_only\)/);
    assert.match(css, /width:\s*min\(100%,\s*520px\)/);
    assert.match(css, /overflow:\s*visible/);
    assert.match(css, /\.ss-search-row\s*\{/);
    assert.match(css, /border:\s*1px solid var\(--ss-color-border\)/);
  });

  it('uses search input semantics for board list search fields', () => {
    const cases = [
      {
        file: 'src/skin/board/sungsan_news/list.skin.php',
        id: 'board_stx',
      },
      {
        file: 'src/skin/board/sungsan_free/list.skin.php',
        id: 'free_board_stx',
      },
    ];

    for (const { file, id } of cases) {
      const source = read(file);
      const inputLine = source.split('\n').find((line) => line.includes(`id="${id}"`));

      assert.ok(inputLine, `${file} should render the ${id} search input`);
      assert.match(inputLine, /name="stx"/, `${file} should keep the board search query field name`);
      assert.match(inputLine, /type="search"/, `${file} should expose board search as a search input`);
      assert.match(inputLine, /enterkeyhint="search"/, `${file} should request the search action on mobile keyboards`);
      assert.doesNotMatch(inputLine, new RegExp(`<input id="${id}" name="stx" value=`), `${file} should not leave board search as a default text input`);
    }
  });

  it('escapes board search terms before rendering them in form attributes', () => {
    const cases = [
      {
        file: 'src/skin/board/sungsan_news/list.skin.php',
        actionVariable: 'sungsan_news_search_action',
        termVariable: 'sungsan_news_search_term',
        boardVariable: 'sungsan_news_board_id',
      },
      {
        file: 'src/skin/board/sungsan_free/list.skin.php',
        actionVariable: 'sungsan_free_search_action',
        termVariable: 'sungsan_free_search_term',
        boardVariable: 'sungsan_free_board_id',
      },
    ];

    for (const { file, actionVariable, termVariable, boardVariable } of cases) {
      const source = read(file);

      assert.match(
        source,
        new RegExp(`\\$${actionVariable} = isset\\(\\$_SERVER\\['SCRIPT_NAME'\\]\\) \\? \\$_SERVER\\['SCRIPT_NAME'\\] : '';`),
        `${file} should normalize form action before rendering`,
      );
      assert.match(
        source,
        new RegExp(`\\$${termVariable} = isset\\(\\$stx\\) \\? stripslashes\\(\\$stx\\) : '';`),
        `${file} should normalize search term before rendering`,
      );
      assert.match(
        source,
        new RegExp(`action="<\\?php echo get_text\\(\\$${actionVariable}\\); \\?>"`),
        `${file} should escape normalized form action`,
      );
      assert.match(source, new RegExp(`name="bo_table" value="<\\?php echo get_text\\(\\$${boardVariable}\\); \\?>"`), `${file} should escape bo_table`);
      assert.match(source, new RegExp(`<input[^\\n]+name="stx"[^\\n]+value="<\\?php echo get_text\\(\\$${termVariable}\\); \\?>"`), `${file} should escape normalized stx`);
      assert.doesNotMatch(source, /action="<\?php echo get_text\(\$_SERVER\['SCRIPT_NAME'\]\); \?>"/, `${file} should not render superglobal directly`);
      assert.doesNotMatch(source, /action="<\?php echo \$_SERVER\['SCRIPT_NAME'\]; \?>"/, `${file} should not echo raw form action`);
      assert.doesNotMatch(source, /name="bo_table" value="<\?php echo get_text\(\$bo_table\); \?>"/, `${file} should not render raw bo_table variable`);
      assert.doesNotMatch(source, /name="bo_table" value="<\?php echo \$bo_table; \?>"/, `${file} should not echo raw bo_table`);
      assert.doesNotMatch(source, /get_text\(stripslashes\(\$stx\)\)/, `${file} should not normalize stx inline while rendering`);
      assert.doesNotMatch(source, /echo\s+stripslashes\(\$stx\)/, `${file} should not echo raw stx`);
    }

    const news = read('src/skin/board/sungsan_news/list.skin.php');
    assert.match(news, /<input type="hidden" name="sca" value="<\?php echo get_text\(\$current_category\); \?>">/);
    assert.doesNotMatch(news, /name="sca" value="<\?php echo get_text\(\$sca\); \?>"/);
  });

  it('escapes board return parameters before rendering hidden form attributes', () => {
    for (const { file, prefix } of [
      { file: 'src/skin/board/sungsan_news/write.skin.php', prefix: 'sungsan_write' },
      { file: 'src/skin/board/sungsan_free/write.skin.php', prefix: 'sungsan_write' },
      { file: 'src/skin/member/sungsan/password.skin.php', prefix: 'sungsan_password' },
    ]) {
      const source = read(file);

      for (const variable of ['sfl', 'stx', 'page']) {
        const normalizedVariable = `$${prefix}_${variable}`;
        const expectedDefinition = variable === 'page'
          ? new RegExp(`\\${normalizedVariable} = isset\\(\\$${variable}\\) \\? \\(int\\) \\$${variable} : 0;`)
          : new RegExp(`\\${normalizedVariable} = isset\\(\\$${variable}\\) \\? \\$${variable} : '';`);
        const expectedRender = variable === 'page'
          ? new RegExp(`name="${variable}" value="<\\?php echo \\(int\\) \\${normalizedVariable}; \\?>"`)
          : new RegExp(`name="${variable}" value="<\\?php echo get_text\\(\\${normalizedVariable}\\); \\?>"`);

        assert.match(source, expectedDefinition, `${file} should normalize ${variable} before rendering`);
        assert.match(source, expectedRender, `${file} should escape normalized ${variable}`);
        assert.doesNotMatch(
          source,
          new RegExp(`name="${variable}" value="<\\?php echo \\$${variable};? \\?>"`),
          `${file} should not echo raw ${variable}`,
        );
        assert.doesNotMatch(
          source,
          new RegExp(`name="${variable}" value="<\\?php echo get_text\\(\\$${variable}\\); \\?>"`),
          `${file} should not render raw ${variable}`,
        );
      }
    }

    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      for (const variable of ['sca', 'spt', 'sst', 'sod']) {
        const normalizedVariable = `$sungsan_write_${variable}`;

        assert.match(
          source,
          new RegExp(`\\${normalizedVariable} = isset\\(\\$${variable}\\) \\? \\$${variable} : '';`),
          `${file} should normalize ${variable} before rendering`,
        );
        assert.match(
          source,
          new RegExp(`name="${variable}" value="<\\?php echo get_text\\(\\${normalizedVariable}\\); \\?>"`),
          `${file} should escape normalized ${variable}`,
        );
        assert.doesNotMatch(
          source,
          new RegExp(`name="${variable}" value="<\\?php echo \\$${variable};? \\?>"`),
          `${file} should not echo raw ${variable}`,
        );
        assert.doesNotMatch(
          source,
          new RegExp(`name="${variable}" value="<\\?php echo get_text\\(\\$${variable}\\); \\?>"`),
          `${file} should not render raw ${variable}`,
        );
      }
    }
  });

  it('normalizes board write identifiers before rendering hidden form attributes', () => {
    for (const { file, boardId, fallbackId } of [
      {
        file: 'src/skin/board/sungsan_news/write.skin.php',
        boardId: 'sungsan_write_board_id',
        fallbackId: 'news',
      },
      {
        file: 'src/skin/board/sungsan_free/write.skin.php',
        boardId: 'sungsan_write_board_id',
        fallbackId: 'free',
      },
    ]) {
      const source = read(file);

      assert.match(source, /\$sungsan_write_mode = isset\(\$w\) \? \$w : '';/, `${file} should normalize write mode`);
      assert.match(source, new RegExp(`\\$${boardId} = isset\\(\\$bo_table\\) \\? \\$bo_table : '${fallbackId}';`), `${file} should default the board id`);
      assert.match(source, /\$sungsan_write_wr_id = isset\(\$wr_id\) \? \(int\) \$wr_id : 0;/, `${file} should normalize wr_id as an integer`);
      assert.match(source, /name="w" value="<\?php echo get_text\(\$sungsan_write_mode\); \?>"/, `${file} should render the normalized write mode`);
      assert.match(source, new RegExp(`name="bo_table" value="<\\?php echo get_text\\(\\$${boardId}\\); \\?>"`), `${file} should render the normalized board id`);
      assert.match(source, /name="wr_id" value="<\?php echo \(int\) \$sungsan_write_wr_id; \?>"/, `${file} should render the normalized write id`);
      assert.doesNotMatch(source, /name="w" value="<\?php echo get_text\(\$w\); \?>"/, `${file} should not render raw write mode directly`);
      assert.doesNotMatch(source, /name="bo_table" value="<\?php echo get_text\(\$bo_table\); \?>"/, `${file} should not render raw bo_table directly`);
      assert.doesNotMatch(source, /name="wr_id" value="<\?php echo get_text\(\$wr_id\); \?>"/, `${file} should not render raw wr_id directly`);
    }
  });

  it('normalizes board password identifiers before rendering hidden form attributes', () => {
    const source = read('src/skin/member/sungsan/password.skin.php');

    assert.match(source, /\$sungsan_password_title = isset\(\$g5\['title'\]\) \? \$g5\['title'\] : '';/);
    assert.match(source, /\$sungsan_password_mode = isset\(\$w\) \? \$w : '';/);
    assert.match(source, /\$sungsan_password_board_id = isset\(\$bo_table\) \? \$bo_table : '';/);
    assert.match(source, /\$sungsan_password_wr_id = isset\(\$wr_id\) \? \(int\) \$wr_id : 0;/);
    assert.match(source, /\$sungsan_password_comment_id = isset\(\$comment_id\) \? \(int\) \$comment_id : 0;/);
    assert.match(source, /name="w" value="<\?php echo get_text\(\$sungsan_password_mode\); \?>"/);
    assert.match(source, /name="bo_table" value="<\?php echo get_text\(\$sungsan_password_board_id\); \?>"/);
    assert.match(source, /name="wr_id" value="<\?php echo \(int\) \$sungsan_password_wr_id; \?>"/);
    assert.match(source, /name="comment_id" value="<\?php echo \(int\) \$sungsan_password_comment_id; \?>"/);
    assert.match(source, /else \$g5\['title'\] = \$sungsan_password_title;/);
    assert.doesNotMatch(source, /else \$g5\['title'\] = \$g5\['title'\];/);
    assert.doesNotMatch(source, /name="w" value="<\?php echo get_text\(\$w\); \?>"/);
    assert.doesNotMatch(source, /name="bo_table" value="<\?php echo get_text\(\$bo_table\); \?>"/);
    assert.doesNotMatch(source, /name="wr_id" value="<\?php echo get_text\(\$wr_id\); \?>"/);
    assert.doesNotMatch(source, /name="comment_id" value="<\?php echo get_text\(\$comment_id\); \?>"/);
  });

  it('escapes board write form actions and editable values before rendering forms', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /\$sungsan_write_action_url = isset\(\$action_url\) \? \$action_url : '';/, `${file} should normalize action_url`);
      assert.match(source, /\$sungsan_write_subject = isset\(\$subject\) \? \$subject : '';/, `${file} should normalize subject`);
      assert.match(source, /\$sungsan_write_content = isset\(\$content\) \? \$content : '';/, `${file} should normalize content`);
      assert.match(source, /action="<\?php echo get_text\(\$sungsan_write_action_url\); \?>"/, `${file} should escape normalized action_url`);
      assert.match(source, /id="wr_subject" name="wr_subject" value="<\?php echo get_text\(\$sungsan_write_subject\); \?>"/, `${file} should escape normalized subject`);
      assert.match(source, /<textarea id="wr_content" name="wr_content" required[\s\S]*?>\s*<\?php echo get_text\(\$sungsan_write_content\); \?><\/textarea>/, `${file} should escape normalized content`);
      assert.match(source, /href="<\?php echo get_text\(\$sungsan_cancel_url\); \?>"/, `${file} should escape cancel url`);
      assert.match(source, /\$sungsan_write_files = \(isset\(\$file\) && is_array\(\$file\)\) \? \$file : array\(\);/, `${file} should normalize existing file rows`);
      assert.match(source, /\$sungsan_write_file = isset\(\$sungsan_write_files\[\$i\]\) \? \$sungsan_write_files\[\$i\] : array\(\);/, `${file} should read existing file rows from the normalized list`);
      assert.match(source, /\$sungsan_write_file_exists = isset\(\$sungsan_write_file\['file'\]\) \? \$sungsan_write_file\['file'\] : '';/, `${file} should normalize existing file state`);
      assert.match(source, /\$sungsan_write_file_source = isset\(\$sungsan_write_file\['source'\]\) \? \$sungsan_write_file\['source'\] : '';/, `${file} should normalize existing file label`);
      assert.match(source, /\$sungsan_write_file_size = isset\(\$sungsan_write_file\['size'\]\) \? \$sungsan_write_file\['size'\] : '';/, `${file} should normalize existing file size`);
      assert.match(source, /\$sungsan_write_file_delete_id = 'bf_file_del_'\.\$i;/, `${file} should create a stable delete checkbox id`);
      assert.match(source, /if \(\$sungsan_write_mode === 'u' && \$sungsan_write_file_exists !== ''\)/, `${file} should test normalized file state`);
      assert.match(source, /<div class="ss-existing-file">/, `${file} should render existing attachments as a distinct state`);
      assert.match(source, /<strong>현재 첨부<\/strong>/, `${file} should label the current attachment before delete controls`);
      assert.match(source, /get_text\(\$sungsan_write_file_source\)/, `${file} should escape normalized existing file label`);
      assert.match(source, /get_text\(\$sungsan_write_file_size\)/, `${file} should escape normalized existing file size`);
      assert.match(source, /id="<\?php echo get_text\(\$sungsan_write_file_delete_id\); \?>"/, `${file} should escape delete checkbox id`);
      assert.match(source, /for="<\?php echo get_text\(\$sungsan_write_file_delete_id\); \?>"/, `${file} should connect delete checkbox label`);
      assert.match(source, /이 파일 삭제/, `${file} should make the delete action explicit`);

      assert.doesNotMatch(source, /action="<\?php echo \$action_url/);
      assert.doesNotMatch(source, /action="<\?php echo get_text\(\$action_url\); \?>"/);
      assert.doesNotMatch(source, /value="<\?php echo \$subject/);
      assert.doesNotMatch(source, /value="<\?php echo get_text\(\$subject\); \?>"/);
      assert.doesNotMatch(source, /<textarea id="wr_content" name="wr_content" required><\?php echo \$content/);
      assert.doesNotMatch(source, /get_text\(\$content\)/);
      assert.doesNotMatch(source, /href="<\?php echo \$sungsan_cancel_url/);
      assert.doesNotMatch(source, /\$w === 'u'/);
      assert.doesNotMatch(source, /\$sungsan_write_file = isset\(\$file\[\$i\]\) \? \$file\[\$i\] : array\(\);/);
      assert.doesNotMatch(source, /isset\(\$file\[\$i\]\['file'\]\)/);
      assert.doesNotMatch(source, /get_text\(\$file\[\$i\]\['source'\]\)/);
    }

    const news = read('src/skin/board/sungsan_news/write.skin.php');

    for (const field of ['legacy_board_id', 'legacy_post_id', 'review_flag', 'review_reason']) {
      assert.match(news, new RegExp(`value="<\\?php echo get_text\\(\\$${field}\\); \\?>"`), `news write should escape ${field}`);
      assert.doesNotMatch(news, new RegExp(`value="<\\?php echo \\$${field}; \\?>"`), `news write should not echo raw ${field}`);
    }

    assert.match(news, /<option value="<\?php echo get_text\(\$category\); \?>"<\?php echo sungsan_selected\(\$ca_name, \$category\); \?>><\?php echo get_text\(\$category\); \?><\/option>/);
    assert.match(news, /<option value="<\?php echo get_text\(\$slug\); \?>"<\?php echo sungsan_selected\(\$group_slug, \$slug\); \?>><\?php echo get_text\(\$label\); \?><\/option>/);
    assert.match(news, /\$sungsan_event_start_date = isset\(\$write\['wr_3'\]\) \? \$write\['wr_3'\] : '';/);
    assert.match(news, /\$sungsan_event_end_date = isset\(\$write\['wr_4'\]\) \? \$write\['wr_4'\] : '';/);
    assert.match(news, /id="wr_3" name="wr_3" type="date" value="<\?php echo get_text\(\$sungsan_event_start_date\); \?>"/);
    assert.match(news, /id="wr_4" name="wr_4" type="date" value="<\?php echo get_text\(\$sungsan_event_end_date\); \?>"/);
    assert.doesNotMatch(news, /<option value="<\?php echo \$category; \?>"/);
    assert.doesNotMatch(news, /<option value="<\?php echo \$slug; \?>"/);
    assert.doesNotMatch(news, /><\?php echo \$category; \?><\/option>/);
    assert.doesNotMatch(news, /><\?php echo \$label; \?><\/option>/);
    assert.doesNotMatch(news, /value="<\?php echo isset\(\$write\['wr_3'\]\) \? get_text\(\$write\['wr_3'\]\) : ''; \?>"/);
    assert.doesNotMatch(news, /value="<\?php echo isset\(\$write\['wr_4'\]\) \? get_text\(\$write\['wr_4'\]\) : ''; \?>"/);
  });

  it('routes board write cancel links to list for new posts and view for edits', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(
        source,
        /\$sungsan_write_list_href = isset\(\$list_href\) \? \$list_href : get_pretty_url\(\$sungsan_write_board_id\);/,
        `${file} should default the list cancellation target`,
      );
      assert.match(
        source,
        /\$sungsan_cancel_url = \(\$sungsan_write_mode === 'u' && \$sungsan_write_wr_id > 0\) \? get_pretty_url\(\$sungsan_write_board_id, \$sungsan_write_wr_id\) : \$sungsan_write_list_href;/,
        `${file} should return edit cancellations to the current post`,
      );
      assert.match(
        source,
        /href="<\?php echo get_text\(\$sungsan_cancel_url\); \?>">취소<\/a>/,
        `${file} should render the escaped cancel target`,
      );
      assert.doesNotMatch(
        source,
        /href="<\?php echo get_text\(\$list_href\); \?>">취소<\/a>/,
        `${file} should not send every cancellation to the list`,
      );
    }
  });

  it('escapes board list and view links and text metadata before rendering posts', () => {
    const freeList = read('src/skin/board/sungsan_free/list.skin.php');

    assert.match(freeList, /href="<\?php echo get_text\(\$sungsan_free_write_href\); \?>"/);
    assert.match(freeList, /\$sungsan_free_row = \$sungsan_free_rows\[\$i\];/);
    assert.match(freeList, /\$sungsan_free_post_href = isset\(\$sungsan_free_row\['href'\]\) \? \$sungsan_free_row\['href'\] : '#';/);
    assert.match(freeList, /\$sungsan_free_post_subject = isset\(\$sungsan_free_row\['subject'\]\) \? \$sungsan_free_row\['subject'\] : '';/);
    assert.match(freeList, /\$sungsan_free_post_writer = isset\(\$sungsan_free_row\['wr_name'\]\) \? \$sungsan_free_row\['wr_name'\] : '';/);
    assert.match(freeList, /\$sungsan_free_post_date = isset\(\$sungsan_free_row\['datetime2'\]\) \? \$sungsan_free_row\['datetime2'\] : '';/);
    assert.match(freeList, /\$sungsan_free_post_hits = isset\(\$sungsan_free_row\['wr_hit'\]\) \? \(int\) \$sungsan_free_row\['wr_hit'\] : 0;/);
    assert.match(freeList, /\$sungsan_post_href = \$sungsan_free_is_member \? \$sungsan_free_post_href : sungsan_login_url\(\$sungsan_free_post_href\);/);
    assert.match(freeList, /href="<\?php echo get_text\(\$sungsan_post_href\); \?>"/);
    assert.match(freeList, /get_text\(\$sungsan_free_post_subject\)/);
    assert.match(freeList, /get_text\(\$sungsan_free_post_writer\)/);
    assert.match(freeList, /get_text\(\$sungsan_free_post_date\)/);
    assert.match(freeList, /number_format\(\$sungsan_free_post_hits\)/);
    assert.doesNotMatch(freeList, /href="<\?php echo \$write_href/);
    assert.doesNotMatch(freeList, /href="<\?php echo get_text\(\$write_href\); \?>"/);
    assert.doesNotMatch(freeList, /href="<\?php echo get_text\(\$list\[\$i\]\['href'\]\); \?>"/);
    assert.doesNotMatch(freeList, /get_text\(\$list\[\$i\]\['subject'\]\)/);
    assert.doesNotMatch(freeList, /get_text\(\$list\[\$i\]\['wr_name'\]\)/);
    assert.doesNotMatch(freeList, /get_text\(\$list\[\$i\]\['datetime2'\]\)/);
    assert.doesNotMatch(freeList, /number_format\(\(int\) \$list\[\$i\]\['wr_hit'\]\)/);
    assert.doesNotMatch(freeList, /echo \$list\[\$i\]\['name'\]/);

    const newsList = read('src/skin/board/sungsan_news/list.skin.php');

    assert.match(newsList, /\$sungsan_news_row = \$sungsan_news_rows\[\$i\];/);
    assert.match(newsList, /\$sungsan_news_post_raw_href = isset\(\$sungsan_news_row\['href'\]\) \? \$sungsan_news_row\['href'\] : '#';/);
    assert.match(newsList, /\$sungsan_news_post_href = \(!\$sungsan_news_is_member && !\$can_read_post\) \? sungsan_login_url\(\$sungsan_news_post_raw_href\) : \$sungsan_news_post_raw_href;/);
    assert.match(newsList, /\$sungsan_news_post_subject = isset\(\$sungsan_news_row\['subject'\]\) \? \$sungsan_news_row\['subject'\] : '';/);
    assert.match(newsList, /\$sungsan_news_post_category = isset\(\$sungsan_news_row\['ca_name'\]\) \? \$sungsan_news_row\['ca_name'\] : '';/);
    assert.match(newsList, /\$sungsan_news_post_date = isset\(\$sungsan_news_row\['datetime2'\]\) \? \$sungsan_news_row\['datetime2'\] : '';/);
    assert.match(newsList, /\$sungsan_news_post_hits = isset\(\$sungsan_news_row\['wr_hit'\]\) \? \(int\) \$sungsan_news_row\['wr_hit'\] : 0;/);
    assert.match(newsList, /href="<\?php echo get_text\(\$sungsan_news_post_href\); \?>"/);
    assert.match(newsList, /get_text\(\$sungsan_news_post_subject\)/);
    assert.match(newsList, /get_text\(\$sungsan_news_post_category\)/);
    assert.match(newsList, /get_text\(\$sungsan_news_post_date\)/);
    assert.match(newsList, /number_format\(\$sungsan_news_post_hits\)/);
    assert.doesNotMatch(newsList, /href="<\?php echo \$list\[\$i\]\['href'\]/);
    assert.doesNotMatch(newsList, /get_text\(\$list\[\$i\]\['subject'\]\)/);
    assert.doesNotMatch(newsList, /get_text\(\$list\[\$i\]\['ca_name'\]\)/);
    assert.doesNotMatch(newsList, /get_text\(\$list\[\$i\]\['datetime2'\]\)/);
    assert.doesNotMatch(newsList, /number_format\(\(int\) \$list\[\$i\]\['wr_hit'\]\)/);
    assert.match(newsList, /\$sungsan_news_list_url = G5_BBS_URL\.'\/board\.php\?bo_table='.\$sungsan_news_board_param.\$sungsan_news_search_query;/);
    assert.match(newsList, /\$sungsan_category_href = G5_BBS_URL\.'\/board\.php\?bo_table='.\$sungsan_news_board_param\.'&sca='\.urlencode\(\$category\).\$sungsan_news_search_query;/);
    assert.match(newsList, /href="<\?php echo get_text\(\$sungsan_news_list_url\); \?>"/);
    assert.match(newsList, /href="<\?php echo get_text\(\$sungsan_category_href\); \?>"/);
    assert.match(newsList, /<input type="hidden" name="bo_table" value="<\?php echo get_text\(\$sungsan_news_board_id\); \?>">/);
    assert.match(newsList, /<\?php echo get_text\(\$category\); \?><\/a>/);
    assert.doesNotMatch(newsList, /href="<\?php echo G5_BBS_URL; \?>\/board\.php\?bo_table=/);
    assert.doesNotMatch(newsList, /bo_table=<\?php echo \$bo_table; \?>/);
    assert.doesNotMatch(newsList, /><\?php echo \$category; \?><\/a>/);

    for (const file of [
      'src/skin/board/sungsan_news/view.skin.php',
      'src/skin/board/sungsan_free/view.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /\$sungsan_view_subject = isset\(\$view\['wr_subject'\]\) \? \$view\['wr_subject'\] : '';/, `${file} should normalize view subject`);
      assert.match(source, /\$sungsan_view_writer = isset\(\$view\['wr_name'\]\) \? \$view\['wr_name'\] : '';/, `${file} should normalize view author`);
      assert.match(source, /\$sungsan_view_date = isset\(\$view\['datetime'\]\) \? \$view\['datetime'\] : '';/, `${file} should normalize view datetime`);
      assert.match(source, /\$sungsan_view_hits = isset\(\$view\['wr_hit'\]\) \? \(int\) \$view\['wr_hit'\] : 0;/, `${file} should normalize view hit count`);
      assert.match(source, /\$sungsan_view_content = isset\(\$view\['content'\]\) \? \$view\['content'\] : '';/, `${file} should normalize view content`);
      assert.match(source, /\$sungsan_view_list_href = isset\(\$list_href\) \? \$list_href : get_pretty_url\(\$sungsan_view_board_id\);/, `${file} should normalize the list action href`);
      assert.match(source, /\$sungsan_view_update_href = isset\(\$update_href\) \? \$update_href : '';/, `${file} should normalize the update action href`);
      assert.match(source, /\$sungsan_view_delete_href = isset\(\$delete_href\) \? \$delete_href : '';/, `${file} should normalize the delete action href`);
      assert.match(source, /\$sungsan_view_files = \(isset\(\$view\['file'\]\) && is_array\(\$view\['file'\]\)\) \? \$view\['file'\] : array\(\);/, `${file} should normalize the attachment list`);
      assert.match(source, /\$sungsan_view_file_count = isset\(\$sungsan_view_files\['count'\]\) \? max\(0, \(int\) \$sungsan_view_files\['count'\]\) : 0;/, `${file} should normalize the attachment count`);
      assert.match(source, /get_text\(\$sungsan_view_subject\)/, `${file} should escape view subject`);
      assert.match(source, /get_text\(\$sungsan_view_date\)/, `${file} should escape view datetime`);
      assert.match(source, /get_text\(\$sungsan_view_writer\)/, `${file} should escape view author name`);
      assert.match(source, /number_format\(\$sungsan_view_hits\)/, `${file} should render normalized hit count`);
      assert.match(source, /get_view_thumbnail\(\$sungsan_view_content\)/, `${file} should render normalized content`);
      assert.match(source, /if \(\$sungsan_view_file_count > 0\)/, `${file} should render attachments from the normalized count`);
      assert.match(source, /for \(\$i = 0; \$i < \$sungsan_view_file_count; \$i\+\+\)/, `${file} should loop over normalized attachment count`);
      assert.match(source, /\$sungsan_view_file = isset\(\$sungsan_view_files\[\$i\]\) \? \$sungsan_view_files\[\$i\] : array\(\);/, `${file} should normalize each attachment row`);
      assert.match(source, /\$sungsan_view_file_href = isset\(\$sungsan_view_file\['href'\]\) \? \$sungsan_view_file\['href'\] : '#';/, `${file} should normalize attachment href`);
      assert.match(source, /\$sungsan_view_file_source = isset\(\$sungsan_view_file\['source'\]\) \? \$sungsan_view_file\['source'\] : '';/, `${file} should normalize attachment name`);
      assert.match(source, /if \(\$sungsan_view_file_source !== ''\)/, `${file} should test normalized attachment name`);
      assert.match(source, /href="<\?php echo get_text\(\$sungsan_view_file_href\); \?>"/, `${file} should escape attachment href`);
      assert.match(source, /get_text\(\$sungsan_view_file_source\)/, `${file} should escape attachment source`);
      assert.match(source, /href="<\?php echo get_text\(\$sungsan_view_list_href\); \?>"/, `${file} should escape normalized list href`);
      assert.match(source, /href="<\?php echo get_text\(\$sungsan_view_update_href\); \?>"/, `${file} should escape normalized update href`);
      assert.match(source, /href="<\?php echo get_text\(\$sungsan_view_delete_href\); \?>"/, `${file} should escape normalized delete href`);

      assert.doesNotMatch(source, /get_text\(\$view\['wr_subject'\]\)/);
      assert.doesNotMatch(source, /echo \$view\['datetime'\]/);
      assert.doesNotMatch(source, /get_text\(\$view\['datetime'\]\)/);
      assert.doesNotMatch(source, /echo \$view\['name'\]/);
      assert.doesNotMatch(source, /get_text\(\$view\['wr_name'\]\)/);
      assert.doesNotMatch(source, /number_format\(\$view\['wr_hit'\]\)/);
      assert.doesNotMatch(source, /number_format\(\(int\) \$view\['wr_hit'\]\)/);
      assert.doesNotMatch(source, /get_view_thumbnail\(\$view\['content'\]\)/);
      assert.doesNotMatch(source, /if \(!empty\(\$view\['file'\]\['count'\]\)\)/);
      assert.doesNotMatch(source, /for \(\$i = 0; \$i < \$view\['file'\]\['count'\]; \$i\+\+\)/);
      assert.doesNotMatch(source, /\$sungsan_view_file = isset\(\$view\['file'\]\[\$i\]\) \? \$view\['file'\]\[\$i\] : array\(\);/);
      assert.doesNotMatch(source, /href="<\?php echo \$view\['file'\]\[\$i\]\['href'\]/);
      assert.doesNotMatch(source, /get_text\(\$view\['file'\]\[\$i\]\['href'\]\)/);
      assert.doesNotMatch(source, /get_text\(\$view\['file'\]\[\$i\]\['source'\]\)/);
      assert.doesNotMatch(source, /href="<\?php echo \$list_href/);
      assert.doesNotMatch(source, /href="<\?php echo \$update_href/);
      assert.doesNotMatch(source, /href="<\?php echo \$delete_href/);
      assert.doesNotMatch(source, /get_text\(\$list_href\)/);
      assert.doesNotMatch(source, /get_text\(\$update_href\)/);
      assert.doesNotMatch(source, /get_text\(\$delete_href\)/);
    }

    const newsView = read('src/skin/board/sungsan_news/view.skin.php');

    assert.match(newsView, /\$sungsan_view_category = isset\(\$view\['ca_name'\]\) \? \$view\['ca_name'\] : '';/);
    assert.match(newsView, /if \(\$sungsan_view_category !== ''\) \{ \?><span class="ss-badge"><\?php echo get_text\(\$sungsan_view_category\); \?><\/span><\?php \} \?>/);
    assert.doesNotMatch(newsView, /get_text\(\$view\['ca_name'\]\)/);
  });

  it('normalizes board list chrome values before rendering', () => {
    const cases = [
      {
        file: 'src/skin/board/sungsan_news/list.skin.php',
        boardId: 'sungsan_news_board_id',
        subject: 'sungsan_news_board_subject',
        writeHref: 'sungsan_news_write_href',
        writePages: 'sungsan_news_write_pages',
        rows: 'sungsan_news_rows',
        fallbackId: 'news',
        fallbackSubject: '소식',
      },
      {
        file: 'src/skin/board/sungsan_free/list.skin.php',
        boardId: 'sungsan_free_board_id',
        subject: 'sungsan_free_board_subject',
        writeHref: 'sungsan_free_write_href',
        writePages: 'sungsan_free_write_pages',
        rows: 'sungsan_free_rows',
        fallbackId: 'free',
        fallbackSubject: '자유게시판',
      },
    ];

    for (const item of cases) {
      const source = read(item.file);

      assert.match(source, new RegExp(`\\$${item.boardId} = isset\\(\\$bo_table\\) \\? \\$bo_table : '${item.fallbackId}';`));
      assert.match(source, new RegExp(`\\$${item.subject} = isset\\(\\$board\\['bo_subject'\\]\\) \\? \\$board\\['bo_subject'\\] : '${item.fallbackSubject}';`));
      assert.match(source, new RegExp(`\\$${item.writeHref} = isset\\(\\$write_href\\) \\? \\$write_href : '';`));
      assert.match(source, new RegExp(`\\$${item.writePages} = isset\\(\\$write_pages\\) \\? \\$write_pages : '';`));
      assert.match(source, new RegExp(`\\$${item.rows} = \\(isset\\(\\$list\\) && is_array\\(\\$list\\)\\) \\? \\$list : array\\(\\);`));
      assert.match(source, new RegExp(`<h1 class="ss-section-title"><\\?php echo get_text\\(\\$${item.subject}\\); \\?></h1>`));
      assert.match(source, new RegExp(`if \\(\\$${item.writeHref} !== ''\\)`));
      assert.match(source, new RegExp(`href="<\\?php echo get_text\\(\\$${item.writeHref}\\); \\?>"`));
      assert.match(source, new RegExp(`count\\(\\$${item.rows}\\)`));
      assert.match(source, new RegExp(`\\$${item.rows}\\[\\$i\\]`));
      assert.match(source, new RegExp(`if \\(\\$${item.writePages} !== ''\\)`));
      assert.match(source, new RegExp(`<nav class="ss-pagination" aria-label="페이지 이동"><\\?php echo \\$${item.writePages}; \\?></nav>`));
      assert.doesNotMatch(source, /get_text\(\$board\['bo_subject'\]\)/);
      assert.doesNotMatch(source, /if \(\$write_href\)/);
      assert.doesNotMatch(source, /href="<\?php echo get_text\(\$write_href\); \?>"/);
      assert.doesNotMatch(source, /count\(\$list\)/);
      assert.doesNotMatch(source, /\$list\[\$i\]/);
      assert.doesNotMatch(source, /if \(\$write_pages\)/);
      assert.doesNotMatch(source, /echo \$write_pages/);
    }
  });

  it('renders board list and detail dates as semantic time elements', () => {
    const newsList = read('src/skin/board/sungsan_news/list.skin.php');
    const freeList = read('src/skin/board/sungsan_free/list.skin.php');

    assert.match(newsList, /\$sungsan_news_post_datetime = isset\(\$sungsan_news_row\['datetime'\]\) \? \$sungsan_news_row\['datetime'\] : \$sungsan_news_post_date;/);
    assert.match(newsList, /<time datetime="<\?php echo get_text\(\$sungsan_news_post_datetime\); \?>"><\?php echo get_text\(\$sungsan_news_post_date\); \?><\/time>/);
    assert.doesNotMatch(newsList, /<span><\?php echo get_text\(\$sungsan_news_post_date\); \?><\/span>/);

    assert.match(freeList, /\$sungsan_free_post_datetime = isset\(\$sungsan_free_row\['datetime'\]\) \? \$sungsan_free_row\['datetime'\] : \$sungsan_free_post_date;/);
    assert.match(freeList, /<time datetime="<\?php echo get_text\(\$sungsan_free_post_datetime\); \?>"><\?php echo get_text\(\$sungsan_free_post_date\); \?><\/time>/);
    assert.doesNotMatch(freeList, /<span><\?php echo get_text\(\$sungsan_free_post_date\); \?><\/span>/);

    for (const file of [
      'src/skin/board/sungsan_news/view.skin.php',
      'src/skin/board/sungsan_free/view.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /<time datetime="<\?php echo get_text\(\$sungsan_view_date\); \?>"><\?php echo get_text\(\$sungsan_view_date\); \?><\/time>/, `${file} should expose detail date as time`);
      assert.doesNotMatch(source, /<span><\?php echo get_text\(\$sungsan_view_date\); \?><\/span>/, `${file} should not render detail date as a plain span`);
    }
  });

  it('renders home and mypage summary dates as semantic time elements', () => {
    const extend = read('src/extend/sungsan.php');
    const index = read('src/theme/sungsan/index.php');
    const mypage = read('src/pages/mypage.php');

    assert.match(extend, /\$row\['datetime'\] = \$row\['wr_datetime'\];/);
    assert.match(extend, /'datetime'\s*=>\s*\$row\['wr_datetime'\]/);

    assert.match(index, /\$sungsan_home_media_datetime = isset\(\$sungsan_home_media_post\['datetime'\]\) \? \$sungsan_home_media_post\['datetime'\] : \$sungsan_home_media_date;/);
    assert.match(index, /<time datetime="<\?php echo get_text\(\$sungsan_home_media_datetime\); \?>"><\?php echo get_text\(\$sungsan_home_media_date\); \?><\/time>/);
    assert.match(index, /\$sungsan_home_post_datetime = \$show_event_date && \$sungsan_home_post_event_date !== '' \? \$sungsan_home_post_event_date : \(isset\(\$sungsan_home_post\['datetime'\]\) \? \$sungsan_home_post\['datetime'\] : \$sungsan_home_post_date\);/);
    assert.match(index, /\$sungsan_home_post_display_date = \$show_event_date && \$sungsan_home_post_event_date !== '' \? \$sungsan_home_post_event_date : \$sungsan_home_post_date;/);
    assert.match(index, /<time datetime="<\?php echo get_text\(\$sungsan_home_post_datetime\); \?>"><\?php echo get_text\(\$sungsan_home_post_display_date\); \?><\/time>/);
    assert.doesNotMatch(index, /<span><\?php echo get_text\(\$sungsan_home_media_date\); \?><\/span>/);
    assert.doesNotMatch(index, /<span><\?php echo get_text\(\$sungsan_home_post_date\); \?><\/span>/);

    assert.match(mypage, /\$sungsan_recent_post_datetime = isset\(\$recent_posts\[\$i\]\['datetime'\]\) \? \$recent_posts\[\$i\]\['datetime'\] : \$recent_posts\[\$i\]\['date'\];/);
    assert.match(mypage, /<time datetime="<\?php echo get_text\(\$sungsan_recent_post_datetime\); \?>"><\?php echo get_text\(\$recent_posts\[\$i\]\['date'\]\); \?><\/time>/);
    assert.doesNotMatch(mypage, /<span><\?php echo get_text\(\$recent_posts\[\$i\]\['date'\]\); \?><\/span>/);
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

  it('aggregates home media from activity posts with image or video attachments', () => {
    const extend = read('src/extend/sungsan.php');
    const index = read('src/theme/sungsan/index.php');

    assert.match(
      index,
      /\$photo_posts = sungsan_latest_board_posts\('news', array\('category' => \$sungsan_home_activity_category, 'mediaOnly' => true, 'thumbnail' => true, 'limit' => 4\)\);/,
    );
    assert.doesNotMatch(index, /'groupSlug' => 'photo', 'thumbnail' => true/);

    assert.match(extend, /\$media_only = !empty\(\$args\['mediaOnly'\]\);/);
    assert.match(extend, /\$media_extensions = array\('jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm'\);/);
    assert.match(extend, /\$g5\['board_file_table'\]/);
    assert.match(extend, /sungsan_media_file\.bo_table = '\"\.sql_escape_string\(\$board_id\)\."'/);
    assert.match(extend, /sungsan_media_file\.wr_id = \{\$write_table\}\.wr_id/);
    assert.match(extend, /lower\(sungsan_media_file\.bf_source\)/);
    assert.match(extend, /lower\(sungsan_media_file\.bf_file\)/);
  });

  it('shows a visible home media fallback when thumbnails are unavailable', () => {
    const index = read('src/theme/sungsan/index.php');
    const css = read('src/scss/main.scss');

    assert.match(index, /<span class="ss-media-thumb ss-media-thumb-fallback">사진·영상<\/span>/);
    assert.doesNotMatch(index, /<span class="ss-media-thumb" aria-hidden="true"><\/span>/);
    assert.match(css, /\.ss-media-thumb-fallback\s*\{/);
    assert.match(css, /place-items:\s*center/);
    assert.match(css, /font-weight:\s*800/);
  });

  it('marks restricted home media posts with visibility and login return targets', () => {
    const index = read('src/theme/sungsan/index.php');
    const css = read('src/scss/main.scss');

    assert.match(index, /\$sungsan_home_media_raw_href = isset\(\$sungsan_home_media_post\['href'\]\) \? \$sungsan_home_media_post\['href'\] : '#';/);
    assert.match(index, /\$sungsan_home_media_visibility = isset\(\$sungsan_home_media_post\['wr_2'\]\) \? \$sungsan_home_media_post\['wr_2'\] : '';/);
    assert.match(index, /\$sungsan_home_media_visibility_label = \$sungsan_home_media_visibility !== '' \? sungsan_get_visibility_label\(\$sungsan_home_media_visibility\) : '';/);
    assert.match(index, /\$sungsan_home_media_can_read = \$sungsan_home_media_visibility === '' \|\| sungsan_can_read_visibility\(\$sungsan_home_media_visibility\);/);
    assert.match(index, /\$sungsan_home_media_requires_login = !\$is_member && !\$sungsan_home_media_can_read;/);
    assert.match(index, /\$sungsan_home_media_href = \$sungsan_home_media_requires_login \? sungsan_login_url\(\$sungsan_home_media_raw_href\) : \$sungsan_home_media_raw_href;/);
    assert.match(index, /<a class="ss-media-tile<\?php echo \$sungsan_home_media_can_read \? '' : ' restricted'; \?>" href="<\?php echo get_text\(\$sungsan_home_media_href\); \?>">/);
    assert.match(index, /<\?php if \(\$sungsan_home_media_visibility_label !== ''\) \{ \?><span class="ss-access-label"><\?php echo get_text\(\$sungsan_home_media_visibility_label\); \?><\/span><\?php \} \?>/);
    assert.match(css, /\.ss-media-tile\.restricted\s*\{/);
  });

  it('puts pinned home notices before ordinary latest notices', () => {
    const extend = read('src/extend/sungsan.php');
    const index = read('src/theme/sungsan/index.php');
    const css = read('src/scss/main.scss');

    assert.match(
      index,
      /\$notice_posts = sungsan_latest_board_posts\('news', array\('category' => \$sungsan_home_notice_category, 'includeNotice' => true, 'limit' => 5\)\);/,
    );
    assert.match(extend, /\$include_notice = !empty\(\$args\['includeNotice'\]\);/);
    assert.match(extend, /select bo_notice from \{\$g5\['board_table'\]\}/);
    assert.match(extend, /explode\(',', trim\(\$board_row\['bo_notice'\]\)\)/);
    assert.match(extend, /wr_id in \("\.implode\(',', \$notice_ids\)\."\)/);
    assert.match(extend, /\$where\[\] = 'wr_id not in \('\.implode\(',', \$notice_ids\)\.'\)';/);
    assert.match(extend, /\$row\['is_notice'\] = \$is_notice;/);
    assert.match(index, /\$sungsan_home_post_is_notice = !empty\(\$sungsan_home_post\['is_notice'\]\);/);
    assert.match(index, /<span class="ss-pin-label">중요<\/span>/);
    assert.match(css, /\.ss-pin-label\s*\{/);
  });

  it('escapes home and latest post links and titles before rendering latest content', () => {
    const index = read('src/theme/sungsan/index.php');
    const latest = read('src/skin/latest/sungsan_list/latest.skin.php');

    assert.match(index, /\$sungsan_home_media_post = \$photo_posts\[\$i\];/);
    assert.match(index, /\$sungsan_home_media_raw_href = isset\(\$sungsan_home_media_post\['href'\]\) \? \$sungsan_home_media_post\['href'\] : '#';/);
    assert.match(index, /\$sungsan_home_media_thumb = isset\(\$sungsan_home_media_post\['thumb_src'\]\) \? \$sungsan_home_media_post\['thumb_src'\] : '';/);
    assert.match(index, /\$sungsan_home_media_alt = isset\(\$sungsan_home_media_post\['thumb_alt'\]\) \? \$sungsan_home_media_post\['thumb_alt'\] : '';/);
    assert.match(index, /\$sungsan_home_media_subject = isset\(\$sungsan_home_media_post\['subject'\]\) \? \$sungsan_home_media_post\['subject'\] : '';/);
    assert.match(index, /\$sungsan_home_media_date = isset\(\$sungsan_home_media_post\['date'\]\) \? \$sungsan_home_media_post\['date'\] : '';/);
    assert.match(index, /\$sungsan_home_media_datetime = isset\(\$sungsan_home_media_post\['datetime'\]\) \? \$sungsan_home_media_post\['datetime'\] : \$sungsan_home_media_date;/);
    assert.match(index, /href="<\?php echo get_text\(\$sungsan_home_media_href\); \?>"/);
    assert.match(index, /src="<\?php echo get_text\(\$sungsan_home_media_thumb\); \?>"/);
    assert.match(index, /alt="<\?php echo get_text\(\$sungsan_home_media_alt\); \?>"/);
    assert.match(index, /<strong><\?php echo get_text\(\$sungsan_home_media_subject\); \?><\/strong>/);
    assert.match(index, /<time datetime="<\?php echo get_text\(\$sungsan_home_media_datetime\); \?>"><\?php echo get_text\(\$sungsan_home_media_date\); \?><\/time>/);
    assert.match(index, /\$sungsan_home_post = \$posts\[\$i\];/);
    assert.match(index, /\$sungsan_home_post_raw_href = isset\(\$sungsan_home_post\['href'\]\) \? \$sungsan_home_post\['href'\] : '#';/);
    assert.match(index, /\$sungsan_home_post_subject = isset\(\$sungsan_home_post\['subject'\]\) \? \$sungsan_home_post\['subject'\] : '';/);
    assert.match(index, /\$sungsan_home_post_category = isset\(\$sungsan_home_post\['ca_name'\]\) \? \$sungsan_home_post\['ca_name'\] : '';/);
    assert.match(index, /\$sungsan_home_post_group = isset\(\$sungsan_home_post\['wr_1'\]\) \? \$sungsan_home_post\['wr_1'\] : '';/);
    assert.match(index, /\$sungsan_home_post_event_date = isset\(\$sungsan_home_post\['wr_3'\]\) \? \$sungsan_home_post\['wr_3'\] : '';/);
    assert.match(index, /\$sungsan_home_post_date = isset\(\$sungsan_home_post\['date'\]\) \? \$sungsan_home_post\['date'\] : '';/);
    assert.match(index, /\$sungsan_home_post_datetime = \$show_event_date && \$sungsan_home_post_event_date !== '' \? \$sungsan_home_post_event_date : \(isset\(\$sungsan_home_post\['datetime'\]\) \? \$sungsan_home_post\['datetime'\] : \$sungsan_home_post_date\);/);
    assert.match(index, /\$sungsan_home_post_display_date = \$show_event_date && \$sungsan_home_post_event_date !== '' \? \$sungsan_home_post_event_date : \$sungsan_home_post_date;/);
    assert.match(index, /href="<\?php echo get_text\(\$sungsan_home_post_href\); \?>"/);
    assert.match(index, /get_text\(\$sungsan_home_post_subject\)/);
    assert.match(index, /get_text\(\$sungsan_home_post_category\)/);
    assert.match(index, /sungsan_get_group_label\(\$sungsan_home_post_group\)/);
    assert.match(index, /get_text\(\$sungsan_home_post_datetime\)/);
    assert.match(index, /get_text\(\$sungsan_home_post_display_date\)/);
    assert.doesNotMatch(index, /href="<\?php echo \$photo_posts\[\$i\]\['href'\]/);
    assert.doesNotMatch(index, /get_text\(\$photo_posts\[\$i\]\['href'\]\)/);
    assert.doesNotMatch(index, /get_text\(\$photo_posts\[\$i\]\['thumb_src'\]\)/);
    assert.doesNotMatch(index, /get_text\(\$photo_posts\[\$i\]\['thumb_alt'\]\)/);
    assert.doesNotMatch(index, /get_text\(\$photo_posts\[\$i\]\['subject'\]\)/);
    assert.doesNotMatch(index, /get_text\(\$photo_posts\[\$i\]\['date'\]\)/);
    assert.doesNotMatch(index, /href="<\?php echo \$sungsan_home_post_href/);
    assert.doesNotMatch(index, /htmlspecialchars_decode\(\$posts\[\$i\]\['href'\]/);
    assert.doesNotMatch(index, /get_text\(\$posts\[\$i\]\['subject'\]\)/);
    assert.doesNotMatch(index, /get_text\(\$posts\[\$i\]\['ca_name'\]\)/);
    assert.doesNotMatch(index, /sungsan_get_group_label\(\$posts\[\$i\]\['wr_1'\]\)/);
    assert.doesNotMatch(index, /get_text\(\$posts\[\$i\]\['wr_3'\]\)/);
    assert.doesNotMatch(index, /get_text\(\$posts\[\$i\]\['date'\]\)/);
    assert.doesNotMatch(index, /echo \$posts\[\$i\]\['subject'\]/);

    assert.match(latest, /\$sungsan_latest_row = \$sungsan_latest_rows\[\$i\];/);
    assert.match(latest, /\$sungsan_latest_href = isset\(\$sungsan_latest_row\['href'\]\) \? \$sungsan_latest_row\['href'\] : '#';/);
    assert.match(latest, /\$sungsan_latest_subject = isset\(\$sungsan_latest_row\['subject'\]\) \? \$sungsan_latest_row\['subject'\] : '';/);
    assert.match(latest, /\$sungsan_latest_category = isset\(\$sungsan_latest_row\['ca_name'\]\) \? \$sungsan_latest_row\['ca_name'\] : '';/);
    assert.match(latest, /\$sungsan_latest_date = isset\(\$sungsan_latest_row\['datetime2'\]\) \? \$sungsan_latest_row\['datetime2'\] : '';/);
    assert.match(latest, /href="<\?php echo get_text\(\$sungsan_latest_href\); \?>"/);
    assert.match(latest, /get_text\(\$sungsan_latest_subject\)/);
    assert.match(latest, /get_text\(\$sungsan_latest_category\)/);
    assert.match(latest, /get_text\(\$sungsan_latest_date\)/);
    assert.doesNotMatch(latest, /href="<\?php echo \$list\[\$i\]\['href'\]/);
    assert.doesNotMatch(latest, /get_text\(\$list\[\$i\]\['href'\]\)/);
    assert.doesNotMatch(latest, /get_text\(\$list\[\$i\]\['subject'\]\)/);
    assert.doesNotMatch(latest, /get_text\(\$list\[\$i\]\['ca_name'\]\)/);
    assert.doesNotMatch(latest, /get_text\(\$list\[\$i\]\['datetime2'\]\)/);
    assert.doesNotMatch(latest, /\$sungsan_latest_row = \$list\[\$i\];/);
  });

  it('normalizes latest skin rows before rendering', () => {
    const latest = read('src/skin/latest/sungsan_list/latest.skin.php');

    assert.match(latest, /\$sungsan_latest_rows = \(isset\(\$list\) && is_array\(\$list\)\) \? \$list : array\(\);/);
    assert.match(latest, /for \(\$i = 0; \$i < count\(\$sungsan_latest_rows\); \$i\+\+\)/);
    assert.match(latest, /\$sungsan_latest_row = \$sungsan_latest_rows\[\$i\];/);
    assert.match(latest, /if \(count\(\$sungsan_latest_rows\) === 0\)/);
    assert.doesNotMatch(latest, /count\(\$list\)/);
    assert.doesNotMatch(latest, /\$list\[\$i\]/);
  });

  it('escapes home page static action and section URLs before rendering attributes', () => {
    const index = read('src/theme/sungsan/index.php');

    for (const variable of [
      'ss_home_news_url',
      'ss_home_intro_url',
      'ss_home_notice_url',
      'ss_home_event_url',
      'ss_home_resource_url',
      'ss_home_free_url',
      'ss_home_activity_url',
    ]) {
      assert.match(index, new RegExp(`\\$${variable} = `), `home should define ${variable}`);
      assert.match(
        index,
        new RegExp(`href="<\\?php echo get_text\\(\\$${variable}\\); \\?>"`),
        `home should escape ${variable}`,
      );
    }

    assert.doesNotMatch(index, /href="<\?php echo G5_URL; \?>/);
    assert.doesNotMatch(index, /href="<\?php echo G5_BBS_URL; \?>/);
  });

  it('marks home free-board posts as member-readable before visitors open them', () => {
    const index = read('src/theme/sungsan/index.php');

    assert.match(
      index,
      /sungsan_render_home_list\(\$free_posts, '등록된 자유게시판 글이 없습니다\.', false, false, '회원 열람'\)/,
    );
    assert.match(index, /function sungsan_render_home_list\(\$posts, \$empty_text, \$show_event_date = false, \$show_category = true, \$access_label = ''\)/);
    assert.match(index, /<\?php if \(\$access_label\) \{ \?><span class="ss-access-label"><\?php echo get_text\(\$access_label\); \?><\/span><\?php \} \?>/);
  });

  it('keeps guest home free-board rows title-only until login', () => {
    const index = read('src/theme/sungsan/index.php');

    assert.match(
      index,
      /sungsan_render_home_list\(\$free_posts, '등록된 자유게시판 글이 없습니다\.', false, false, '회원 열람'\)/,
    );
    assert.match(
      index,
      /<div class="ss-meta">\s*<\?php if \(\$access_label && !\$is_member\) \{ \?>[\s\S]*?<span class="ss-access-label">회원 전용 글입니다\. 로그인하면 작성자와 날짜를 볼 수 있습니다\.<\/span>[\s\S]*?<\?php \} else \{ \?>[\s\S]*?<time datetime="<\?php echo get_text\(\$sungsan_home_post_datetime\); \?>">[\s\S]*?<\?php \} \?>\s*<\/div>/,
    );
    assert.doesNotMatch(
      index,
      /<div class="ss-meta">\s*<\?php if \(\$sungsan_home_post_is_notice\)/,
    );
  });

  it('sends guest home free-board post clicks to login with the post as return target', () => {
    const index = read('src/theme/sungsan/index.php');

    assert.match(index, /global \$is_member;/);
    assert.match(index, /\$sungsan_requires_login = !\$is_member && \(\$access_label \|\| !\$sungsan_home_post_can_read\);/);
    assert.match(index, /\$sungsan_home_post_href = \$sungsan_requires_login \? sungsan_login_url\(\$sungsan_home_post_raw_href\) : \$sungsan_home_post_raw_href;/);
    assert.match(index, /\$sungsan_home_post_restricted = \$sungsan_requires_login \|\| !\$sungsan_home_post_can_read;/);
    assert.match(index, /class="ss-post-row<\?php echo \$sungsan_home_post_restricted \? ' restricted' : ''; \?>"/);
    assert.match(index, /href="<\?php echo get_text\(\$sungsan_home_post_href\); \?>"/);
  });

  it('keeps restricted news posts visible in home summaries while marking visibility', () => {
    const extend = read('src/extend/sungsan.php');
    const index = read('src/theme/sungsan/index.php');
    const latestFunction = extend.match(/function sungsan_latest_board_posts\(\$bo_table, \$args = array\(\)\)[\s\S]*?\n}\n\nfunction sungsan_member_recent_posts/)[0];

    assert.match(latestFunction, /\(wr_7 <> 'review_required' or wr_7 is null\)/);
    assert.doesNotMatch(latestFunction, /\$level = isset\(\$member\['mb_level'\]\)/);
    assert.doesNotMatch(latestFunction, /wr_2 = 'public'/);
    assert.doesNotMatch(latestFunction, /wr_2 in \('public', 'member'\)/);

    assert.match(index, /\$sungsan_home_post_visibility = isset\(\$sungsan_home_post\['wr_2'\]\) \? \$sungsan_home_post\['wr_2'\] : '';/);
    assert.match(index, /\$sungsan_home_post_visibility_label = \$sungsan_home_post_visibility !== '' \? sungsan_get_visibility_label\(\$sungsan_home_post_visibility\) : '';/);
    assert.match(index, /\$sungsan_home_post_can_read = \$sungsan_home_post_visibility === '' \|\| sungsan_can_read_visibility\(\$sungsan_home_post_visibility\);/);
    assert.match(index, /<\?php if \(\$sungsan_home_post_visibility_label !== ''\) \{ \?><span class="ss-access-label"><\?php echo get_text\(\$sungsan_home_post_visibility_label\); \?><\/span><\?php \} \?>/);
  });

  it('uses an operational empty state for home media instead of migration placeholders', () => {
    const index = read('src/theme/sungsan/index.php');

    assert.match(index, /등록된 사진·영상 자료가 없습니다/);
    assert.match(index, /활동소식에 사진이나 영상이 포함된 글이 올라오면/);
    assert.doesNotMatch(index, /사진자료 이전 준비 중/);
    assert.doesNotMatch(index, /기존 사진자료/);
    assert.doesNotMatch(index, /이전 준비 중/);
  });

  it('keeps the intro page usable without future replacement placeholders', () => {
    const intro = read('src/theme/sungsan/page/intro.php');

    for (const heading of ['인사말', '성산헌장', '연혁', '조직', '성산회가']) {
      assert.match(intro, new RegExp(`<h2>${heading}</h2>`));
    }

    assert.match(intro, /단체가 어떤 곳인지 한 페이지에서 이해/);
    assert.match(intro, /성산회의 목적과 회원 활동의 기준/);
    assert.match(intro, /공개 범위 확인이 필요한 자료/);
    assert.doesNotMatch(intro, /원문은 이전 리허설 후/);
    assert.doesNotMatch(intro, /최종 문안으로 교체/);
    assert.doesNotMatch(intro, /전문을 게시합니다/);
    assert.doesNotMatch(intro, /자료 이전 대상임/);
  });

  it('guards news attachment downloads with per-post visibility', () => {
    const file = 'src/skin/board/sungsan_news/download.head.skin.php';

    assert.equal(existsSync(path.join(repoRoot, file)), true, `${file} should exist`);

    const source = read(file);
    const extend = read('src/extend/sungsan.php');

    assert.match(source, /\$write\['wr_2'\]/);
    assert.match(source, /sungsan_can_read_news_post\(\$write\)/);
    assert.match(source, /sungsan_get_visibility_label\(\$visibility\)/);
    assert.match(source, /sungsan_login_url\(\$sungsan_news_download_return_url\)/);
    assert.match(source, /get_pretty_url\(\$bo_table,\s*\$wr_id\)/);
    assert.match(source, /alert\(/);
    assert.match(extend, /sungsan_can_read_visibility\(\$visibility\)/);
  });

  it('escapes news download visibility labels before composing permission alerts', () => {
    const source = read('src/skin/board/sungsan_news/download.head.skin.php');

    assert.match(source, /\$visibility_label = get_text\(sungsan_get_visibility_label\(\$visibility\)\);/);
    assert.match(source, /\$message = \$visibility_label\./);
    assert.match(source, /\$message = '[^']*'\.\$visibility_label\./);
    assert.doesNotMatch(source, /\$message = sungsan_get_visibility_label\(\$visibility\)\./);
    assert.doesNotMatch(source, /\$message = '[^']*'\.sungsan_get_visibility_label\(\$visibility\)/);
  });

  it('separates login redirects from insufficient-permission alerts for news downloads', () => {
    const source = read('src/skin/board/sungsan_news/download.head.skin.php');

    assert.match(source, /global \$is_member;/);
    assert.match(source, /\$sungsan_news_download_is_member = !empty\(\$is_member\);/);
    assert.match(source, /\$is_review_restricted = function_exists\('sungsan_is_review_restricted'\) && sungsan_is_review_restricted\(\$write\);/);
    assert.match(source, /\$sungsan_show_login_redirect = !\$sungsan_news_download_is_member && !\$is_review_restricted;/);
    assert.match(source, /권한이 있는 계정으로 로그인하면 첨부를 내려받을 수 있습니다\./);
    assert.match(source, /현재 계정으로는 이 첨부 파일을 내려받을 수 없습니다\./);
    assert.match(source, /if \(\$sungsan_show_login_redirect\) \{[\s\S]*?sungsan_login_url\(\$sungsan_news_download_return_url\)[\s\S]*?\}[\s\S]*?alert\(\$message\);/);
    assert.doesNotMatch(source, /로그인 후 권한을 확인해 주세요/);
    assert.doesNotMatch(source, /!\s*empty\(\$member\['mb_id'\]\)/);
  });

  it('uses the centralized login helper for news download redirects', () => {
    const source = read('src/skin/board/sungsan_news/download.head.skin.php');

    assert.match(source, /\$sungsan_news_download_return_url = get_pretty_url\(\$bo_table, \$wr_id\);/);
    assert.match(source, /\$sungsan_news_download_login_url = sungsan_login_url\(\$sungsan_news_download_return_url\);/);
    assert.match(source, /alert\(\$message, \$sungsan_news_download_login_url\);/);
    assert.doesNotMatch(source, /G5_BBS_URL\.'\/login\.php\?wr_id='/);
    assert.doesNotMatch(source, /\$qstr\.'&url='/);
  });

  it('preserves migrated news audit metadata when posts are edited', () => {
    const source = read('src/skin/board/sungsan_news/write.skin.php');

    for (const field of ['wr_5', 'wr_6', 'wr_7', 'wr_8']) {
      assert.match(source, new RegExp(`name="${field}"`));
      assert.match(source, new RegExp(`\\$write\\['${field}'\\]`));
    }
  });

  it('prevents non-admin news edits from tampering migrated audit metadata', () => {
    const extend = read('src/extend/sungsan.php');
    const updateHead = read('src/skin/board/sungsan_news/write_update.head.skin.php');

    assert.match(extend, /function sungsan_preserve_news_migration_fields/);
    assert.match(extend, /global \$w, \$wr, \$is_admin, \$wr_5, \$wr_6, \$wr_7, \$wr_8/);
    assert.match(extend, /\$w !== 'u'/);
    assert.match(extend, /\$wr_5 = isset\(\$wr\['wr_5'\]\)/);
    assert.match(extend, /\$wr_6 = isset\(\$wr\['wr_6'\]\)/);
    assert.match(extend, /!\$is_admin/);
    assert.match(extend, /\$wr_7 = isset\(\$wr\['wr_7'\]\)/);
    assert.match(extend, /\$wr_8 = isset\(\$wr\['wr_8'\]\)/);
    assert.match(updateHead, /sungsan_preserve_news_migration_fields\(\)/);
  });

  it('normalizes posted news metadata before the core write handler stores it', () => {
    const extend = read('src/extend/sungsan.php');
    const updateHead = read('src/skin/board/sungsan_news/write_update.head.skin.php');

    assert.match(extend, /function sungsan_normalize_news_write_fields\(\)/);
    assert.match(extend, /global \$sungsan_groups;/);
    assert.match(extend, /global \$wr_1, \$wr_2, \$wr_3, \$wr_4;/);
    assert.match(extend, /\$allowed_visibilities = array\('public', 'member', 'officer'\);/);
    assert.match(extend, /if \(!isset\(\$sungsan_groups\[\$wr_1\]\)\) \{/);
    assert.match(extend, /\$wr_1 = '';/);
    assert.match(extend, /if \(!in_array\(\$wr_2, \$allowed_visibilities, true\)\) \{/);
    assert.match(extend, /\$wr_2 = 'member';/);
    assert.match(extend, /preg_match\('\/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\/', \$wr_3\)/);
    assert.match(extend, /preg_match\('\/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\/', \$wr_4\)/);
    assert.match(
      updateHead,
      /sungsan_preserve_news_migration_fields\(\);\s*\n\s*sungsan_normalize_news_write_fields\(\);\s*\n\s*sungsan_reject_blocked_uploads\(\$_FILES\);/,
    );
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

    assert.match(list, /sungsan_can_read_news_post\(\$sungsan_news_row\)/);
    assert.match(view, /sungsan_can_read_news_post\(\$view\)/);
    assert.match(download, /sungsan_can_read_news_post\(\$write\)/);
  });

  it('separates login guidance from insufficient-permission guidance on restricted news detail', () => {
    const view = read('src/skin/board/sungsan_news/view.skin.php');

    assert.match(view, /global \$is_member;/);
    assert.match(view, /\$sungsan_view_is_member = !empty\(\$is_member\);/);
    assert.match(view, /\$sungsan_show_login_cta = !\$sungsan_view_is_member && !sungsan_is_review_restricted\(\$view\);/);
    assert.match(view, /\$sungsan_request_uri = isset\(\$_SERVER\['REQUEST_URI'\]\) \? \$_SERVER\['REQUEST_URI'\] : '';/);
    assert.match(view, /\$sungsan_login_url = sungsan_login_url\(\$sungsan_request_uri\);/);
    assert.match(view, /권한이 있는 계정으로 로그인하면 본문과 첨부를 볼 수 있습니다\./);
    assert.match(view, /현재 계정으로는 이 글을 열람할 수 없습니다\./);
    assert.match(view, /<\?php if \(\$sungsan_show_login_cta\) \{ \?>[\s\S]*?로그인[\s\S]*?<\?php \} else \{ \?>[\s\S]*?목록으로 돌아가기/);
    assert.doesNotMatch(view, /urlencode\(\$_SERVER\['REQUEST_URI'\]\)/);
  });

  it('escapes news detail visibility labels before composing access guidance', () => {
    const view = read('src/skin/board/sungsan_news/view.skin.php');

    assert.match(view, /\$visibility_label = get_text\(sungsan_get_visibility_label\(\$visibility\)\);/);
    assert.match(view, /\$access_message = '[^']*'\.\$visibility_label\./);
    assert.doesNotMatch(view, /\$access_message = '[^']*'\.sungsan_get_visibility_label\(\$visibility\)/);
  });

  it('keeps restricted news visible in lists while marking posts that need permission', () => {
    const list = read('src/skin/board/sungsan_news/list.skin.php');
    const css = read('src/scss/main.scss');

    assert.match(
      list,
      /\$sungsan_news_row = \$sungsan_news_rows\[\$i\];[\s\S]*?if \(sungsan_is_review_restricted\(\$sungsan_news_row\) && !\$sungsan_news_is_admin\) \{\s*continue;\s*\}/,
      'news list should only hide operator-review migrated posts',
    );
    assert.match(list, /\$sungsan_news_is_admin = !empty\(\$is_admin\);/);
    assert.match(list, /\$can_read_post = sungsan_can_read_news_post\(\$sungsan_news_row\);/);
    assert.match(
      list,
      /<a class="ss-post-row<\?php echo \$can_read_post \? '' : ' restricted'; \?>"/,
      'news list should visually distinguish posts that need permission',
    );
    assert.match(list, /<\?php if \(!\$can_read_post\) \{ \?><span class="ss-access-label">권한 확인 필요<\/span><\?php \} \?>/);
    assert.doesNotMatch(list, /if \(!sungsan_can_read_news_post\(\$list\[\$i\]\)\) \{\s*continue;\s*\}/);
    assert.match(css, /\.ss-post-row\.restricted\s*\{/);
    assert.match(css, /\.ss-access-label\s*\{/);
  });

  it('sends guest restricted-news row clicks to login with the post as return target', () => {
    const list = read('src/skin/board/sungsan_news/list.skin.php');

    assert.match(list, /global \$is_admin, \$is_member;/);
    assert.match(list, /\$sungsan_news_is_member = !empty\(\$is_member\);/);
    assert.match(list, /\$sungsan_news_post_raw_href = isset\(\$sungsan_news_row\['href'\]\) \? \$sungsan_news_row\['href'\] : '#';/);
    assert.match(list, /\$sungsan_news_post_href = \(!\$sungsan_news_is_member && !\$can_read_post\) \? sungsan_login_url\(\$sungsan_news_post_raw_href\) : \$sungsan_news_post_raw_href;/);
    assert.doesNotMatch(list, /\$sungsan_news_post_href = isset\(\$sungsan_news_row\['href'\]\) \? \$sungsan_news_row\['href'\] : '#';/);
  });

  it('escapes news visibility labels before rendering metadata', () => {
    const list = read('src/skin/board/sungsan_news/list.skin.php');
    const view = read('src/skin/board/sungsan_news/view.skin.php');

    assert.match(list, /<span><\?php echo get_text\(sungsan_get_visibility_label\(\$visibility\)\); \?><\/span>/);
    assert.match(view, /<span><\?php echo get_text\(sungsan_get_visibility_label\(\$visibility\)\); \?><\/span>/);
    assert.doesNotMatch(list, /<span><\?php echo sungsan_get_visibility_label\(\$visibility\); \?><\/span>/);
    assert.doesNotMatch(view, /<span><\?php echo sungsan_get_visibility_label\(\$visibility\); \?><\/span>/);
  });

  it('marks free board list posts as member-readable before visitors open them', () => {
    const list = read('src/skin/board/sungsan_free/list.skin.php');

    assert.match(list, /<span class="ss-access-label">회원 열람<\/span>/);
    assert.match(list, /get_text\(\$sungsan_free_post_writer\)[\s\S]*?<span class="ss-access-label">회원 열람<\/span>/);
  });

  it('keeps guest free-board rows title-only until login', () => {
    const list = read('src/skin/board/sungsan_free/list.skin.php');

    assert.match(
      list,
      /<div class="ss-meta">\s*<\?php if \(\$sungsan_free_is_member\) \{ \?>[\s\S]*?get_text\(\$sungsan_free_post_writer\)[\s\S]*?<time datetime="<\?php echo get_text\(\$sungsan_free_post_datetime\); \?>">[\s\S]*?number_format\(\$sungsan_free_post_hits\)[\s\S]*?<\?php \} else \{ \?>[\s\S]*?<span class="ss-access-label">회원 전용 글입니다\. 로그인하면 작성자와 날짜를 볼 수 있습니다\.<\/span>[\s\S]*?<\?php \} \?>\s*<\/div>/,
    );
    assert.match(list, /\$sungsan_free_is_member = !empty\(\$is_member\);/);
    assert.doesNotMatch(list, /<\?php if \(\$is_member\) \{ \?>/);
    assert.doesNotMatch(
      list,
      /<div class="ss-meta">\s*<span>\s*<\?php echo get_text\(\$sungsan_free_post_writer\); \?>\s*<\/span>/,
    );
  });

  it('sends guest free-board row clicks to login with the post as return target', () => {
    const list = read('src/skin/board/sungsan_free/list.skin.php');

    assert.match(list, /global \$is_member;/);
    assert.match(list, /\$sungsan_free_is_member = !empty\(\$is_member\);/);
    assert.match(list, /\$sungsan_post_href = \$sungsan_free_is_member \? \$sungsan_free_post_href : sungsan_login_url\(\$sungsan_free_post_href\);/);
    assert.match(list, /class="ss-post-row<\?php echo \$sungsan_free_is_member \? '' : ' restricted'; \?>"/);
    assert.match(list, /href="<\?php echo get_text\(\$sungsan_post_href\); \?>"/);
  });

  it('keeps free-board detail body and attachments behind member login guidance', () => {
    const view = read('src/skin/board/sungsan_free/view.skin.php');

    assert.match(view, /global \$is_member;/);
    assert.match(view, /\$sungsan_view_is_member = !empty\(\$is_member\);/);
    assert.match(view, /\$sungsan_free_request_uri = isset\(\$_SERVER\['REQUEST_URI'\]\) \? \$_SERVER\['REQUEST_URI'\] : '';/);
    assert.match(view, /\$sungsan_free_login_url = sungsan_login_url\(\$sungsan_free_request_uri\);/);
    assert.match(view, /<\?php if \(\$sungsan_view_is_member\) \{ \?>[\s\S]*?<div class="ss-content">[\s\S]*?get_view_thumbnail\(\$sungsan_view_content\)[\s\S]*?<\?php \} else \{ \?>[\s\S]*?<p class="ss-access-note">/);
    assert.match(view, /회원 전용 자유게시판 글입니다/);
    assert.match(view, /href="<\?php echo get_text\(\$sungsan_free_login_url\); \?>"/);
    assert.doesNotMatch(view, /urlencode\(\$_SERVER\['REQUEST_URI'\]\)/);
    assert.doesNotMatch(view, /<\?php if \(\$is_member\) \{ \?>/);
  });

  it('renders member comments on free-board detail through the Sungsan skin', () => {
    const commentFile = 'src/skin/board/sungsan_free/view_comment.skin.php';
    const view = read('src/skin/board/sungsan_free/view.skin.php');
    const css = read('src/scss/main.scss');

    assert.equal(existsSync(path.join(repoRoot, commentFile)), true, `${commentFile} should exist`);

    const comment = read(commentFile);

    assert.match(view, /if \(\$sungsan_view_is_member\) \{\s*include_once\(G5_BBS_PATH\.'\/view_comment\.php'\);\s*\}/);
    assert.match(comment, /<section id="bo_vc" class="ss-comment-section"[^>]*>/);
    assert.match(comment, /for \(\$i = 0; \$i < count\(\$sungsan_comment_rows\); \$i\+\+\)/);
    assert.match(comment, /\$sungsan_comment_content = isset\(\$sungsan_comment_row\['content'\]\) \? \$sungsan_comment_row\['content'\] : '';/);
    assert.match(comment, /echo \$sungsan_comment_content;/);
    assert.match(comment, /get_text\(\$sungsan_comment_author\)/);
    assert.match(comment, /\$sungsan_comment_reply_href = \$sungsan_comment_common_url\.'&c_id='\.\$sungsan_comment_id\.'&w=c#bo_vc_w';/);
    assert.match(comment, /str_replace\('&amp;', '&', \$sungsan_comment_row\['del_link'\]\)/);
    assert.doesNotMatch(comment, /\$comment_common_url\.'&amp;c_id='/);
    assert.doesNotMatch(comment, /count\(\$list\)/);
    assert.doesNotMatch(comment, /\$list\[\$i\]/);
    assert.match(comment, /<form name="fviewcomment" id="fviewcomment"/);
    assert.match(comment, /name="token" value=""/);
    assert.match(comment, /id="wr_content" name="wr_content"/);
    assert.match(comment, /<div id="edit_<\?php echo \$sungsan_comment_id; \?>" class="ss-comment-placeholder" hidden><\/div>/);
    assert.match(comment, /<div id="reply_<\?php echo \$sungsan_comment_id; \?>" class="ss-comment-placeholder" hidden><\/div>/);
    assert.doesNotMatch(comment, /<span id="(?:edit|reply)_<\?php echo \$sungsan_comment_id; \?>" class="ss-comment-placeholder"/);
    assert.match(comment, /set_comment_token\(f\)/);
    assert.match(comment, /function comment_box\(comment_id, work\)/);
    assert.match(css, /\.ss-comment-section\s*\{/);
    assert.match(css, /\.ss-comment-list\s*\{/);
    assert.match(css, /\.ss-comment-form\s*\{/);
    assert.match(css, /\.ss-comment\.depth-5\s*\{[\s\S]*?margin-left:\s*90px/);
    assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.ss-comment\.depth-5\s*\{[\s\S]*?margin-left:\s*36px/);
  });

  it('keeps free-board comments member-only without guest identity fields', () => {
    const view = read('src/skin/board/sungsan_free/view.skin.php');
    const comment = read('src/skin/board/sungsan_free/view_comment.skin.php');
    const scss = read('src/scss/main.scss');
    const css = read('src/theme/sungsan/css/sungsan.css');

    assert.match(view, /if \(\$sungsan_view_is_member\) \{\s*include_once\(G5_BBS_PATH\.'\/view_comment\.php'\);\s*\}/);
    assert.doesNotMatch(comment, /\$is_guest/);
    assert.doesNotMatch(comment, /name="wr_name"/);
    assert.doesNotMatch(comment, /name="wr_password"/);
    assert.doesNotMatch(comment, /\$captcha_html/);
    assert.doesNotMatch(comment, /chk_captcha_js/);
    assert.doesNotMatch(scss, /\.ss-comment-guest-fields/);
    assert.doesNotMatch(css, /\.ss-comment-guest-fields/);
  });

  it('normalizes free-board comment list and form identifiers before rendering', () => {
    const comment = read('src/skin/board/sungsan_free/view_comment.skin.php');

    assert.match(comment, /\$sungsan_comment_rows = \(isset\(\$list\) && is_array\(\$list\)\) \? \$list : array\(\);/);
    assert.match(comment, /\$sungsan_comment_count = count\(\$sungsan_comment_rows\);/);
    assert.match(comment, /\$sungsan_comment_board_id = isset\(\$bo_table\) \? \$bo_table : 'free';/);
    assert.match(comment, /\$sungsan_comment_wr_id = isset\(\$wr_id\) \? \(int\) \$wr_id : 0;/);
    assert.match(comment, /\$sungsan_comment_can_write = !empty\(\$is_comment_write\);/);
    assert.match(comment, /\$sungsan_comment_action_url = isset\(\$comment_action_url\) \? \$comment_action_url : '';/);
    assert.match(comment, /\$sungsan_comment_common_url = isset\(\$comment_common_url\) \? \$comment_common_url : '';/);
    assert.match(comment, /\$sungsan_comment_row = \$sungsan_comment_rows\[\$i\];/);
    assert.match(comment, /\$sungsan_comment_reply_href = \$sungsan_comment_common_url\.'&c_id='\.\$sungsan_comment_id\.'&w=c#bo_vc_w';/);
    assert.match(comment, /\$sungsan_comment_edit_href = \$sungsan_comment_common_url\.'&c_id='\.\$sungsan_comment_id\.'&w=cu#bo_vc_w';/);
    assert.match(comment, /<input type="hidden" name="bo_table" value="<\?php echo get_text\(\$sungsan_comment_board_id\); \?>">/);
    assert.match(comment, /<input type="hidden" name="wr_id" value="<\?php echo \(int\) \$sungsan_comment_wr_id; \?>">/);
    assert.match(comment, /<\?php if \(\$sungsan_comment_can_write\) \{ \?>/);
    assert.match(comment, /<form name="fviewcomment" id="fviewcomment" action="<\?php echo get_text\(\$sungsan_comment_action_url\); \?>"/);
    assert.doesNotMatch(comment, /\$sungsan_comment_count = count\(\$list\);/);
    assert.doesNotMatch(comment, /\$sungsan_comment_row = \$list\[\$i\];/);
    assert.doesNotMatch(comment, /get_text\(\$bo_table\)/);
    assert.doesNotMatch(comment, /get_text\(\$wr_id\)/);
    assert.doesNotMatch(comment, /<\?php if \(\$is_comment_write\) \{ \?>/);
    assert.doesNotMatch(comment, /get_text\(\$comment_action_url\)/);
    assert.doesNotMatch(comment, /\$comment_common_url\.'&c_id='/);
  });

  it('does not override hidden comment placeholders before reply or edit actions', () => {
    const css = read('src/scss/main.scss');

    assert.match(css, /\.ss-comment-placeholder:not\(\[hidden\]\)\s*\{/);
    assert.doesNotMatch(css, /\.ss-comment-placeholder\s*\{\s*display:\s*block;\s*\}/);
  });

  it('shows a visible label on the free-board comment content field', () => {
    const comment = read('src/skin/board/sungsan_free/view_comment.skin.php');
    const css = read('src/scss/main.scss');

    assert.match(comment, /<label class="ss-comment-content-label" for="wr_content">댓글 내용 <span class="ss-required">필수<\/span><\/label>/);
    assert.match(comment, /<textarea id="wr_content" name="wr_content" maxlength="10000" required class="required" aria-describedby="ss-comment-help/);
    assert.doesNotMatch(comment, /<label class="sound_only" for="wr_content">댓글 내용<\/label>/);
    assert.doesNotMatch(comment, /<textarea[^>]+placeholder="댓글 내용을 입력해 주세요."/);
    assert.match(css, /\.ss-comment-content-label\s*\{[\s\S]*?font-weight:\s*800;/);
  });

  it('connects free-board comment length guidance to the comment textarea', () => {
    const comment = read('src/skin/board/sungsan_free/view_comment.skin.php');

    assert.match(comment, /<p id="char_cnt" class="ss-form-help" aria-live="polite"><span id="char_count"><\/span>글자<\/p>/);
    assert.match(comment, /<textarea id="wr_content" name="wr_content" maxlength="10000" required class="required" aria-describedby="ss-comment-help<\?php if \(\$sungsan_comment_min \|\| \$sungsan_comment_max\) \{ \?> char_cnt<\?php \} \?>"/);
    assert.doesNotMatch(comment, /aria-describedby="ss-comment-help" <\?php if \(\$sungsan_comment_min \|\| \$sungsan_comment_max\) \{ \?>onkeyup=/);
  });

  it('renders free-board comment dates as semantic time elements', () => {
    const comment = read('src/skin/board/sungsan_free/view_comment.skin.php');

    assert.match(comment, /\$sungsan_comment_datetime = isset\(\$sungsan_comment_row\['datetime'\]\) \? \$sungsan_comment_row\['datetime'\] : '';/);
    assert.match(comment, /<time datetime="<\?php echo get_text\(\$sungsan_comment_datetime\); \?>"><\?php echo get_text\(\$sungsan_comment_datetime\); \?><\/time>/);
    assert.doesNotMatch(comment, /<time><\?php echo get_text\(\$sungsan_comment_datetime\); \?><\/time>/);
  });

  it('blocks direct free-board attachment downloads for guests', () => {
    const file = 'src/skin/board/sungsan_free/download.head.skin.php';

    assert.ok(existsSync(path.join(repoRoot, file)), 'free board should provide a direct download guard');

    const source = read(file);

    assert.match(source, /global \$is_member;/);
    assert.match(source, /\$sungsan_free_download_is_member = !empty\(\$is_member\);/);
    assert.match(source, /if \(!\$sungsan_free_download_is_member\) \{/);
    assert.match(source, /\$sungsan_free_download_return_url = get_pretty_url\(\$bo_table, \$wr_id\);/);
    assert.match(source, /\$sungsan_free_download_login_url = sungsan_login_url\(\$sungsan_free_download_return_url\);/);
    assert.doesNotMatch(source, /G5_BBS_URL\.'\/login\.php\?wr_id='/);
    assert.doesNotMatch(source, /\$qstr\.'&url='/);
    assert.match(source, /회원 전용 자유게시판 첨부 파일입니다/);
    assert.match(source, /alert\(\$message, \$sungsan_free_download_login_url\);/);
    assert.doesNotMatch(source, /if \(!\$is_member\) \{/);
  });

  it('blocks executable or browser-active board upload extensions before storage', () => {
    const extend = read('src/extend/sungsan.php');

    assert.match(extend, /function sungsan_reject_blocked_uploads/);
    for (const extension of ['php', 'php7', 'php8', 'html', 'js', 'svg']) {
      assert.match(extend, new RegExp(`'${extension}'`));
    }
    for (const extension of ['htaccess', 'htpasswd', 'user.ini']) {
      assert.match(extend, new RegExp(`'${extension}'`));
    }
    assert.match(extend, /\$filename_parts = explode\('\.', strtolower\(\$filename\)\);/);
    assert.match(extend, /array_shift\(\$filename_parts\);/);
    assert.match(extend, /foreach \(\$filename_parts as \$extension\)/);
    assert.doesNotMatch(extend, /pathinfo\(\$filename,\s*PATHINFO_EXTENSION\)/);

    for (const file of [
      'src/skin/board/sungsan_news/write_update.head.skin.php',
      'src/skin/board/sungsan_free/write_update.head.skin.php',
    ]) {
      const source = read(file);
      assert.match(source, /sungsan_reject_blocked_uploads\(\$_FILES\)/);
      assert.match(source, /alert\(/);
    }
  });

  it('enforces board attachment allowed extensions before storage', () => {
    const extend = read('src/extend/sungsan.php');

    assert.match(
      extend,
      /\$sungsan_board_allowed_upload_extensions = array\('jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm', 'pdf', 'hwp', 'hwpx', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'\);/,
    );
    assert.match(extend, /function sungsan_get_upload_filename_extension\(\$filename\)/);
    assert.match(extend, /function sungsan_is_allowed_upload_filename\(\$filename, \$allowed_extensions\)/);
    assert.match(extend, /end\(\$filename_parts\)/);
    assert.match(extend, /in_array\(\$extension, \$allowed_extensions, true\)/);
    assert.match(extend, /global \$sungsan_board_allowed_upload_extensions;/);
    assert.match(extend, /!\s*sungsan_is_allowed_upload_filename\(\$filename, \$sungsan_board_allowed_upload_extensions\)/);
    assert.match(extend, /허용된 형식의 첨부 파일만 업로드할 수 있습니다\./);
  });

  it('blocks executable form mail attachments before the core send handler stores them', () => {
    const extend = read('src/extend/sungsan.php');
    const coreSend = read(gnuboardFormmailSendFixture);

    assert.match(extend, /function sungsan_reject_blocked_formmail_uploads\(\$files\)/);
    assert.match(extend, /foreach \(array\('file1', 'file2'\) as \$field\)/);
    assert.match(extend, /sungsan_is_blocked_upload_filename\(\$filename\)/);
    assert.match(extend, /SUNGSAN_FORMMAIL_UPLOAD_LIMIT_BYTES/);
    assert.match(extend, /\$files\[\$field\]\['size'\]/);
    assert.match(extend, /\$size > SUNGSAN_FORMMAIL_UPLOAD_LIMIT_BYTES/);
    assert.match(extend, /alert_close\(/);
    assert.match(extend, /basename\(\$_SERVER\['SCRIPT_NAME'\]\) === 'formmail_send\.php'/);
    assert.match(extend, /sungsan_reject_blocked_formmail_uploads\(\$_FILES\)/);
    assert.doesNotMatch(coreSend, /sungsan_reject_blocked_formmail_uploads/);
  });

  it('enforces form mail attachment allowed extensions before the core send handler', () => {
    const extend = read('src/extend/sungsan.php');
    const coreSend = read(gnuboardFormmailSendFixture);

    assert.match(
      extend,
      /\$sungsan_formmail_allowed_upload_extensions = array\('jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'hwp', 'hwpx', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'\);/,
    );
    assert.match(extend, /global \$sungsan_formmail_allowed_upload_extensions;/);
    assert.match(extend, /!\s*sungsan_is_allowed_upload_filename\(\$filename, \$sungsan_formmail_allowed_upload_extensions\)/);
    assert.match(extend, /사진과 문서 파일만 메일에 첨부할 수 있습니다\./);
    assert.doesNotMatch(coreSend, /sungsan_is_allowed_upload_filename/);
  });

  it('normalizes form mail attachment count before the core send loop', () => {
    const extend = read('src/extend/sungsan.php');
    const coreSend = read(gnuboardFormmailSendFixture);

    assert.match(extend, /function sungsan_normalize_formmail_attach_count\(\)/);
    assert.match(extend, /global \$attach;/);
    assert.match(extend, /\$attach = isset\(\$attach\) \? max\(0, min\(2, \(int\) \$attach\)\) : 0;/);
    assert.match(
      extend,
      /sungsan_normalize_formmail_attach_count\(\);\s*\n\s*sungsan_reject_blocked_formmail_uploads\(\$_FILES\);/,
    );
    assert.match(coreSend, /for \(\$i=1; \$i<=\$attach; \$i\+\+\)/);
    assert.doesNotMatch(coreSend, /sungsan_normalize_formmail_attach_count/);
  });

  it('normalizes form mail type before the core send handler chooses html mode', () => {
    const extend = read('src/extend/sungsan.php');
    const skin = read('src/skin/member/sungsan/formmail.skin.php');
    const coreSend = read(gnuboardFormmailSendFixture);

    for (const value of ['0', '1', '2']) {
      assert.match(skin, new RegExp(`name="type" value="${value}"`), `form mail skin should only offer type ${value}`);
    }
    assert.match(extend, /function sungsan_normalize_formmail_type\(\)/);
    assert.match(extend, /global \$type;/);
    assert.match(extend, /\$type = isset\(\$type\) \? \(int\) \$type : 0;/);
    assert.match(extend, /if \(!in_array\(\$type, array\(0, 1, 2\), true\)\) \{/);
    assert.match(extend, /\$type = 0;/);
    assert.match(
      extend,
      /sungsan_validate_formmail_required_fields\(\);\s*\n\s*sungsan_normalize_formmail_type\(\);\s*\n\s*sungsan_normalize_formmail_attach_count\(\);/,
    );
    assert.match(coreSend, /if \(\$type == 2\) \{/);
    assert.doesNotMatch(coreSend, /sungsan_normalize_formmail_type/);
  });

  it('validates required form mail message fields before the core send handler', () => {
    const extend = read('src/extend/sungsan.php');
    const coreSend = read(gnuboardFormmailSendFixture);

    assert.match(extend, /function sungsan_validate_formmail_required_fields\(\)/);
    assert.match(extend, /global \$subject, \$content;/);
    assert.match(extend, /\$formmail_subject = isset\(\$subject\) \? trim\(\(string\) \$subject\) : '';/);
    assert.match(extend, /\$formmail_content = isset\(\$content\) \? trim\(\(string\) \$content\) : '';/);
    assert.match(extend, /if \(\$formmail_subject === '' \|\| \$formmail_content === ''\) \{/);
    assert.match(extend, /alert_close\('메일 제목과 내용을 입력해 주세요\.'\);/);
    assert.match(
      extend,
      /sungsan_validate_formmail_required_fields\(\);\s*\n\s*sungsan_normalize_formmail_type\(\);\s*\n\s*sungsan_normalize_formmail_attach_count\(\);/,
    );
    assert.doesNotMatch(coreSend, /sungsan_validate_formmail_required_fields/);
  });

  it('validates guest form mail sender identity before the core send handler', () => {
    const extend = read('src/extend/sungsan.php');
    const coreSend = read(gnuboardFormmailSendFixture);

    assert.match(extend, /global \$is_member, \$fnick, \$fmail;/);
    assert.match(extend, /if \(!\$is_member\) \{/);
    assert.match(extend, /\$formmail_sender_name = isset\(\$fnick\) \? trim\(strip_tags\(\(string\) \$fnick\)\) : '';/);
    assert.match(extend, /\$formmail_sender_email = isset\(\$fmail\) \? get_email_address\(trim\(\(string\) \$fmail\)\) : '';/);
    assert.match(extend, /if \(\$formmail_sender_name === '' \|\| \$formmail_sender_email === ''\) \{/);
    assert.match(extend, /alert_close\('보내는 분 이름과 이메일을 입력해 주세요\.'\);/);
    assert.match(
      extend,
      /sungsan_validate_formmail_required_fields\(\);\s*\n\s*sungsan_normalize_formmail_type\(\);\s*\n\s*sungsan_normalize_formmail_attach_count\(\);/,
    );
    assert.doesNotMatch(coreSend, /sungsan_validate_formmail_required_fields/);
  });

  it('connects board write required and attachment guidance to form controls', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /<p id="ss-write-required-help" class="ss-form-help ss-form-summary">/, `${file} should expose a required-field summary`);
      assert.match(source, /id="wr_subject"[\s\S]*?aria-describedby="ss-write-required-help"/, `${file} should connect subject help`);
      assert.match(source, /id="wr_content"[\s\S]*?aria-describedby="ss-write-required-help/, `${file} should connect content help`);
      assert.match(source, /\$sungsan_option_hidden = isset\(\$option_hidden\) \? \$option_hidden : '';/, `${file} should normalize option hidden fields before rendering`);
      assert.match(source, /<\?php echo \$sungsan_option_hidden; \?>/, `${file} should render normalized option hidden fields`);
      assert.doesNotMatch(source, /<\?php if \(isset\(\$option_hidden\)\) \{ echo \$option_hidden; \} \?>/, `${file} should not render raw option_hidden inline`);
      assert.match(source, /\$sungsan_upload_limit_mb = isset\(\$board\['bo_upload_size'\]\) \? max\(1, \(int\) ceil\(\(int\) \$board\['bo_upload_size'\] \/ 1048576\)\) : 10;/, `${file} should calculate the upload size limit from board settings`);
      assert.match(source, /\$sungsan_write_uses_files = isset\(\$is_file\) \? \(bool\) \$is_file : false;/, `${file} should normalize the attachment flag before rendering`);
      assert.match(source, /\$sungsan_write_file_count = isset\(\$file_count\) \? max\(0, \(int\) \$file_count\) : 0;/, `${file} should normalize the attachment count before rendering`);
      assert.match(source, /<\?php if \(\$sungsan_write_uses_files\) \{ \?>/, `${file} should group attachment guidance before file fields`);
      assert.match(source, /for \(\$i = 0; \$i < \$sungsan_write_file_count; \$i\+\+\)/, `${file} should render the normalized file count`);
      assert.doesNotMatch(source, /<\?php if \(\$is_file\) \{ \?>/, `${file} should not render from raw is_file`);
      assert.doesNotMatch(source, /for \(\$i = 0; \$i < \$file_count; \$i\+\+\)/, `${file} should not loop over raw file_count`);
      assert.match(source, /<p id="ss-attachment-help" class="ss-form-help ss-attachment-help">/, `${file} should expose attachment guidance once`);
      assert.match(source, /파일 한 개당 <\?php echo number_format\(\(int\) \$sungsan_upload_limit_mb\); \?>MB 이하/, `${file} should show the per-file upload size limit`);
      assert.match(source, /id="bf_file_<\?php echo \$i \+ 1; \?>"[\s\S]*?aria-describedby="ss-attachment-help(?: ss-free-privacy-help)?"/, `${file} should connect attachment help`);
    }

    const news = read('src/skin/board/sungsan_news/write.skin.php');
    assert.match(news, /id="ca_name"[\s\S]*?aria-describedby="ss-write-required-help"/, 'news write should connect category help');
  });

  it('keeps board write submissions on the GnuBoard validation path', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /<form name="fwrite" id="fwrite"[\s\S]*?onsubmit="return fwrite_submit\(this\);"/, `${file} should call fwrite_submit on submit`);
      assert.match(source, /<button type="submit" id="btn_submit" accesskey="s" class="ss-button">/, `${file} should expose the submit button expected by fwrite_submit`);
      assert.match(source, /function fwrite_submit\(f\)/, `${file} should define the board write submit guard`);
      assert.match(source, /\$sungsan_editor_js = isset\(\$editor_js\) \? \$editor_js : '';/, `${file} should normalize editor synchronization before rendering`);
      assert.match(source, /<\?php echo \$sungsan_editor_js; \?>/, `${file} should run editor synchronization before filtering`);
      assert.match(source, /g5_bbs_url \+ '\/ajax\.filter\.php'/, `${file} should check the GnuBoard word filter before submit`);
      assert.match(source, /subject: f\.wr_subject\.value/, `${file} should filter the submitted title`);
      assert.match(source, /content: f\.wr_content\.value/, `${file} should filter the submitted content`);
      assert.match(source, /\$sungsan_captcha_js = isset\(\$captcha_js\) \? \$captcha_js : '';/, `${file} should normalize captcha JS before rendering`);
      assert.match(source, /<\?php echo \$sungsan_captcha_js; \?>/, `${file} should run GnuBoard captcha validation when enabled`);
      assert.match(source, /\$sungsan_uses_captcha = !empty\(\$is_use_captcha\);/, `${file} should normalize captcha usage before rendering`);
      assert.match(source, /\$sungsan_captcha_html = isset\(\$captcha_html\) \? \$captcha_html : '';/, `${file} should normalize captcha HTML before rendering`);
      assert.match(source, /<\?php if \(\$sungsan_uses_captcha && \$sungsan_captcha_html !== ''\) \{ \?>/, `${file} should render captcha from normalized state`);
      assert.match(source, /<\?php echo \$sungsan_captcha_html; \?>/, `${file} should render normalized captcha HTML`);
      assert.doesNotMatch(source, /<\?php echo \$editor_js; \?>/, `${file} should not render raw editor_js`);
      assert.doesNotMatch(source, /<\?php echo \$captcha_js; \?>/, `${file} should not render raw captcha_js`);
      assert.doesNotMatch(source, /<\?php if \(!empty\(\$is_use_captcha\) && isset\(\$captcha_html\)\) \{ \?>/, `${file} should not render raw captcha state inline`);
      assert.match(source, /document\.getElementById\('btn_submit'\)\.disabled = true;/, `${file} should prevent duplicate submits`);
    }
  });

  it('keeps board write character limits visible and validated before submit', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /\$sungsan_write_min = isset\(\$write_min\) \? \(int\) \$write_min : 0;/, `${file} should normalize the board minimum length`);
      assert.match(source, /\$sungsan_write_max = isset\(\$write_max\) \? \(int\) \$write_max : 0;/, `${file} should normalize the board maximum length`);
      assert.match(source, /var char_min = parseInt\(<\?php echo \$sungsan_write_min; \?>, 10\);/, `${file} should expose the minimum length to GnuBoard's byte checker`);
      assert.match(source, /var char_max = parseInt\(<\?php echo \$sungsan_write_max; \?>, 10\);/, `${file} should expose the maximum length to GnuBoard's byte checker`);
      assert.match(source, /<p id="char_cnt" class="ss-form-help" aria-live="polite"><span id="char_count"><\/span>글자<\/p>/, `${file} should show a live character counter when limits are active`);
      assert.match(source, /<textarea id="wr_content" name="wr_content" required aria-describedby="ss-write-required-help<\?php if \(\$sungsan_write_min \|\| \$sungsan_write_max\) \{ \?> char_cnt<\?php \} \?>"/, `${file} should connect the counter to the content textarea`);
      assert.match(source, /onkeyup="check_byte\('wr_content', 'char_count'\);"/, `${file} should update the counter while typing`);
      assert.match(source, /if \(document\.getElementById\('char_count'\)\) \{[\s\S]*?parseInt\(check_byte\('wr_content', 'char_count'\), 10\)/, `${file} should check content length before submit`);
    }
  });

  it('connects free-board attachment inputs to privacy guidance', () => {
    const source = read('src/skin/board/sungsan_free/write.skin.php');

    assert.match(source, /<p id="ss-free-privacy-help" class="ss-form-help">/);
    assert.match(source, /개인정보/);
    assert.match(source, /<input type="file" name="bf_file\[\]" id="bf_file_<\?php echo \$i \+ 1; \?>" accept="<\?php echo get_text\(\$sungsan_attachment_accept\); \?>" aria-describedby="ss-attachment-help ss-free-privacy-help">/);
    assert.doesNotMatch(source, /<input type="file" name="bf_file\[\]" id="bf_file_<\?php echo \$i \+ 1; \?>" accept="<\?php echo get_text\(\$sungsan_attachment_accept\); \?>" aria-describedby="ss-attachment-help">/);
  });

  it('limits board attachment file pickers to common image, video, and document extensions', () => {
    const expectedExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'mp4',
      'mov',
      'webm',
      'pdf',
      'hwp',
      'hwpx',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'txt',
    ];

    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(
        source,
        /\$sungsan_attachment_accept = '\.jpg,\.jpeg,\.png,\.gif,\.webp,\.mp4,\.mov,\.webm,\.pdf,\.hwp,\.hwpx,\.doc,\.docx,\.xls,\.xlsx,\.ppt,\.pptx,\.txt';/,
        `${file} should define a shared image/video/document picker filter`,
      );
      assert.match(source, /사진·영상과 문서 파일/, `${file} should explain video attachments in plain text`);
      assert.doesNotMatch(source, /사진과 문서 파일/, `${file} should not describe uploads as image-only media`);
      assert.match(
        source,
        /<input type="file" name="bf_file\[\]" id="bf_file_<\?php echo \$i \+ 1; \?>" accept="<\?php echo get_text\(\$sungsan_attachment_accept\); \?>" aria-describedby="ss-attachment-help(?: ss-free-privacy-help)?">/,
        `${file} should apply the picker filter to each attachment input`,
      );

      const acceptLine = source.match(/\$sungsan_attachment_accept = '([^']+)';/);
      assert.ok(acceptLine, `${file} should expose an attachment accept list`);
      for (const extension of expectedExtensions) {
        assert.match(acceptLine[1], new RegExp(`\\.${extension}(?:,|$)`), `${file} should allow ${extension} in the picker`);
      }
      for (const blocked of ['php', 'html', 'js', 'svg', 'htaccess', 'user.ini']) {
        assert.doesNotMatch(acceptLine[1], new RegExp(`\\.${blocked}(?:,|$)`), `${file} should not suggest ${blocked} uploads`);
      }
    }
  });

  it('styles board write summaries as scannable guidance blocks', () => {
    const css = read('src/scss/main.scss');

    assert.match(css, /\.ss-form-summary,\s*\n\.ss-attachment-help/);
    assert.match(css, /border-left:\s*4px solid var\(--ss-color-primary\)/);
    assert.match(css, /background:\s*var\(--ss-color-primary-soft\)/);
    assert.match(css, /\.ss-existing-file\s*\{/);
    assert.match(css, /\.ss-existing-file\s+\.ss-checkline\s*\{/);
  });

  it('shows blocked upload extension guidance on board write forms', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /PHP, HTML, JS, SVG/, `${file} should name blocked active file types`);
      assert.match(source, /\.htaccess/, `${file} should name server config files as blocked`);
      assert.match(source, /\.user\.ini/, `${file} should name PHP per-directory config files as blocked`);
      assert.match(source, /shell\.php7/, `${file} should name numeric PHP upload examples`);
      assert.match(source, /shell\.php8/, `${file} should name numeric PHP upload examples`);
      assert.match(source, /shell\.php\.jpg/, `${file} should explain multi-extension active files are blocked`);
      assert.match(source, /업로드할 수 없습니다/, `${file} should explain blocked files cannot be uploaded`);
      assert.doesNotMatch(source, /실행 파일은 업로드하지 않습니다\./, `${file} should avoid vague upload guidance`);
    }
  });
});
