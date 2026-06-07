<?php
if (!defined('_GNUBOARD_')) {
    exit;
}
?>
</main>
<footer class="ss-site-footer">
    <div class="ss-container ss-footer-inner">
        <strong>성산회</strong>
        <div class="ss-footer-links">
            <a href="<?php echo G5_URL; ?>">HOME</a>
            <a href="<?php echo G5_URL; ?>/theme/sungsan/page/intro.php">소개</a>
            <a href="<?php echo G5_BBS_URL; ?>/board.php?bo_table=news">소식</a>
            <a href="<?php echo G5_BBS_URL; ?>/board.php?bo_table=free">자유게시판</a>
            <a href="#email-collection-refusal">이메일 무단수집 거부</a>
            <a href="<?php echo G5_BBS_URL; ?>/qalist.php">관리 문의</a>
        </div>
        <p id="email-collection-refusal">이메일 주소 무단수집을 거부합니다. 성산회 홈페이지에 게시된 개인정보는 본래 목적 외 수집 및 이용을 금지합니다.</p>
        <p>Copyright &copy; <?php echo date('Y'); ?> 성산회. All rights reserved.</p>
    </div>
</footer>
<?php
include_once G5_THEME_PATH.'/tail.sub.php';
