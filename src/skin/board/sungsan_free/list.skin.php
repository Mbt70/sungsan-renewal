<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $is_member;
?>
<section class="ss-section">
    <div class="ss-container">
        <div class="ss-section-header">
            <h1 class="ss-section-title"><?php echo get_text($board['bo_subject']); ?></h1>
            <?php if ($write_href) { ?><a class="ss-button" href="<?php echo get_text($write_href); ?>">글쓰기</a><?php } ?>
        </div>

        <form class="ss-search-form ss-board-search" method="get" action="<?php echo get_text($_SERVER['SCRIPT_NAME']); ?>">
            <input type="hidden" name="bo_table" value="<?php echo get_text($bo_table); ?>">
            <input type="hidden" name="sop" value="and">
            <input type="hidden" name="sfl" value="wr_subject||wr_content">
            <label for="free_board_stx">검색어</label>
            <div class="ss-search-row">
                <input id="free_board_stx" name="stx" value="<?php echo get_text(stripslashes($stx)); ?>" placeholder="제목과 내용을 검색">
                <button type="submit">검색</button>
            </div>
        </form>

        <div class="ss-post-list">
        <?php for ($i = 0; $i < count($list); $i++) { ?>
            <?php
            $sungsan_post_href = $is_member ? $list[$i]['href'] : G5_BBS_URL.'/login.php?url='.urlencode(htmlspecialchars_decode($list[$i]['href'], ENT_QUOTES));
            ?>
            <a class="ss-post-row<?php echo $is_member ? '' : ' restricted'; ?>" href="<?php echo get_text($sungsan_post_href); ?>">
                <p class="ss-post-title"><?php echo get_text($list[$i]['subject']); ?></p>
                <div class="ss-meta">
                    <span><?php echo get_text($list[$i]['wr_name']); ?></span>
                    <span class="ss-access-label">회원 열람</span>
                    <span><?php echo get_text($list[$i]['datetime2']); ?></span>
                    <span>조회 <?php echo number_format((int) $list[$i]['wr_hit']); ?></span>
                </div>
            </a>
        <?php } ?>
        <?php if (count($list) === 0) { ?><div class="ss-post-row"><p class="ss-post-title">등록된 글이 없습니다.</p></div><?php } ?>
        </div>
        <?php if ($write_pages) { ?><nav class="ss-pagination" aria-label="페이지 이동"><?php echo $write_pages; ?></nav><?php } ?>
    </div>
</section>
