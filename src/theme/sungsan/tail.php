<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

$ss_footer_home_url = G5_URL;
$ss_footer_intro_url = G5_URL.'/theme/sungsan/page/intro.php';
$ss_footer_news_url = G5_BBS_URL.'/board.php?bo_table=news';
$ss_footer_free_url = G5_BBS_URL.'/board.php?bo_table=free';
$ss_footer_qalist_url = G5_BBS_URL.'/qalist.php';
?>
</main>
<footer class="ss-site-footer">
    <div class="ss-container ss-footer-inner">
        <strong>성산회</strong>
        <div class="ss-footer-links">
            <a href="<?php echo get_text($ss_footer_home_url); ?>">HOME</a>
            <a href="<?php echo get_text($ss_footer_intro_url); ?>">소개</a>
            <a href="<?php echo get_text($ss_footer_news_url); ?>">소식</a>
            <a href="<?php echo get_text($ss_footer_free_url); ?>">자유게시판</a>
            <a href="#email-collection-refusal">이메일 무단수집 거부</a>
            <a href="<?php echo get_text($ss_footer_qalist_url); ?>">관리 문의</a>
        </div>
        <p id="email-collection-refusal">이메일 주소 무단수집을 거부합니다. 성산회 홈페이지에 게시된 개인정보는 본래 목적 외 수집 및 이용을 금지합니다.</p>
        <p>Copyright &copy; <?php echo date('Y'); ?> 성산회. All rights reserved.</p>
    </div>
</footer>
<?php
include_once G5_THEME_PATH.'/tail.sub.php';
