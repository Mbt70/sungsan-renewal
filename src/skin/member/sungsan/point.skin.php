<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);

$member_point = isset($member['mb_point']) ? (int) $member['mb_point'] : 0;
$point_paging_pages = G5_IS_MOBILE ? (int) $config['cf_mobile_pages'] : (int) $config['cf_write_pages'];
$point_paging_page = isset($page) ? (int) $page : 1;
$point_paging_total = isset($total_page) ? (int) $total_page : 1;
$point_paging_script = isset($_SERVER['SCRIPT_NAME']) ? get_text($_SERVER['SCRIPT_NAME']) : '';
$point_paging_query = isset($qstr) && $qstr !== '' ? $qstr.'&amp;page=' : 'page=';
$point_paging_url = $point_paging_script.'?'.$point_paging_query;
?>

<div id="point" class="new_win">
    <h1 id="win_title"><?php echo get_text($g5['title']); ?></h1>

    <div class="new_win_con2">
        <ul class="point_all">
        	<li class="full_li">
        		보유포인트
        		<span><?php echo number_format($member_point); ?></span>
        	</li>
		</ul>
        <ul class="point_list">
            <?php
            $sum_point1 = $sum_point2 = $sum_point3 = 0;
            
            $i = 0;
            foreach((array) $list as $row){
                $point1 = $point2 = 0;
                $point_use_class = '';
                $row_point = isset($row['po_point']) ? (int) $row['po_point'] : 0;
                $row_content = isset($row['po_content']) ? $row['po_content'] : '';
                $row_expired = isset($row['po_expired']) ? (int) $row['po_expired'] : 0;
                $row_datetime = isset($row['po_datetime']) ? $row['po_datetime'] : '';
                $row_expire_date = isset($row['po_expire_date']) ? $row['po_expire_date'] : '';
                if ($row_point > 0) {
                    $point1 = '+' .number_format($row_point);
                    $sum_point1 += $row_point;
                } else {
                    $point2 = number_format($row_point);
                    $sum_point2 += $row_point;
                    $point_use_class = 'point_use';
                }
                $point_value = $point1 ?: $point2;

                $po_content = $row_content;

                $expr = '';
                if($row_expired == 1)
                    $expr = ' txt_expired';
            ?>
            <li class="<?php echo $point_use_class; ?>">
                <div class="point_top">
                    <span class="point_tit"><?php echo get_text($po_content); ?></span>
                    <span class="point_num"><?php echo get_text($point_value); ?></span>
                </div>
                <span class="point_date1"><i class="fa fa-clock-o" aria-hidden="true"></i> <?php echo get_text($row_datetime); ?></span>
                <span class="point_date<?php echo $expr; ?>">
                    <?php if ($row_expired == 1) { ?>
                    만료 <?php echo get_text(substr(str_replace('-', '', $row_expire_date), 2)); ?>
                    <?php } else echo $row_expire_date == '9999-12-31' ? '&nbsp;' : get_text($row_expire_date); ?>
                </span>
            </li>
            <?php
                $i++;
            }   // end foreach

            if ($i == 0)
                echo '<li class="empty_li">자료가 없습니다.</li>';
            else {
                if ($sum_point1 > 0)
                    $sum_point1 = "+" . number_format($sum_point1);
                $sum_point2 = number_format($sum_point2);
            }
            ?>

            <li class="point_status">
                소계
                <span><?php echo get_text($sum_point1); ?></span>
                <span><?php echo get_text($sum_point2); ?></span>
            </li>
        </ul>
    </div>

    <?php echo get_paging($point_paging_pages, $point_paging_page, $point_paging_total, $point_paging_url); ?>

    <button type="button" onclick="javascript:window.close();" class="btn_close">창닫기</button>
</div>
