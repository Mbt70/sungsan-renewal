<?php
if (!defined('_GNUBOARD_')) {
    exit;
}
?>
<section class="ss-section">
    <div class="ss-container">
        <div class="ss-section-header">
            <h1 class="ss-section-title"><?php echo get_text($board['bo_subject']); ?></h1>
            <?php if ($write_href) { ?><a class="ss-button" href="<?php echo $write_href; ?>">글쓰기</a><?php } ?>
        </div>

        <form class="ss-search-form ss-board-search" method="get" action="<?php echo $_SERVER['SCRIPT_NAME']; ?>">
            <input type="hidden" name="bo_table" value="<?php echo $bo_table; ?>">
            <input type="hidden" name="sop" value="and">
            <input type="hidden" name="sfl" value="wr_subject||wr_content">
            <label class="sound_only" for="free_board_stx">자유게시판 검색어</label>
            <input id="free_board_stx" name="stx" value="<?php echo get_text(stripslashes($stx)); ?>" placeholder="제목과 내용을 검색">
            <button type="submit">검색</button>
        </form>

        <div class="ss-post-list">
        <?php for ($i = 0; $i < count($list); $i++) { ?>
            <a class="ss-post-row" href="<?php echo $list[$i]['href']; ?>">
                <p class="ss-post-title"><?php echo $list[$i]['subject']; ?></p>
                <div class="ss-meta">
                    <span><?php echo $list[$i]['name']; ?></span>
                    <span><?php echo $list[$i]['datetime2']; ?></span>
                    <span>조회 <?php echo number_format($list[$i]['wr_hit']); ?></span>
                </div>
            </a>
        <?php } ?>
        <?php if (count($list) === 0) { ?><div class="ss-post-row"><p class="ss-post-title">등록된 글이 없습니다.</p></div><?php } ?>
        </div>
        <?php if ($write_pages) { ?><nav class="ss-pagination" aria-label="페이지 이동"><?php echo $write_pages; ?></nav><?php } ?>
    </div>
</section>
