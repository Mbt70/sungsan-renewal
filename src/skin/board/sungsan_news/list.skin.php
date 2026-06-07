<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $is_admin;

$current_category = isset($sca) ? $sca : '';
$sungsan_news_search_action = isset($_SERVER['SCRIPT_NAME']) ? $_SERVER['SCRIPT_NAME'] : '';
$sungsan_news_search_term = isset($stx) ? stripslashes($stx) : '';
$visible_count = 0;
$sungsan_news_board_param = urlencode($bo_table);
$sungsan_news_search_query = '';
if ($sungsan_news_search_term !== '') {
    $sungsan_news_search_query = '&sfl=wr_subject%7C%7Cwr_content&sop=and&stx='.urlencode($sungsan_news_search_term);
}
$sungsan_news_list_url = G5_BBS_URL.'/board.php?bo_table='.$sungsan_news_board_param.$sungsan_news_search_query;
$sungsan_news_category_options = sungsan_get_news_categories(isset($board) ? $board : array());
?>
<section class="ss-section">
    <div class="ss-container">
        <div class="ss-section-header">
            <h1 class="ss-section-title"><?php echo get_text($board['bo_subject']); ?></h1>
            <?php if ($write_href) { ?>
                <a class="ss-button" href="<?php echo get_text($write_href); ?>">글쓰기</a>
            <?php } ?>
        </div>

        <div class="ss-filter-bar" aria-label="소식 종류">
            <a class="ss-chip<?php echo sungsan_active_class($current_category, ''); ?>"<?php echo sungsan_aria_current($current_category, ''); ?> href="<?php echo get_text($sungsan_news_list_url); ?>">전체</a>
            <?php foreach ($sungsan_news_category_options as $category) { ?>
                <?php $sungsan_category_href = G5_BBS_URL.'/board.php?bo_table='.$sungsan_news_board_param.'&sca='.urlencode($category).$sungsan_news_search_query; ?>
                <a class="ss-chip<?php echo sungsan_active_class($current_category, $category); ?>"<?php echo sungsan_aria_current($current_category, $category); ?> href="<?php echo get_text($sungsan_category_href); ?>"><?php echo get_text($category); ?></a>
            <?php } ?>
        </div>

        <form class="ss-search-form ss-board-search" method="get" action="<?php echo get_text($sungsan_news_search_action); ?>">
            <input type="hidden" name="bo_table" value="<?php echo get_text($bo_table); ?>">
            <input type="hidden" name="sca" value="<?php echo get_text($current_category); ?>">
            <input type="hidden" name="sop" value="and">
            <input type="hidden" name="sfl" value="wr_subject||wr_content">
            <label for="board_stx">제목과 내용 검색어</label>
            <div class="ss-search-row">
                <input id="board_stx" name="stx" type="search" value="<?php echo get_text($sungsan_news_search_term); ?>" enterkeyhint="search">
                <button type="submit">검색</button>
            </div>
        </form>

        <div class="ss-post-list">
        <?php for ($i = 0; $i < count($list); $i++) { ?>
            <?php
            $sungsan_news_row = $list[$i];

            if (sungsan_is_review_restricted($sungsan_news_row) && !$is_admin) {
                continue;
            }

            $visible_count++;
            $can_read_post = sungsan_can_read_news_post($sungsan_news_row);
            $sungsan_news_post_href = isset($sungsan_news_row['href']) ? $sungsan_news_row['href'] : '#';
            $sungsan_news_post_subject = isset($sungsan_news_row['subject']) ? $sungsan_news_row['subject'] : '';
            $sungsan_news_post_category = isset($sungsan_news_row['ca_name']) ? $sungsan_news_row['ca_name'] : '';
            $sungsan_news_post_date = isset($sungsan_news_row['datetime2']) ? $sungsan_news_row['datetime2'] : '';
            $sungsan_news_post_datetime = isset($sungsan_news_row['datetime']) ? $sungsan_news_row['datetime'] : $sungsan_news_post_date;
            $sungsan_news_post_hits = isset($sungsan_news_row['wr_hit']) ? (int) $sungsan_news_row['wr_hit'] : 0;
            $sungsan_news_is_notice = !empty($sungsan_news_row['is_notice']);
            $group_label = sungsan_get_group_label(isset($sungsan_news_row['wr_1']) ? $sungsan_news_row['wr_1'] : '');
            $visibility = isset($sungsan_news_row['wr_2']) ? $sungsan_news_row['wr_2'] : 'member';
            ?>
            <a class="ss-post-row<?php echo $can_read_post ? '' : ' restricted'; ?>" href="<?php echo get_text($sungsan_news_post_href); ?>">
                <p class="ss-post-title">
                    <?php if ($sungsan_news_is_notice) { ?><span class="ss-badge strong">고정</span><?php } ?>
                    <?php echo get_text($sungsan_news_post_subject); ?>
                </p>
                <div class="ss-meta">
                    <?php if ($sungsan_news_post_category) { ?><span class="ss-badge"><?php echo get_text($sungsan_news_post_category); ?></span><?php } ?>
                    <?php if ($group_label) { ?><span class="ss-badge accent"><?php echo get_text($group_label); ?></span><?php } ?>
                    <span><?php echo get_text(sungsan_get_visibility_label($visibility)); ?></span>
                    <?php if (!$can_read_post) { ?><span class="ss-access-label">권한 확인 필요</span><?php } ?>
                    <time datetime="<?php echo get_text($sungsan_news_post_datetime); ?>"><?php echo get_text($sungsan_news_post_date); ?></time>
                    <span>조회 <?php echo number_format($sungsan_news_post_hits); ?></span>
                </div>
            </a>
        <?php } ?>
        <?php if ($visible_count === 0) { ?>
            <div class="ss-post-row"><p class="ss-post-title">조건에 맞는 글이 없습니다.</p></div>
        <?php } ?>
        </div>

        <?php if ($write_pages) { ?>
            <nav class="ss-pagination" aria-label="페이지 이동"><?php echo $write_pages; ?></nav>
        <?php } ?>
    </div>
</section>
