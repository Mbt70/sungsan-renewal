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
$sungsan_home_news_categories = sungsan_get_current_news_categories();
$sungsan_home_notice_category = sungsan_get_news_category_at($sungsan_home_news_categories, '공지', 0);
$sungsan_home_event_category = sungsan_get_news_category_at($sungsan_home_news_categories, '행사', 1);
$sungsan_home_resource_categories = sungsan_get_news_categories_at($sungsan_home_news_categories, array('자료', '규정'), array(2, 3));
$sungsan_home_resource_category = isset($sungsan_home_resource_categories[0]) ? $sungsan_home_resource_categories[0] : '자료';
$sungsan_home_activity_category = sungsan_get_news_category_at($sungsan_home_news_categories, '활동소식', 4);
$ss_home_notice_url = G5_BBS_URL.'/board.php?bo_table=news&sca='.urlencode($sungsan_home_notice_category);
$ss_home_event_url = G5_BBS_URL.'/board.php?bo_table=news&sca='.urlencode($sungsan_home_event_category);
$ss_home_resource_url = G5_BBS_URL.'/board.php?bo_table=news&sca='.urlencode($sungsan_home_resource_category);
$ss_home_free_url = G5_BBS_URL.'/board.php?bo_table=free';
$ss_home_activity_url = G5_BBS_URL.'/board.php?bo_table=news&sca='.urlencode($sungsan_home_activity_category);

$notice_posts = sungsan_latest_board_posts('news', array('category' => $sungsan_home_notice_category, 'includeNotice' => true, 'limit' => 5));
$event_posts = sungsan_latest_board_posts('news', array('category' => $sungsan_home_event_category, 'upcoming' => true, 'limit' => 3));
$resource_posts = sungsan_latest_board_posts('news', array('category' => $sungsan_home_resource_categories, 'limit' => 5));
$free_posts = sungsan_latest_board_posts('free', array('limit' => 5));
$photo_posts = sungsan_latest_board_posts('news', array('category' => $sungsan_home_activity_category, 'mediaOnly' => true, 'thumbnail' => true, 'limit' => 4));
$sungsan_home_is_member = !empty($is_member);
?>
<section class="ss-hero ss-home-hero">
    <div class="ss-container ss-hero-layout">
        <div class="ss-home-copy">
            <p class="ss-eyebrow">성산회 공식 홈페이지</p>
            <h1>중요한 공지와 자료를 더 빠르고 또렷하게 확인하세요</h1>
            <p>성산회의 공지, 일정, 자료, 활동 소식을 한곳에 모아 회원 누구나 편하게 찾고 읽을 수 있도록 새롭게 정리했습니다.</p>
            <div class="ss-action-bar">
                <a class="ss-button" href="<?php echo get_text($ss_home_news_url); ?>">소식 보기</a>
                <a class="ss-button secondary" href="<?php echo get_text($ss_home_intro_url); ?>">성산회 소개</a>
            </div>
            <div class="ss-home-quick-links" aria-label="자주 찾는 메뉴">
                <a class="ss-home-quick-link" href="<?php echo get_text($ss_home_notice_url); ?>">
                    <strong>공지사항</strong>
                    <span>중요 공지 먼저 확인</span>
                </a>
                <a class="ss-home-quick-link" href="<?php echo get_text($ss_home_event_url); ?>">
                    <strong>다가오는 일정</strong>
                    <span>가까운 행사와 모임</span>
                </a>
                <a class="ss-home-quick-link" href="<?php echo get_text($ss_home_resource_url); ?>">
                    <strong>자료와 규정</strong>
                    <span>회보와 문서 찾기</span>
                </a>
                <a class="ss-home-quick-link" href="<?php echo get_text($ss_home_free_url); ?>">
                    <strong>자유게시판</strong>
                    <span>회원 소통 공간</span>
                </a>
            </div>
        </div>
        <aside class="ss-home-priority" aria-label="오늘 확인할 일">
            <div class="ss-home-priority-heading">
                <div>
                    <p class="ss-eyebrow">오늘 확인할 일</p>
                    <h2>공지와 일정을 먼저 봅니다</h2>
                </div>
                <a href="<?php echo get_text($ss_home_news_url); ?>">전체 소식</a>
            </div>
            <div class="ss-home-priority-list">
                <?php sungsan_render_home_priority_items($notice_posts, $event_posts); ?>
            </div>
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
                <?php
                $sungsan_home_media_post = $photo_posts[$i];
                $sungsan_home_media_raw_href = isset($sungsan_home_media_post['href']) ? $sungsan_home_media_post['href'] : '#';
                $sungsan_home_media_thumb = isset($sungsan_home_media_post['thumb_src']) ? $sungsan_home_media_post['thumb_src'] : '';
                $sungsan_home_media_alt = isset($sungsan_home_media_post['thumb_alt']) ? $sungsan_home_media_post['thumb_alt'] : '';
                $sungsan_home_media_subject = isset($sungsan_home_media_post['subject']) ? $sungsan_home_media_post['subject'] : '';
                $sungsan_home_media_date = isset($sungsan_home_media_post['date']) ? $sungsan_home_media_post['date'] : '';
                $sungsan_home_media_datetime = isset($sungsan_home_media_post['datetime']) ? $sungsan_home_media_post['datetime'] : $sungsan_home_media_date;
                $sungsan_home_media_datetime_attr = preg_match('/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/', $sungsan_home_media_datetime) ? str_replace(' ', 'T', $sungsan_home_media_datetime) : '';
                $sungsan_home_media_visibility = isset($sungsan_home_media_post['wr_2']) ? $sungsan_home_media_post['wr_2'] : '';
                $sungsan_home_media_visibility_label = $sungsan_home_media_visibility !== '' ? sungsan_get_visibility_label($sungsan_home_media_visibility) : '';
                $sungsan_home_media_can_read = $sungsan_home_media_visibility === '' || sungsan_can_read_visibility($sungsan_home_media_visibility);
                $sungsan_home_media_requires_login = !$sungsan_home_is_member && !$sungsan_home_media_can_read;
                $sungsan_home_media_href = $sungsan_home_media_requires_login ? sungsan_login_url($sungsan_home_media_raw_href) : $sungsan_home_media_raw_href;
                ?>
                <a class="ss-media-tile<?php echo $sungsan_home_media_can_read ? '' : ' restricted'; ?>" href="<?php echo get_text($sungsan_home_media_href); ?>">
                    <?php if ($sungsan_home_media_thumb !== '') { ?>
                        <img class="ss-media-thumb" src="<?php echo get_text($sungsan_home_media_thumb); ?>" alt="<?php echo get_text($sungsan_home_media_alt); ?>" loading="lazy">
                    <?php } else { ?>
                        <span class="ss-media-thumb ss-media-thumb-fallback">사진·영상</span>
                    <?php } ?>
                    <strong><?php echo get_text($sungsan_home_media_subject); ?></strong>
                    <?php if ($sungsan_home_media_visibility_label !== '') { ?><span class="ss-access-label"><?php echo get_text($sungsan_home_media_visibility_label); ?></span><?php } ?>
                    <?php if ($sungsan_home_media_datetime_attr !== '') { ?>
                        <time datetime="<?php echo get_text($sungsan_home_media_datetime_attr); ?>"><?php echo get_text($sungsan_home_media_date); ?></time>
                    <?php } else { ?>
                        <span><?php echo get_text($sungsan_home_media_date); ?></span>
                    <?php } ?>
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

