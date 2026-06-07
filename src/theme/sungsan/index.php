<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!defined('_INDEX_')) {
    define('_INDEX_', true);
}
include_once G5_THEME_PATH.'/head.php';

$ss_home_news_url = G5_BBS_URL.'/board.php?bo_table=news';
$ss_home_intro_url = G5_URL.'/theme/sungsan/page/intro.php';
$ss_home_notice_url = G5_BBS_URL.'/board.php?bo_table=news&sca='.urlencode('공지');
$ss_home_event_url = G5_BBS_URL.'/board.php?bo_table=news&sca='.urlencode('행사');
$ss_home_resource_url = G5_BBS_URL.'/board.php?bo_table=news&sca='.urlencode('자료');
$ss_home_free_url = G5_BBS_URL.'/board.php?bo_table=free';
$ss_home_activity_url = G5_BBS_URL.'/board.php?bo_table=news&sca='.urlencode('활동소식');

$notice_posts = sungsan_latest_board_posts('news', array('category' => '공지', 'limit' => 5));
$event_posts = sungsan_latest_board_posts('news', array('category' => '행사', 'upcoming' => true, 'limit' => 3));
$resource_posts = sungsan_latest_board_posts('news', array('category' => array('자료', '규정'), 'limit' => 5));
$free_posts = sungsan_latest_board_posts('free', array('limit' => 5));
$photo_posts = sungsan_latest_board_posts('news', array('groupSlug' => 'photo', 'thumbnail' => true, 'limit' => 4));
?>
<section class="ss-hero">
    <div class="ss-container ss-hero-layout">
        <div>
            <p class="ss-eyebrow">성산회 공식 홈페이지</p>
            <h1>중요한 공지와 자료를 더 빠르고 또렷하게 확인하세요</h1>
            <p>성산회의 공지, 일정, 자료, 활동 소식을 한곳에 모아 회원 누구나 편하게 찾고 읽을 수 있도록 새롭게 정리했습니다.</p>
            <div class="ss-action-bar">
                <a class="ss-button" href="<?php echo get_text($ss_home_news_url); ?>">소식 보기</a>
                <a class="ss-button secondary" href="<?php echo get_text($ss_home_intro_url); ?>">성산회 소개</a>
            </div>
        </div>
        <aside class="ss-hero-summary" aria-label="홈페이지 주요 기능">
            <strong>홈페이지 이용</strong>
            <ul>
                <li>공지와 행사를 먼저 확인합니다.</li>
                <li>자료와 규정은 소식에서 종류별로 찾습니다.</li>
                <li>자유게시판은 로그인한 회원이 이용합니다.</li>
            </ul>
        </aside>
    </div>
</section>

<section class="ss-section">
    <div class="ss-container ss-card-grid">
        <div>
            <div class="ss-section-header">
                <h2 class="ss-section-title">최근 공지</h2>
                <a href="<?php echo get_text($ss_home_notice_url); ?>">더보기</a>
            </div>
            <?php sungsan_render_home_list($notice_posts, '등록된 공지가 없습니다.'); ?>
        </div>
        <div>
            <div class="ss-section-header">
                <h2 class="ss-section-title">다가오는 일정</h2>
                <a href="<?php echo get_text($ss_home_event_url); ?>">더보기</a>
            </div>
            <?php sungsan_render_home_list($event_posts, '예정된 일정이 없습니다.', true); ?>
        </div>
    </div>
</section>

<section class="ss-section">
    <div class="ss-container ss-card-grid">
        <div>
            <div class="ss-section-header">
                <h2 class="ss-section-title">자료와 규정</h2>
                <a href="<?php echo get_text($ss_home_resource_url); ?>">더보기</a>
            </div>
            <?php sungsan_render_home_list($resource_posts, '등록된 자료가 없습니다.'); ?>
        </div>
        <div>
            <div class="ss-section-header">
                <h2 class="ss-section-title">자유게시판</h2>
                <a href="<?php echo get_text($ss_home_free_url); ?>">더보기</a>
            </div>
            <?php sungsan_render_home_list($free_posts, '등록된 자유게시판 글이 없습니다.', false, false, '회원 열람'); ?>
        </div>
    </div>
