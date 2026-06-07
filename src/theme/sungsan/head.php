<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (G5_IS_MOBILE && defined('G5_THEME_MOBILE_PATH') && is_file(G5_THEME_MOBILE_PATH.'/head.php')) {
    include_once G5_THEME_MOBILE_PATH.'/head.php';
    return;
}

if (function_exists('add_stylesheet')) {
    add_stylesheet('<link rel="stylesheet" href="'.G5_THEME_URL.'/css/sungsan.css">', 0);
}

include_once G5_THEME_PATH.'/head.sub.php';

if (defined('G5_LIB_PATH') && is_file(G5_LIB_PATH.'/latest.lib.php')) {
    include_once G5_LIB_PATH.'/latest.lib.php';
}

$ss_current = isset($bo_table) ? $bo_table : '';
$ss_is_intro = isset($sungsan_page) && $sungsan_page === 'intro';
$ss_is_mypage = isset($sungsan_page) && $sungsan_page === 'mypage';
$ss_home_url = G5_URL;
$ss_intro_url = G5_URL.'/theme/sungsan/page/intro.php';
$ss_news_url = G5_BBS_URL.'/board.php?bo_table=news';
$ss_free_url = G5_BBS_URL.'/board.php?bo_table=free';
$ss_search_action_url = G5_BBS_URL.'/board.php';
$ss_mypage_url = G5_URL.'/sungsan/mypage.php';
$ss_request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
$ss_login_url = sungsan_login_url($ss_request_uri);
$ss_header_search_value = isset($stx) ? stripslashes($stx) : '';
?>
<a href="#container" class="ss-skip-link">본문 바로가기</a>
<header class="ss-site-header">
    <div class="ss-container ss-header-inner">
        <a class="ss-brand" href="<?php echo get_text($ss_home_url); ?>">
            <span class="ss-brand-mark" aria-hidden="true">성</span>
            <span><?php echo get_text($config['cf_title'] ? $config['cf_title'] : '성산회'); ?></span>
        </a>

        <nav class="ss-primary-nav" aria-label="주요 메뉴">
            <a href="<?php echo get_text($ss_home_url); ?>"<?php echo defined('_INDEX_') ? ' aria-current="page"' : ''; ?>>홈</a>
            <a href="<?php echo get_text($ss_intro_url); ?>"<?php echo $ss_is_intro ? ' aria-current="page"' : ''; ?>>소개</a>
            <a href="<?php echo get_text($ss_news_url); ?>"<?php echo $ss_current === 'news' ? ' aria-current="page"' : ''; ?>>소식</a>
            <a href="<?php echo get_text($ss_free_url); ?>"<?php echo $ss_current === 'free' ? ' aria-current="page"' : ''; ?>>자유게시판</a>
        </nav>

        <div class="ss-header-actions">
            <form class="ss-search-form" method="get" action="<?php echo get_text($ss_search_action_url); ?>">
                <input type="hidden" name="bo_table" value="news">
                <input type="hidden" name="sfl" value="wr_subject||wr_content">
                <input type="hidden" name="sop" value="and">
                <label class="ss-search-label" for="ss_stx">소식 검색</label>
                <div class="ss-search-row">
                    <input id="ss_stx" name="stx" type="search" value="<?php echo get_text($ss_header_search_value); ?>" maxlength="30" enterkeyhint="search">
                    <button type="submit">검색</button>
                </div>
            </form>
            <?php if ($is_member) { ?>
                <a class="ss-account-link ss-account-link-member" href="<?php echo get_text($ss_mypage_url); ?>"<?php echo $ss_is_mypage ? ' aria-current="page"' : ''; ?>>
                    <span class="ss-account-icon" aria-hidden="true"></span>
                    <span class="ss-account-text">마이페이지</span>
                </a>
            <?php } else { ?>
                <a class="ss-account-link" href="<?php echo get_text($ss_login_url); ?>">로그인</a>
            <?php } ?>
        </div>
    </div>
</header>
<main id="container">