function sungsan_render_home_priority_items($notice_posts, $event_posts)
{
    $items = array();

    for ($i = 0; $i < count($notice_posts) && count($items) < 2; $i++) {
        $post = $notice_posts[$i];
        $items[] = array(
            'label' => isset($post['ca_name']) && $post['ca_name'] !== '' ? $post['ca_name'] : '공지',
            'subject' => isset($post['subject']) ? $post['subject'] : '',
            'href' => isset($post['href']) ? $post['href'] : '#',
            'date' => isset($post['date']) ? $post['date'] : '',
            'datetime' => isset($post['datetime']) ? $post['datetime'] : (isset($post['date']) ? $post['date'] : ''),
        );
    }

    for ($i = 0; $i < count($event_posts) && count($items) < 4; $i++) {
        $post = $event_posts[$i];
        $event_date = isset($post['wr_3']) ? $post['wr_3'] : '';
        $items[] = array(
            'label' => isset($post['ca_name']) && $post['ca_name'] !== '' ? $post['ca_name'] : '행사',
            'subject' => isset($post['subject']) ? $post['subject'] : '',
            'href' => isset($post['href']) ? $post['href'] : '#',
            'date' => $event_date !== '' ? $event_date : (isset($post['date']) ? $post['date'] : ''),
            'datetime' => $event_date !== '' ? $event_date : (isset($post['datetime']) ? $post['datetime'] : ''),
        );
    }

    for ($i = 0; $i < count($items); $i++) {
        $item = $items[$i];
        $datetime_attr = preg_match('/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/', $item['datetime']) ? str_replace(' ', 'T', $item['datetime']) : '';
        ?>
        <a href="<?php echo get_text($item['href']); ?>">
            <span class="ss-badge<?php echo $item['label'] === '행사' ? ' accent' : ''; ?>"><?php echo get_text($item['label']); ?></span>
            <strong><?php echo get_text($item['subject']); ?></strong>
            <?php if ($datetime_attr !== '') { ?>
                <time datetime="<?php echo get_text($datetime_attr); ?>"><?php echo get_text($item['date']); ?></time>
            <?php } else { ?>
                <span><?php echo get_text($item['date']); ?></span>
            <?php } ?>
        </a>
        <?php
    }

    if (count($items) === 0) {
        ?>
        <div class="ss-home-priority-empty">등록된 공지나 일정이 없습니다.</div>
        <?php
    }
}

