<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $is_member;

$sungsan_free_search_action = isset($_SERVER['SCRIPT_NAME']) ? $_SERVER['SCRIPT_NAME'] : '';
$sungsan_free_search_term = isset($stx) ? stripslashes($stx) : '';
?>
<section class="ss-section">
    <div class="ss-container">
        <div class="ss-section-header">
            <h1 class="ss-section-title"><?php echo get_text($board['bo_subject']); ?></h1>
            <?php if ($write_href) { ?><a class="ss-button" href="<?php echo get_text($write_href); ?>">글쓰기</a><?php } ?>
        </div>

        <form class="ss-search-form ss-board-search" method="get" action="<?php echo get_text($sungsan_free_search_action); ?>">
            <input type="hidden" name="bo_table" value="<?php echo get_text($bo_table); ?>">
            <input type="hidden" name="sop" value="and">
            <input type="hidden" name="sfl" value="wr_subject||wr_content">
            <label for="free_board_stx">제목과 내용 검색어</label>
            <div class="ss-search-row">
                <input id="free_board_stx" name="stx" type="search" value="<?php echo get_text($sungsan_free_search_term); ?>" enterkeyhint="search">
                <button type="submit">검색</button>
            </div>
        </form>

        <div class="ss-post-list">
        <?php for ($i = 0; $i < count($list); $i++) { ?>
            <?php
            $sungsan_free_row = $list[$i];
            $sungsan_free_post_href = isset($sungsan_free_row['href']) ? $sungsan_free_row['href'] : '#';
            $sungsan_free_post_subject = isset($sungsan_free_row['subject']) ? $sungsan_free_row['subject'] : '';
            $sungsan_free_post_writer = isset($sungsan_free_row['wr_name']) ? $sungsan_free_row['wr_name'] : '';
            $sungsan_free_post_date = isset($sungsan_free_row['datetime2']) ? $sungsan_free_row['datetime2'] : '';
            $sungsan_free_post_datetime = isset($sungsan_free_row['datetime']) ? $sungsan_free_row['datetime'] : $sungsan_free_post_date;
            $sungsan_free_post_hits = isset($sungsan_free_row['wr_hit']) ? (int) $sungsan_free_row['wr_hit'] : 0;
            $sungsan_post_href = $is_member ? $sungsan_free_post_href : sungsan_login_url($sungsan_free_post_href);
            ?>
            <a class="ss-post-row<?php echo $is_member ? '' : ' restricted'; ?>" href="<?php echo get_text($sungsan_post_href); ?>">
                <p class="ss-post-title"><?php echo get_text($sungsan_free_post_subject); ?></p>
                <div class="ss-meta">
                    <span><?php echo get_text($sungsan_free_post_writer); ?></span>
                    <span class="ss-access-label">회원 열람</span>
                    <time datetime="<?php echo get_text($sungsan_free_post_datetime); ?>"><?php echo get_text($sungsan_free_post_date); ?></time>
                    <span>조회 <?php echo number_format($sungsan_free_post_hits); ?></span>
                </div>
            </a>
        <?php } ?>
        <?php if (count($list) === 0) { ?><div class="ss-post-row"><p class="ss-post-title">등록된 글이 없습니다.</p></div><?php } ?>
        </div>
        <?php if ($write_pages) { ?><nav class="ss-pagination" aria-label="페이지 이동"><?php echo $write_pages; ?></nav><?php } ?>
    </div>
</section>
