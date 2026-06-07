import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

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

    for (const variable of ['edit_url', 'my_posts_url', 'logout_url']) {
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
      /<p class="ss-action-help">비밀번호 변경은 본인 확인 후 내 정보 수정 화면에서 함께 할 수 있습니다\.<\/p>/,
    );
    assert.match(css, /\.ss-member-actions\s*\{[\s\S]*?display:\s*grid/);
    assert.match(css, /\.ss-member-action-buttons\s*\{[\s\S]*?display:\s*flex/);
    assert.match(css, /\.ss-action-help\s*\{/);
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

  it('keeps footer notices reachable from shared navigation', () => {
    const source = read('src/theme/sungsan/tail.php');

    assert.match(source, /<footer class="ss-site-footer">/);
    assert.match(source, /href="#email-collection-refusal"/);
    assert.match(source, /id="email-collection-refusal"/);
    assert.match(source, /이메일 주소 무단수집을 거부합니다/);
    assert.match(source, /href="<\?php echo G5_BBS_URL; \?>\/qalist\.php"/);
    assert.match(source, />관리 문의<\/a>/);
  });

  it('shows a visible label for the compact header search', () => {
    const head = read('src/theme/sungsan/head.php');
    const css = read('src/scss/main.scss');

    assert.match(head, /<form class="ss-search-form" method="get" action="<\?php echo G5_BBS_URL; \?>\/board\.php">/);
    assert.match(head, /<input type="hidden" name="bo_table" value="news">/);
    assert.doesNotMatch(head, /\/search\.php/);
    assert.match(head, /<label class="ss-search-label" for="ss_stx">소식 검색<\/label>/);
    assert.doesNotMatch(head, /<label class="sound_only" for="ss_stx">/);
    assert.match(head, /<div class="ss-search-row">[\s\S]*?<input id="ss_stx" name="stx" type="search"/);
    assert.match(css, /\.ss-search-label\s*\{/);
    assert.match(css, /\.ss-search-form\s*\{[\s\S]*?display:\s*grid/);
    assert.match(css, /\.ss-search-form\s+\.ss-search-row\s*\{/);
  });

  it('shows a member account icon for the logged-in mypage entry', () => {
    const head = read('src/theme/sungsan/head.php');
    const css = read('src/scss/main.scss');

    assert.match(
      head,
      /<a class="ss-account-link ss-account-link-member" href="<\?php echo G5_URL; \?>\/sungsan\/mypage\.php"<\?php echo \$ss_is_mypage \? ' aria-current="page"' : ''; \?>>/,
    );
    assert.match(head, /<span class="ss-account-icon" aria-hidden="true"><\/span>\s*<span class="ss-account-text">마이페이지<\/span>/);
    assert.match(css, /\.ss-account-icon\s*\{[\s\S]*?width:\s*24px;[\s\S]*?height:\s*24px;[\s\S]*?border-radius:\s*50%;/);
    assert.match(css, /\.ss-account-icon::before\s*\{[\s\S]*?border-radius:\s*50%;/);
    assert.match(css, /\.ss-account-icon::after\s*\{[\s\S]*?border-radius:\s*999px 999px 0 0;/);
  });

  it('returns guests to the current page after header login', () => {
    const head = read('src/theme/sungsan/head.php');

    assert.match(head, /\$ss_login_url = G5_BBS_URL\.'\/login\.php\?url='\.urlencode\(\$_SERVER\['REQUEST_URI'\]\);/);
    assert.match(head, /<a class="ss-account-link" href="<\?php echo get_text\(\$ss_login_url\); \?>">로그인<\/a>/);
    assert.doesNotMatch(head, /href="<\?php echo G5_BBS_URL; \?>\/login\.php">로그인<\/a>/);
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

    assert.match(source, /get_text\(\$mb\['mb_name'\]\)/);
    assert.match(source, /get_text\(\$mb\['mb_id'\]\)/);
    assert.match(source, /get_text\(\$mb\['mb_email'\]\)/);
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

    assert.match(source, /name="cert_type" value="<\?php echo get_text\(\$member\['mb_certify'\]\); \?>"/);
    assert.match(source, /name="mb_sex" value="<\?php echo get_text\(\$member\['mb_sex'\]\); \?>"/);
    assert.match(source, /<div class="ss-register-compat-fields" hidden>/);
    assert.match(source, /\$sungsan_member_value = function \(\$field, \$default = ''\) use \(\$member\)/);
    assert.match(source, /isset\(\$member\[\$field\]\) \? \$member\[\$field\] : \$default/);
    assert.match(source, /\$sungsan_member_zip = \$sungsan_member_value\('mb_zip1'\)\.\$sungsan_member_value\('mb_zip2'\);/);
    assert.match(source, /name="mb_id" value="<\?php echo get_text\(\$member\['mb_id'\]\); \?>"/);
    assert.match(source, /name="old_email" value="<\?php echo get_text\(\$member\['mb_email'\]\); \?>"/);
    assert.match(source, /name="mb_email" value="<\?php echo isset\(\$member\['mb_email'\]\) \? get_text\(\$member\['mb_email'\]\) : ''; \?>"/);
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
        new RegExp(`name="${field}_default" value="<\\?php echo get_text\\(\\$member\\['${field}'\\]\\); \\?>"`),
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
        new RegExp(`get_text\\(\\$member\\['${field}'\\]\\)`),
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

  it('escapes public member profile fields before rendering the profile popup', () => {
    const source = read('src/skin/member/sungsan/profile.skin.php');

    assert.match(source, /get_text\(\$mb_nick\)/);
    assert.match(source, /get_text\(\$mb_homepage\)/);
    assert.match(source, /get_text\(set_http\(\$mb_homepage\)\)/);
    assert.match(source, /get_text\(\$mb_profile\)/);
    assert.match(source, /\(int\)\s*\$mb\['mb_level'\]/);
    assert.match(source, /\(int\)\s*\$mb\['mb_point'\]/);
    assert.doesNotMatch(source, /echo \$mb_nick/);
    assert.doesNotMatch(source, /echo \$mb_homepage/);
    assert.doesNotMatch(source, /echo \$mb_profile/);
    assert.doesNotMatch(source, /echo \$mb\['mb_level'\]/);
  });

  it('escapes form mail recipient details before rendering the popup', () => {
    const source = read('src/skin/member/sungsan/formmail.skin.php');

    assert.match(source, /id="win_title"><\?php echo get_text\(\$name\); \?>/);
    assert.match(source, /name="to" value="<\?php echo get_text\(\$email\); \?>"/);
    assert.match(source, /name="fmail" value="<\?php echo get_text\(\$member\['mb_email'\]\); \?>"/);
    assert.doesNotMatch(source, /echo\s+\$name(?:\s|\?>)/);
    assert.doesNotMatch(source, /echo\s+\$email(?:\s|\?>)/);
    assert.doesNotMatch(source, /echo\s+\$member\['mb_email'\]/);
    assert.doesNotMatch(source, /\sstyle=/);
  });

  it('escapes member confirmation form values before rendering the password confirmation screen', () => {
    const source = read('src/skin/member/sungsan/member_confirm.skin.php');

    assert.match(source, /<h1><\?php echo get_text\(\$g5\['title'\]\); \?><\/h1>/);
    assert.match(source, /action="<\?php echo get_text\(\$url\); \?>"/);
    assert.match(source, /name="mb_id" value="<\?php echo get_text\(\$member\['mb_id'\]\); \?>"/);
    assert.match(source, /id="mb_confirm_id"><\?php echo get_text\(\$member\['mb_id'\]\); \?><\/span>/);
    assert.doesNotMatch(source, /echo\s+\$g5\['title'\]/);
    assert.doesNotMatch(source, /echo\s+\$url(?:\s|\?>)/);
    assert.doesNotMatch(source, /echo\s+\$member\['mb_id'\]/);
  });

  it('escapes certification refresh hidden member values before rendering the form', () => {
    const source = read('src/skin/member/sungsan/member_cert_refresh.skin.php');

    assert.match(source, /action="<\?php echo get_text\(\$action_url\); \?>"/);
    assert.match(source, /name="w" value="<\?php echo get_text\(\$w\); \?>"/);
    assert.match(source, /name="url" value="<\?php echo get_text\(\$urlencode\); \?>"/);

    for (const field of ['mb_certify', 'mb_id', 'mb_hp', 'mb_name']) {
      assert.match(
        source,
        new RegExp(`name="${field === 'mb_certify' ? 'cert_type' : field}" value="<\\?php echo get_text\\(\\$member\\['${field}'\\]\\); \\?>"`),
        `certification refresh should escape ${field}`,
      );
      assert.doesNotMatch(
        source,
        new RegExp(`name="${field === 'mb_certify' ? 'cert_type' : field}" value="<\\?php echo \\$member\\['${field}'\\]`),
        `certification refresh should not echo raw ${field}`,
      );
    }

    assert.doesNotMatch(source, /action="<\?php echo \$action_url/);
    assert.doesNotMatch(source, /name="w" value="<\?php echo \$w/);
    assert.doesNotMatch(source, /name="url" value="<\?php echo \$urlencode/);
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
          /action="<\?php echo get_text\(\$action\); \?>"/,
        ],
        forbidden: [/<h1><\?php echo \$g5\['title'\]/, /action="<\?php echo \$action/],
      },
      {
        file: 'src/skin/member/sungsan/memo_form.skin.php',
        expected: [
          /action="<\?php echo get_text\(\$memo_action_url\); \?>"/,
          /name="me_recv_mb_id" value="<\?php echo get_text\(\$me_recv_mb_id\); \?>"/,
          /<textarea name="me_memo" id="me_memo" required class="required"><\?php echo get_text\(\$content\); \?><\/textarea>/,
        ],
        forbidden: [
          /action="<\?php echo \$memo_action_url/,
          /name="me_recv_mb_id" value="<\?php echo \$me_recv_mb_id/,
          /<textarea name="me_memo" id="me_memo" required class="required"><\?php echo \$content/,
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
          /name="bo_table" value="<\?php echo get_text\(\$bo_table\); \?>"/,
          /name="wr_id" value="<\?php echo get_text\(\$wr_id\); \?>"/,
        ],
        forbidden: [/name="bo_table" value="<\?php echo \$bo_table/, /name="wr_id" value="<\?php echo \$wr_id/],
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

  it('escapes member popup list and detail values before rendering community utilities', () => {
    const cases = [
      {
        file: 'src/skin/member/sungsan/memo.skin.php',
        expected: [
          /<\?php echo get_text\(\$g5\['title'\]\); \?>/,
          /<\?php echo get_text\(\$kind_title\); \?>/,
          /<\?php echo number_format\(\(int\) \$total_count\); \?>/,
          /get_text\(strip_tags\(\$list\[\$i\]\['name'\]\)\)/,
          /get_text\(\$list\[\$i\]\['send_datetime'\]\)/,
          /href="<\?php echo get_text\(\$list\[\$i\]\['view_href'\]\); \?>"/,
          /<\?php echo get_text\(\$memo_preview\); \?>/,
          /href="<\?php echo get_text\(\$list\[\$i\]\['del_href'\]\); \?>"/,
          /number_format\(\(int\) \$config\['cf_memo_del'\]\)/,
        ],
        forbidden: [
          /echo \$g5\['title'\]/,
          /echo \$kind_title/,
          /echo \$total_count/,
          /echo \$list\[\$i\]\['name'\]/,
          /echo \$list\[\$i\]\['send_datetime'\]/,
          /href="<\?php echo \$list\[\$i\]\['view_href'\]/,
          /echo \$memo_preview/,
          /href="<\?php echo \$list\[\$i\]\['del_href'\]/,
          /echo \$config\['cf_memo_del'\]/,
        ],
      },
      {
        file: 'src/skin/member/sungsan/memo_view.skin.php',
        expected: [
          /<h1 id="win_title"><\?php echo get_text\(\$g5\['title'\]\); \?><\/h1>/,
          /<\?php echo get_text\(\$kind_date\); \?>/,
          /<\?php echo get_text\(\$memo\['me_send_datetime'\]\); \?>/,
          /href="<\?php echo get_text\(\$list_link\); \?>"/,
          /href="<\?php echo get_text\(\$del_link\); \?>"/,
          /href="<\?php echo get_text\(\$prev_link\); \?>"/,
          /href="<\?php echo get_text\(\$next_link\); \?>"/,
          /me_recv_mb_id=<\?php echo get_text\(\$mb\['mb_id'\]\); \?>&amp;me_id=<\?php echo \(int\) \$memo\['me_id'\]; \?>/,
          /\$nick = get_sideview\(get_text\(\$mb\['mb_id'\]\), get_text\(\$mb\['mb_nick'\]\), get_text\(\$mb\['mb_email'\]\), get_text\(\$mb\['mb_homepage'\]\)\);/,
        ],
        forbidden: [
          /echo \$g5\['title'\]/,
          /echo \$kind_date/,
          /echo \$memo\['me_send_datetime'\]/,
          /href="<\?php echo \$list_link/,
          /href="<\?php echo \$del_link/,
          /href="<\?php echo \$prev_link/,
          /href="<\?php echo \$next_link/,
          /me_recv_mb_id=<\?php echo \$mb\['mb_id'\]/,
          /get_sideview\(\$mb\['mb_id'\], \$mb\['mb_nick'\], \$mb\['mb_email'\], \$mb\['mb_homepage'\]\)/,
        ],
      },
      {
        file: 'src/skin/member/sungsan/point.skin.php',
        expected: [
          /<h1 id="win_title"><\?php echo get_text\(\$g5\['title'\]\); \?><\/h1>/,
          /<\?php echo get_text\(\$po_content\); \?>/,
          /<\?php echo get_text\(\$row\['po_datetime'\]\); \?>/,
          /<\?php echo get_text\(substr\(str_replace\('-', '', \$row\['po_expire_date'\]\), 2\)\); \?>/,
          /: get_text\(\$row\['po_expire_date'\]\); \?>/,
        ],
        forbidden: [
          /echo \$g5\['title'\]/,
          /echo \$po_content/,
          /echo \$row\['po_datetime'\]/,
          /echo substr\(str_replace\('-', '', \$row\['po_expire_date'\]\), 2\)/,
          /: \$row\['po_expire_date'\]/,
        ],
      },
      {
        file: 'src/skin/member/sungsan/scrap.skin.php',
        expected: [
          /<h1 id="win_title"><\?php echo get_text\(\$g5\['title'\]\); \?><\/h1>/,
          /href="<\?php echo get_text\(\$list\[\$i\]\['opener_href_wr_id'\]\); \?>"/,
          /class="scrap_tit" target="_blank" rel="noopener noreferrer"/,
          /onclick="opener\.document\.location\.href=this\.href; return false;"/,
          /<\?php echo get_text\(\$list\[\$i\]\['subject'\]\); \?>/,
          /href="<\?php echo get_text\(\$list\[\$i\]\['opener_href'\]\); \?>"/,
          /class="scrap_cate" target="_blank" rel="noopener noreferrer"/,
          /<\?php echo get_text\(\$list\[\$i\]\['bo_subject'\]\); \?>/,
          /<\?php echo get_text\(\$list\[\$i\]\['ms_datetime'\]\); \?>/,
          /href="<\?php echo get_text\(\$list\[\$i\]\['del_href'\]\); \?>"/,
        ],
        forbidden: [
          /echo \$g5\['title'\]/,
          /href="<\?php echo \$list\[\$i\]\['opener_href_wr_id'\]/,
          /opener\.document\.location\.href='<\?php echo \$list\[\$i\]\['opener_href_wr_id'\]/,
          /echo \$list\[\$i\]\['subject'\]/,
          /href="<\?php echo \$list\[\$i\]\['opener_href'\]/,
          /echo \$list\[\$i\]\['bo_subject'\]/,
          /echo \$list\[\$i\]\['ms_datetime'\]/,
          /href="<\?php echo \$list\[\$i\]\['del_href'\]/,
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
        assert.match(source, new RegExp(`<label for="${field}"(?![^>]*sound_only)`), `${file} should show a visible label for ${field}`);
        assert.doesNotMatch(source, new RegExp(`<label for="${field}"[^>]*class="sound_only"`), `${file} should not hide the ${field} label`);
      }
    }
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

      assert.match(source, new RegExp(`<label for="${field}"(?![^>]*sound_only)`), `${file} should show a visible search label`);
      assert.doesNotMatch(source, new RegExp(`<label[^>]*class="sound_only"[^>]*for="${field}"`), `${file} should not hide the search label`);
      assert.match(source, /<div class="ss-search-row">/, `${file} should keep search input and button grouped`);
    }
  });

  it('styles visible account utility labels and textareas for scan-friendly forms', () => {
    const css = read('src/skin/member/sungsan/style.css');

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

  it('styles board list search labels without changing the compact header search', () => {
    const css = read('src/scss/main.scss');

    assert.match(css, /\.ss-board-search\s*\{/);
    assert.match(css, /\.ss-board-search\s+label:not\(\.sound_only\)/);
    assert.match(css, /width:\s*min\(100%,\s*520px\)/);
    assert.match(css, /overflow:\s*visible/);
    assert.match(css, /\.ss-search-row\s*\{/);
    assert.match(css, /border:\s*1px solid var\(--ss-color-border\)/);
  });

  it('escapes board search terms before rendering them in form attributes', () => {
    for (const file of [
      'src/skin/board/sungsan_news/list.skin.php',
      'src/skin/board/sungsan_free/list.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /action="<\?php echo get_text\(\$_SERVER\['SCRIPT_NAME'\]\); \?>"/, `${file} should escape form action`);
      assert.match(source, /name="bo_table" value="<\?php echo get_text\(\$bo_table\); \?>"/, `${file} should escape bo_table`);
      assert.match(source, /get_text\(stripslashes\(\$stx\)\)/, `${file} should escape stx`);
      assert.doesNotMatch(source, /action="<\?php echo \$_SERVER\['SCRIPT_NAME'\]; \?>"/, `${file} should not echo raw form action`);
      assert.doesNotMatch(source, /name="bo_table" value="<\?php echo \$bo_table; \?>"/, `${file} should not echo raw bo_table`);
      assert.doesNotMatch(source, /echo\s+stripslashes\(\$stx\)/, `${file} should not echo raw stx`);
    }
  });

  it('escapes board return parameters before rendering hidden form attributes', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
      'src/skin/member/sungsan/password.skin.php',
    ]) {
      const source = read(file);

      for (const variable of ['bo_table', 'sfl', 'stx', 'page']) {
        assert.match(
          source,
          new RegExp(`name="${variable}" value="<\\?php echo get_text\\(\\$${variable}\\); \\?>"`),
          `${file} should escape ${variable}`,
        );
        assert.doesNotMatch(
          source,
          new RegExp(`name="${variable}" value="<\\?php echo \\$${variable};? \\?>"`),
          `${file} should not echo raw ${variable}`,
        );
      }
    }

    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      for (const variable of ['sca', 'spt', 'sst', 'sod']) {
        assert.match(
          source,
          new RegExp(`name="${variable}" value="<\\?php echo get_text\\(\\$${variable}\\); \\?>"`),
          `${file} should escape ${variable}`,
        );
        assert.doesNotMatch(
          source,
          new RegExp(`name="${variable}" value="<\\?php echo \\$${variable};? \\?>"`),
          `${file} should not echo raw ${variable}`,
        );
      }
    }
  });

  it('escapes board write form actions and editable values before rendering forms', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /action="<\?php echo get_text\(\$action_url\); \?>"/, `${file} should escape action_url`);
      assert.match(source, /id="wr_subject" name="wr_subject" value="<\?php echo get_text\(\$subject\); \?>"/, `${file} should escape subject`);
      assert.match(source, /<textarea id="wr_content" name="wr_content" required[^>]*><\?php echo get_text\(\$content\); \?><\/textarea>/, `${file} should escape content`);
      assert.match(source, /href="<\?php echo get_text\(\$sungsan_cancel_url\); \?>"/, `${file} should escape cancel url`);

      assert.doesNotMatch(source, /action="<\?php echo \$action_url/);
      assert.doesNotMatch(source, /value="<\?php echo \$subject/);
      assert.doesNotMatch(source, /<textarea id="wr_content" name="wr_content" required><\?php echo \$content/);
      assert.doesNotMatch(source, /href="<\?php echo \$sungsan_cancel_url/);
    }

    const news = read('src/skin/board/sungsan_news/write.skin.php');

    for (const field of ['legacy_board_id', 'legacy_post_id', 'review_flag', 'review_reason']) {
      assert.match(news, new RegExp(`value="<\\?php echo get_text\\(\\$${field}\\); \\?>"`), `news write should escape ${field}`);
      assert.doesNotMatch(news, new RegExp(`value="<\\?php echo \\$${field}; \\?>"`), `news write should not echo raw ${field}`);
    }

    assert.match(news, /<option value="<\?php echo get_text\(\$category\); \?>"<\?php echo sungsan_selected\(\$ca_name, \$category\); \?>><\?php echo get_text\(\$category\); \?><\/option>/);
    assert.match(news, /<option value="<\?php echo get_text\(\$slug\); \?>"<\?php echo sungsan_selected\(\$group_slug, \$slug\); \?>><\?php echo get_text\(\$label\); \?><\/option>/);
    assert.doesNotMatch(news, /<option value="<\?php echo \$category; \?>"/);
    assert.doesNotMatch(news, /<option value="<\?php echo \$slug; \?>"/);
    assert.doesNotMatch(news, /><\?php echo \$category; \?><\/option>/);
    assert.doesNotMatch(news, /><\?php echo \$label; \?><\/option>/);
  });

  it('routes board write cancel links to list for new posts and view for edits', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(
        source,
        /\$sungsan_cancel_url = \(\$w === 'u' && !empty\(\$wr_id\)\) \? get_pretty_url\(\$bo_table, \$wr_id\) : \$list_href;/,
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
    for (const file of [
      'src/skin/board/sungsan_news/list.skin.php',
      'src/skin/board/sungsan_free/list.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /href="<\?php echo get_text\(\$write_href\); \?>"/, `${file} should escape write_href`);
      assert.match(source, /get_text\(\$list\[\$i\]\['subject'\]\)/, `${file} should escape subject`);
      assert.match(source, /get_text\(\$list\[\$i\]\['datetime2'\]\)/, `${file} should escape datetime`);
      assert.match(source, /number_format\(\(int\) \$list\[\$i\]\['wr_hit'\]\)/, `${file} should cast hit count`);

      assert.doesNotMatch(source, /href="<\?php echo \$write_href/);
      assert.doesNotMatch(source, /echo \$list\[\$i\]\['subject'\]/);
      assert.doesNotMatch(source, /echo \$list\[\$i\]\['datetime2'\]/);
      assert.doesNotMatch(source, /number_format\(\$list\[\$i\]\['wr_hit'\]\)/);
    }

    const freeList = read('src/skin/board/sungsan_free/list.skin.php');

    assert.match(freeList, /href="<\?php echo get_text\(\$sungsan_post_href\); \?>"/);
    assert.doesNotMatch(freeList, /href="<\?php echo get_text\(\$list\[\$i\]\['href'\]\); \?>"/);
    assert.match(freeList, /get_text\(\$list\[\$i\]\['wr_name'\]\)/);
    assert.doesNotMatch(freeList, /echo \$list\[\$i\]\['name'\]/);

    const newsList = read('src/skin/board/sungsan_news/list.skin.php');

    assert.match(newsList, /href="<\?php echo get_text\(\$list\[\$i\]\['href'\]\); \?>"/);
    assert.doesNotMatch(newsList, /href="<\?php echo \$list\[\$i\]\['href'\]/);
    assert.match(newsList, /bo_table=<\?php echo get_text\(\$bo_table\); \?>/);
    assert.match(newsList, /<\?php echo get_text\(\$category\); \?><\/a>/);
    assert.doesNotMatch(newsList, /bo_table=<\?php echo \$bo_table; \?>/);
    assert.doesNotMatch(newsList, /><\?php echo \$category; \?><\/a>/);

    for (const file of [
      'src/skin/board/sungsan_news/view.skin.php',
      'src/skin/board/sungsan_free/view.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /get_text\(\$view\['datetime'\]\)/, `${file} should escape view datetime`);
      assert.match(source, /get_text\(\$view\['wr_name'\]\)/, `${file} should escape view author name`);
      assert.match(source, /number_format\(\(int\) \$view\['wr_hit'\]\)/, `${file} should cast view hit count`);
      assert.match(source, /href="<\?php echo get_text\(\$view\['file'\]\[\$i\]\['href'\]\); \?>"/, `${file} should escape attachment href`);
      assert.match(source, /href="<\?php echo get_text\(\$list_href\); \?>"/, `${file} should escape list_href`);
      assert.match(source, /href="<\?php echo get_text\(\$update_href\); \?>"/, `${file} should escape update_href`);
      assert.match(source, /href="<\?php echo get_text\(\$delete_href\); \?>"/, `${file} should escape delete_href`);

      assert.doesNotMatch(source, /echo \$view\['datetime'\]/);
      assert.doesNotMatch(source, /echo \$view\['name'\]/);
      assert.doesNotMatch(source, /number_format\(\$view\['wr_hit'\]\)/);
      assert.doesNotMatch(source, /href="<\?php echo \$view\['file'\]\[\$i\]\['href'\]/);
      assert.doesNotMatch(source, /href="<\?php echo \$list_href/);
      assert.doesNotMatch(source, /href="<\?php echo \$update_href/);
      assert.doesNotMatch(source, /href="<\?php echo \$delete_href/);
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

  it('escapes home and latest post links and titles before rendering latest content', () => {
    const index = read('src/theme/sungsan/index.php');
    const latest = read('src/skin/latest/sungsan_list/latest.skin.php');

    assert.match(index, /href="<\?php echo get_text\(\$photo_posts\[\$i\]\['href'\]\); \?>"/);
    assert.match(index, /<strong><\?php echo get_text\(\$photo_posts\[\$i\]\['subject'\]\); \?><\/strong>/);
    assert.match(index, /href="<\?php echo get_text\(\$sungsan_home_post_href\); \?>"/);
    assert.match(index, /get_text\(\$posts\[\$i\]\['subject'\]\)/);
    assert.doesNotMatch(index, /href="<\?php echo \$photo_posts\[\$i\]\['href'\]/);
    assert.doesNotMatch(index, /echo \$photo_posts\[\$i\]\['subject'\]/);
    assert.doesNotMatch(index, /href="<\?php echo \$sungsan_home_post_href/);
    assert.doesNotMatch(index, /echo \$posts\[\$i\]\['subject'\]/);

    assert.match(latest, /href="<\?php echo get_text\(\$list\[\$i\]\['href'\]\); \?>"/);
    assert.match(latest, /get_text\(\$list\[\$i\]\['subject'\]\)/);
    assert.match(latest, /get_text\(\$list\[\$i\]\['datetime2'\]\)/);
    assert.doesNotMatch(latest, /href="<\?php echo \$list\[\$i\]\['href'\]/);
    assert.doesNotMatch(latest, /echo \$list\[\$i\]\['subject'\]/);
    assert.doesNotMatch(latest, /echo \$list\[\$i\]\['datetime2'\]/);
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

  it('sends guest home free-board post clicks to login with the post as return target', () => {
    const index = read('src/theme/sungsan/index.php');

    assert.match(index, /global \$is_member;/);
    assert.match(index, /\$sungsan_requires_login = !\$is_member && \$access_label;/);
    assert.match(index, /\$sungsan_home_post_href = \$sungsan_requires_login \? G5_BBS_URL\.'\/login\.php\?url='\.urlencode\(htmlspecialchars_decode\(\$posts\[\$i\]\['href'\], ENT_QUOTES\)\) : \$posts\[\$i\]\['href'\];/);
    assert.match(index, /class="ss-post-row<\?php echo \$sungsan_requires_login \? ' restricted' : ''; \?>"/);
    assert.match(index, /href="<\?php echo get_text\(\$sungsan_home_post_href\); \?>"/);
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
    assert.match(source, /login\.php/);
    assert.match(source, /get_pretty_url\(\$bo_table,\s*\$wr_id\)/);
    assert.match(source, /alert\(/);
    assert.match(extend, /sungsan_can_read_visibility\(\$visibility\)/);
  });

  it('separates login redirects from insufficient-permission alerts for news downloads', () => {
    const source = read('src/skin/board/sungsan_news/download.head.skin.php');

    assert.match(source, /global \$is_member;/);
    assert.match(source, /\$is_review_restricted = function_exists\('sungsan_is_review_restricted'\) && sungsan_is_review_restricted\(\$write\);/);
    assert.match(source, /\$sungsan_show_login_redirect = !\$is_member && !\$is_review_restricted;/);
    assert.match(source, /권한이 있는 계정으로 로그인하면 첨부를 내려받을 수 있습니다\./);
    assert.match(source, /현재 계정으로는 이 첨부 파일을 내려받을 수 없습니다\./);
    assert.match(source, /if \(\$sungsan_show_login_redirect\) \{[\s\S]*?login\.php[\s\S]*?\}[\s\S]*?alert\(\$message\);/);
    assert.doesNotMatch(source, /로그인 후 권한을 확인해 주세요/);
    assert.doesNotMatch(source, /!\s*empty\(\$member\['mb_id'\]\)/);
  });

  it('uses raw query separators for server-side news download login redirects', () => {
    const source = read('src/skin/board/sungsan_news/download.head.skin.php');

    assert.match(source, /login\.php\?wr_id='\.\$wr_id\.'&'\.\$qstr\.'&url='/);
    assert.doesNotMatch(source, /&amp;/);
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

  it('separates login guidance from insufficient-permission guidance on restricted news detail', () => {
    const view = read('src/skin/board/sungsan_news/view.skin.php');

    assert.match(view, /global \$is_member;/);
    assert.match(view, /\$sungsan_show_login_cta = !\$is_member && !sungsan_is_review_restricted\(\$view\);/);
    assert.match(view, /권한이 있는 계정으로 로그인하면 본문과 첨부를 볼 수 있습니다\./);
    assert.match(view, /현재 계정으로는 이 글을 열람할 수 없습니다\./);
    assert.match(view, /<\?php if \(\$sungsan_show_login_cta\) \{ \?>[\s\S]*?로그인[\s\S]*?<\?php \} else \{ \?>[\s\S]*?목록으로 돌아가기/);
  });

  it('keeps restricted news visible in lists while marking posts that need permission', () => {
    const list = read('src/skin/board/sungsan_news/list.skin.php');
    const css = read('src/scss/main.scss');

    assert.match(
      list,
      /if \(sungsan_is_review_restricted\(\$list\[\$i\]\) && !\$is_admin\) \{\s*continue;\s*\}/,
      'news list should only hide operator-review migrated posts',
    );
    assert.match(list, /\$can_read_post = sungsan_can_read_news_post\(\$list\[\$i\]\);/);
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

  it('marks free board list posts as member-readable before visitors open them', () => {
    const list = read('src/skin/board/sungsan_free/list.skin.php');

    assert.match(list, /<span class="ss-access-label">회원 열람<\/span>/);
    assert.match(list, /get_text\(\$list\[\$i\]\['wr_name'\]\)[\s\S]*?<span class="ss-access-label">회원 열람<\/span>/);
  });

  it('sends guest free-board row clicks to login with the post as return target', () => {
    const list = read('src/skin/board/sungsan_free/list.skin.php');

    assert.match(list, /global \$is_member;/);
    assert.match(list, /\$sungsan_post_href = \$is_member \? \$list\[\$i\]\['href'\] : G5_BBS_URL\.'\/login\.php\?url='\.urlencode\(htmlspecialchars_decode\(\$list\[\$i\]\['href'\], ENT_QUOTES\)\);/);
    assert.match(list, /class="ss-post-row<\?php echo \$is_member \? '' : ' restricted'; \?>"/);
    assert.match(list, /href="<\?php echo get_text\(\$sungsan_post_href\); \?>"/);
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

  it('connects board write required and attachment guidance to form controls', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /<p id="ss-write-required-help" class="ss-form-help ss-form-summary">/, `${file} should expose a required-field summary`);
      assert.match(source, /id="wr_subject"[\s\S]*?aria-describedby="ss-write-required-help"/, `${file} should connect subject help`);
      assert.match(source, /id="wr_content"[\s\S]*?aria-describedby="ss-write-required-help"/, `${file} should connect content help`);
      assert.match(source, /\$sungsan_upload_limit_mb = isset\(\$board\['bo_upload_size'\]\) \? max\(1, \(int\) ceil\(\(int\) \$board\['bo_upload_size'\] \/ 1048576\)\) : 10;/, `${file} should calculate the upload size limit from board settings`);
      assert.match(source, /<\?php if \(\$is_file\) \{ \?>/, `${file} should group attachment guidance before file fields`);
      assert.match(source, /<p id="ss-attachment-help" class="ss-form-help ss-attachment-help">/, `${file} should expose attachment guidance once`);
      assert.match(source, /파일 한 개당 <\?php echo number_format\(\(int\) \$sungsan_upload_limit_mb\); \?>MB 이하/, `${file} should show the per-file upload size limit`);
      assert.match(source, /id="bf_file_<\?php echo \$i \+ 1; \?>"[\s\S]*?aria-describedby="ss-attachment-help"/, `${file} should connect attachment help`);
    }

    const news = read('src/skin/board/sungsan_news/write.skin.php');
    assert.match(news, /id="ca_name"[\s\S]*?aria-describedby="ss-write-required-help"/, 'news write should connect category help');
  });

  it('styles board write summaries as scannable guidance blocks', () => {
    const css = read('src/scss/main.scss');

    assert.match(css, /\.ss-form-summary,\s*\n\.ss-attachment-help/);
    assert.match(css, /border-left:\s*4px solid var\(--ss-color-primary\)/);
    assert.match(css, /background:\s*var\(--ss-color-primary-soft\)/);
  });

  it('shows blocked upload extension guidance on board write forms', () => {
    for (const file of [
      'src/skin/board/sungsan_news/write.skin.php',
      'src/skin/board/sungsan_free/write.skin.php',
    ]) {
      const source = read(file);

      assert.match(source, /PHP, HTML, JS, SVG/, `${file} should name blocked active file types`);
      assert.match(source, /업로드할 수 없습니다/, `${file} should explain blocked files cannot be uploaded`);
      assert.doesNotMatch(source, /실행 파일은 업로드하지 않습니다\./, `${file} should avoid vague upload guidance`);
    }
  });
});
