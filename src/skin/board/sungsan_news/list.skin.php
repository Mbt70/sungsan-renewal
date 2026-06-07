<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $sungsan_news_categories;

$current_category = isset($sca) ? $sca : '';
?>
<section class="ss-section">
    <div class="ss-container">
        <div class="ss-section-header">
            <h1 class="ss-section-title"><?php echo get_text($board['bo_subject']); ?></h1>
            <?php if ($write_href) { ?>
                <a class="ss-button" href="<?php echo $write_href; ?>">글쓰기</a>
            <?php } ?>
        </div>

        <div class="ss-filter-bar" aria-label="소식 종류">
            <a class="ss-chip<?php echo sungsan_active_class($current_category, ''); ?>" href="<?php echo G5_BBS_URL; ?>/board.php?bo_table=<?php echo $bo_table; ?>">전체</a>
            <?php foreach ($sungsan_news_categories as $category) { ?>
                <a class="ss-chip<?php echo sungsan_active_class($current_category, $category); ?>" href="<?php echo G5_BBS_URL; ?>/board.php?bo_table=<?php echo $bo_table; ?>&amp;sca=<?php echo urlencode($category); ?>"><?php echo $category; ?></a>
            <?php } ?>
        </div>

        <form class="ss-search-form" method="get" action="<?php echo $_SERVER['SCRIPT_NAME']; ?>" style="margin-bottom:24px">
            <input type="hidden" name="bo_table" value="<?php echo $bo_table; ?>">
            <input type="hidden" name="sca" value="<?php echo get_text($sca); ?>">
            <input type="hidden" name="sop" value="and">
            <input type="hidden" name="sfl" value="wr_subject||wr_content">
            <label class="sound_only" for="board_stx">게시판 검색어</label>
            <input id="board_stx" name="stx" value="<?php echo stripslashes($stx); ?>" placeholder="제목과 내용을 검색">
            <button type="submit">검색</button>
        </form>

        <div class="ss-post-list">
        <?php for ($i = 0; $i < count($list); $i++) { ?>
            <?php
            $group_label = sungsan_get_group_label(isset($list[$i]['wr_1']) ? $list[$i]['wr_1'] : '');
            $visibility = isset($list[$i]['wr_2']) ? $list[$i]['wr_2'] : 'member';
            ?>
            <a class="ss-post-row" href="<?php echo $list[$i]['href']; ?>">
                <p class="ss-post-title">
                    <?php if ($list[$i]['is_notice']) { ?>📌 <?php } ?>
                    <?php echo $list[$i]['subject']; ?>
                </p>
                <div class="ss-meta">
                    <?php if ($list[$i]['ca_name']) { ?><span class="ss-badge"><?php echo get_text($list[$i]['ca_name']); ?></span><?php } ?>
                    <?php if ($group_label) { ?><span class="ss-badge accent"><?php echo get_text($group_label); ?></span><?php } ?>
                    <span><?php echo sungsan_get_visibility_label($visibility); ?></span>
                    <span><?php echo $list[$i]['datetime2']; ?></span>
                    <span>조회 <?php echo number_format($list[$i]['wr_hit']); ?></span>
                </div>
            </a>
        <?php } ?>
        <?php if (count($list) === 0) { ?>
            <div class="ss-post-row"><p class="ss-post-title">조건에 맞는 글이 없습니다.</p></div>
        <?php } ?>
        </div>

        <?php if ($write_pages) { ?>
            <nav class="ss-section" aria-label="페이지 이동"><?php echo $write_pages; ?></nav>
        <?php } ?>
    </div>
</section>

