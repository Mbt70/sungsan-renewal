<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);

$scrap_title = isset($g5['title']) ? $g5['title'] : '스크랩';
$scrap_rows = (isset($list) && is_array($list)) ? $list : array();
$scrap_paging_pages = isset($config['cf_write_pages']) ? (int) $config['cf_write_pages'] : 0;
$scrap_paging_page = isset($page) ? (int) $page : 1;
$scrap_paging_total = isset($total_page) ? (int) $total_page : 1;
$scrap_paging_qstr = isset($qstr) ? get_text($qstr) : '';
$scrap_paging_url = '?'.($scrap_paging_qstr !== '' ? $scrap_paging_qstr.'&amp;page=' : 'page=');
?>
<script>
function sungsanOpenScrapLink(link) {
    if (window.opener && !window.opener.closed) {
        try {
            const targetUrl = new URL(link.href, window.location.href);
            if (targetUrl.origin !== window.location.origin) {
                return true;
            }
            window.opener.location.href = targetUrl.href;
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
    <h1 id="win_title"><?php echo get_text($scrap_title); ?></h1>
    <ul>
        <?php for ($i=0; $i<count($scrap_rows); $i++) {
            $scrap_row = $scrap_rows[$i];
            $scrap_post_href = isset($scrap_row['opener_href_wr_id']) ? $scrap_row['opener_href_wr_id'] : '';
            $scrap_subject = isset($scrap_row['subject']) ? $scrap_row['subject'] : '';
            $scrap_board_href = isset($scrap_row['opener_href']) ? $scrap_row['opener_href'] : '';
            $scrap_board_subject = isset($scrap_row['bo_subject']) ? $scrap_row['bo_subject'] : '';
            $scrap_datetime = isset($scrap_row['ms_datetime']) ? $scrap_row['ms_datetime'] : '';
            $scrap_datetime_attr = $scrap_datetime !== '' ? str_replace(' ', 'T', $scrap_datetime) : '';
            $scrap_del_href = isset($scrap_row['del_href']) ? $scrap_row['del_href'] : '';
        ?>
        <li>
            <a href="<?php echo get_text($scrap_post_href); ?>" class="scrap_tit" target="_blank" rel="noopener noreferrer" onclick="return sungsanOpenScrapLink(this);"><?php echo get_text($scrap_subject); ?></a>
            <a href="<?php echo get_text($scrap_board_href); ?>" class="scrap_cate" target="_blank" rel="noopener noreferrer" onclick="return sungsanOpenScrapLink(this);"><?php echo get_text($scrap_board_subject); ?></a>
            <time class="scrap_datetime" datetime="<?php echo get_text($scrap_datetime_attr); ?>"><i class="fa fa-clock-o" aria-hidden="true"></i> <?php echo get_text($scrap_datetime); ?></time>
            <a href="<?php echo get_text($scrap_del_href); ?>" onclick="del(this.href); return false;" class="scrap_del"><i class="fa fa-trash-o" aria-hidden="true"></i> 삭제</a>
        </li>
        <?php }  ?>

        <?php if (count($scrap_rows) === 0) echo "<li class=\"empty_li\">자료가 없습니다.</li>";  ?>
    </ul>
    <?php echo get_paging($scrap_paging_pages, $scrap_paging_page, $scrap_paging_total, $scrap_paging_url); ?>

    <div class="win_btn">
        <button type="button" onclick="window.close();" class="btn_close">창닫기</button>
    </div>
</div>
<!-- } 스크랩 목록 끝 -->
