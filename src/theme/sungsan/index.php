<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!defined('_INDEX_')) {
    define('_INDEX_', true);
}
include_once G5_THEME_PATH.'/head.php';
?>
<section class="ss-hero">
    <div class="ss-container">
        <h1>성산회의 소식과 자료를 한눈에 확인하세요</h1>
        <p>공지, 일정, 자료, 활동 소식을 찾기 쉽게 정리하고 회원들이 편하게 소통할 수 있도록 새롭게 준비한 성산회 홈페이지입니다.</p>
    </div>
</section>

<section class="ss-section">
    <div class="ss-container ss-card-grid">
        <div>
            <div class="ss-section-header">
                <h2 class="ss-section-title">최근 공지</h2>
                <a href="<?php echo G5_BBS_URL; ?>/board.php?bo_table=news&sca=공지">더보기</a>
            </div>
            <?php echo function_exists('latest') ? latest('theme/sungsan_list', 'news', 5, 40) : ''; ?>
        </div>
        <div>
            <div class="ss-section-header">
                <h2 class="ss-section-title">다가오는 일정</h2>
                <a href="<?php echo G5_BBS_URL; ?>/board.php?bo_table=news&sca=행사">더보기</a>
            </div>
            <?php echo function_exists('latest') ? latest('theme/sungsan_list', 'news', 5, 40) : ''; ?>
        </div>
    </div>
</section>

<section class="ss-section">
    <div class="ss-container ss-card-grid">
        <div>
            <div class="ss-section-header">
                <h2 class="ss-section-title">자료와 규정</h2>
                <a href="<?php echo G5_BBS_URL; ?>/board.php?bo_table=news&sca=자료">더보기</a>
            </div>
            <?php echo function_exists('latest') ? latest('theme/sungsan_list', 'news', 5, 40) : ''; ?>
        </div>
        <div>
            <div class="ss-section-header">
                <h2 class="ss-section-title">자유게시판</h2>
                <a href="<?php echo G5_BBS_URL; ?>/board.php?bo_table=free">더보기</a>
            </div>
            <?php echo function_exists('latest') ? latest('theme/sungsan_list', 'free', 5, 40) : ''; ?>
        </div>
    </div>
</section>
<?php
include_once G5_THEME_PATH.'/tail.php';