</section>

<section class="ss-section ss-section-muted">
    <div class="ss-container">
        <div class="ss-section-header">
            <h2 class="ss-section-title">사진·영상 자료</h2>
            <a href="<?php echo get_text($ss_home_activity_url); ?>">활동소식 보기</a>
        </div>
        <div class="ss-media-grid">
            <?php for ($i = 0; $i < count($photo_posts); $i++) { ?>
                <a class="ss-media-tile" href="<?php echo get_text($photo_posts[$i]['href']); ?>">
                    <?php if (!empty($photo_posts[$i]['thumb_src'])) { ?>
                        <img class="ss-media-thumb" src="<?php echo get_text($photo_posts[$i]['thumb_src']); ?>" alt="<?php echo get_text($photo_posts[$i]['thumb_alt']); ?>" loading="lazy">
                    <?php } else { ?>
                        <span class="ss-media-thumb" aria-hidden="true"></span>
                    <?php } ?>
                    <strong><?php echo get_text($photo_posts[$i]['subject']); ?></strong>
                    <span><?php echo get_text($photo_posts[$i]['date']); ?></span>
                </a>
            <?php } ?>
            <?php if (count($photo_posts) === 0) { ?>
                <div class="ss-panel ss-empty-state">
                    <strong>등록된 사진·영상 자료가 없습니다</strong>
                    <p>활동소식에 사진이나 영상이 포함된 글이 올라오면 이 영역에 함께 표시됩니다.</p>
                </div>
            <?php } ?>
        </div>
    </div>
</section>
<?php
include_once G5_THEME_PATH.'/tail.php';

function sungsan_render_home_list($posts, $empty_text, $show_event_date = false, $show_category = true, $access_label = '')
{
    global $is_member;

    ?>
    <div class="ss-post-list">
        <?php for ($i = 0; $i < count($posts); $i++) { ?>
            <?php
            $sungsan_requires_login = !$is_member && $access_label;
            $sungsan_home_post_href = $sungsan_requires_login ? G5_BBS_URL.'/login.php?url='.urlencode(htmlspecialchars_decode($posts[$i]['href'], ENT_QUOTES)) : $posts[$i]['href'];
            ?>
            <a class="ss-post-row<?php echo $sungsan_requires_login ? ' restricted' : ''; ?>" href="<?php echo get_text($sungsan_home_post_href); ?>">
                <p class="ss-post-title"><?php echo get_text($posts[$i]['subject']); ?></p>
                <div class="ss-meta">
                    <?php if ($show_category && !empty($posts[$i]['ca_name'])) { ?>
                        <span class="ss-badge"><?php echo get_text($posts[$i]['ca_name']); ?></span>
                    <?php } ?>
                    <?php if (!empty($posts[$i]['wr_1'])) { ?>
                        <?php $group_label = sungsan_get_group_label($posts[$i]['wr_1']); ?>
                        <?php if ($group_label) { ?><span class="ss-badge accent"><?php echo get_text($group_label); ?></span><?php } ?>
                    <?php } ?>
                    <?php if ($access_label) { ?><span class="ss-access-label"><?php echo get_text($access_label); ?></span><?php } ?>
                    <?php if ($show_event_date && !empty($posts[$i]['wr_3'])) { ?>
                        <span><?php echo get_text($posts[$i]['wr_3']); ?></span>
                    <?php } else { ?>
                        <span><?php echo get_text($posts[$i]['date']); ?></span>
                    <?php } ?>
                </div>
            </a>
        <?php } ?>
        <?php if (count($posts) === 0) { ?>
            <div class="ss-post-row">
                <p class="ss-post-title"><?php echo get_text($empty_text); ?></p>
            </div>
        <?php } ?>
    </div>
    <?php
}
