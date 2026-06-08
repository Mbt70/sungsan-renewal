<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);
?>
<script>
function sungsanOpenScrapLink(link) {
    if (window.opener && !window.opener.closed) {
        try {
            window.opener.location.href = link.href;
            return false;
        } catch (e) {
            return true;
        }
    }

    return true;
}
</script>

<!-- 스크랩 목록 시작 { -->
<div id="scrap" class="new_win">
    <h1 id="win_title"><?php echo get_text($g5['title']); ?></h1>
    <ul>
        <?php for ($i=0; $i<count($list); $i++) {
            $scrap_row = isset($list[$i]) ? $list[$i] : array();
            $scrap_post_href = isset($scrap_row['opener_href_wr_id']) ? $scrap_row['opener_href_wr_id'] : '';
            $scrap_subject = isset($scrap_row['subject']) ? $scrap_row['subject'] : '';
            $scrap_board_href = isset($scrap_row['opener_href']) ? $scrap_row['opener_href'] : '';
            $scrap_board_subject = isset($scrap_row['bo_subject']) ? $scrap_row['bo_subject'] : '';
            $scrap_datetime = isset($scrap_row['ms_datetime']) ? $scrap_row['ms_datetime'] : '';
            $scrap_del_href = isset($scrap_row['del_href']) ? $scrap_row['del_href'] : '';
        ?>
        <li>
            <a href="<?php echo get_text($scrap_post_href); ?>" class="scrap_tit" target="_blank" rel="noopener noreferrer" onclick="return sungsanOpenScrapLink(this);"><?php echo get_text($scrap_subject); ?></a>
            <a href="<?php echo get_text($scrap_board_href); ?>" class="scrap_cate" target="_blank" rel="noopener noreferrer" onclick="return sungsanOpenScrapLink(this);"><?php echo get_text($scrap_board_subject); ?></a>
            <span class="scrap_datetime"><i class="fa fa-clock-o" aria-hidden="true"></i> <?php echo get_text($scrap_datetime); ?></span>
            <a href="<?php echo get_text($scrap_del_href); ?>" onclick="del(this.href); return false;" class="scrap_del"><i class="fa fa-trash-o" aria-hidden="true"></i> 삭제</a>
        </li>
        <?php }  ?>

        <?php if ($i == 0) echo "<li class=\"empty_li\">자료가 없습니다.</li>";  ?>
    </ul>
    <?php echo get_paging($config['cf_write_pages'], $page, $total_page, "?$qstr&amp;page="); ?>

    <div class="win_btn">
        <button type="button" onclick="window.close();" class="btn_close">창닫기</button>
    </div>
</div>
<!-- } 스크랩 목록 끝 -->