function sungsan_render_home_list($posts, $empty_text, $show_event_date = false, $show_category = true, $access_label = '')
{
    global $is_member;

    $sungsan_home_is_member = !empty($is_member);

    ?>
    <div class="ss-post-list">
        <?php for ($i = 0; $i < count($posts); $i++) { ?>
            <?php
            $sungsan_home_post = $posts[$i];
            $sungsan_home_post_raw_href = isset($sungsan_home_post['href']) ? $sungsan_home_post['href'] : '#';
            $sungsan_home_post_subject = isset($sungsan_home_post['subject']) ? $sungsan_home_post['subject'] : '';
            $sungsan_home_post_category = isset($sungsan_home_post['ca_name']) ? $sungsan_home_post['ca_name'] : '';
            $sungsan_home_post_group = isset($sungsan_home_post['wr_1']) ? $sungsan_home_post['wr_1'] : '';
            $sungsan_home_post_event_date = isset($sungsan_home_post['wr_3']) ? $sungsan_home_post['wr_3'] : '';
            $sungsan_home_post_date = isset($sungsan_home_post['date']) ? $sungsan_home_post['date'] : '';
            $sungsan_home_post_datetime = $show_event_date && $sungsan_home_post_event_date !== '' ? $sungsan_home_post_event_date : (isset($sungsan_home_post['datetime']) ? $sungsan_home_post['datetime'] : $sungsan_home_post_date);
            $sungsan_home_post_display_date = $show_event_date && $sungsan_home_post_event_date !== '' ? $sungsan_home_post_event_date : $sungsan_home_post_date;
            $sungsan_home_post_datetime_attr = preg_match('/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/', $sungsan_home_post_datetime) ? str_replace(' ', 'T', $sungsan_home_post_datetime) : '';
            $sungsan_home_post_is_notice = !empty($sungsan_home_post['is_notice']);
            $sungsan_home_post_visibility = isset($sungsan_home_post['wr_2']) ? $sungsan_home_post['wr_2'] : '';
            $sungsan_home_post_visibility_label = $sungsan_home_post_visibility !== '' ? sungsan_get_visibility_label($sungsan_home_post_visibility) : '';
            $sungsan_home_post_can_read = $sungsan_home_post_visibility === '' || sungsan_can_read_visibility($sungsan_home_post_visibility);
            $sungsan_requires_login = !$sungsan_home_is_member && ($access_label || !$sungsan_home_post_can_read);
            $sungsan_home_post_restricted = $sungsan_requires_login || !$sungsan_home_post_can_read;
            $sungsan_home_post_href = $sungsan_requires_login ? sungsan_login_url($sungsan_home_post_raw_href) : $sungsan_home_post_raw_href;
            ?>
            <a class="ss-post-row<?php echo $sungsan_home_post_restricted ? ' restricted' : ''; ?>" href="<?php echo get_text($sungsan_home_post_href); ?>">
                <p class="ss-post-title"><?php echo get_text($sungsan_home_post_subject); ?></p>
                <div class="ss-meta">
                    <?php if ($access_label && !$sungsan_home_is_member) { ?>
                        <span class="ss-access-label">회원 전용 글입니다. 로그인하면 작성자와 날짜를 볼 수 있습니다.</span>
                    <?php } else { ?>
                        <?php if ($sungsan_home_post_is_notice) { ?><span class="ss-pin-label">중요</span><?php } ?>
                        <?php if ($show_category && $sungsan_home_post_category !== '') { ?>
                            <span class="ss-badge"><?php echo get_text($sungsan_home_post_category); ?></span>
                        <?php } ?>
                        <?php if ($sungsan_home_post_group !== '') { ?>
                            <?php $group_label = sungsan_get_group_label($sungsan_home_post_group); ?>
                            <?php if ($group_label) { ?><span class="ss-badge accent"><?php echo get_text($group_label); ?></span><?php } ?>
                        <?php } ?>
                        <?php if ($sungsan_home_post_visibility_label !== '') { ?><span class="ss-access-label"><?php echo get_text($sungsan_home_post_visibility_label); ?></span><?php } ?>
                        <?php if ($access_label) { ?><span class="ss-access-label"><?php echo get_text($access_label); ?></span><?php } ?>
                        <?php if ($sungsan_home_post_datetime_attr !== '') { ?>
                            <time datetime="<?php echo get_text($sungsan_home_post_datetime_attr); ?>"><?php echo get_text($sungsan_home_post_display_date); ?></time>
                        <?php } else { ?>
                            <span><?php echo get_text($sungsan_home_post_display_date); ?></span>
                        <?php } ?>
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
