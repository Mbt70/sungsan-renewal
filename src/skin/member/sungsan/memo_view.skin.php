<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가
$memo_sender_id = isset($mb['mb_id']) ? $mb['mb_id'] : '';
$memo_sender_nick = isset($mb['mb_nick']) ? $mb['mb_nick'] : '';
$memo_sender_email = isset($mb['mb_email']) ? $mb['mb_email'] : '';
$memo_sender_homepage = isset($mb['mb_homepage']) ? $mb['mb_homepage'] : '';
$memo_sent_at = isset($memo['me_send_datetime']) ? $memo['me_send_datetime'] : '';
$memo_sent_at_attr = $memo_sent_at !== '' ? str_replace(' ', 'T', $memo_sent_at) : '';
$memo_body = isset($memo['me_memo']) ? $memo['me_memo'] : '';
$memo_id = isset($memo['me_id']) ? (int) $memo['me_id'] : 0;
$memo_current_kind = (isset($kind) && $kind === 'send') ? 'send' : 'recv';
$memo_list_href = isset($list_link) ? $list_link : './memo.php?kind='.$memo_current_kind;
$memo_delete_href = isset($del_link) ? $del_link : '';
$memo_prev_href = isset($prev_link) ? $prev_link : '';
$memo_next_href = isset($next_link) ? $next_link : '';
$memo_reply_href = './memo_form.php?me_recv_mb_id='.urlencode($memo_sender_id).'&amp;me_id='.$memo_id;
$memo_sender_sideview = get_sideview(get_text($memo_sender_id), get_text($memo_sender_nick), get_text($memo_sender_email), get_text($memo_sender_homepage));
if($memo_current_kind == "recv") {
    $kind_str = "보낸";
    $kind_date = "받은";
}
else {
    $kind_str = "받는";
    $kind_date = "보낸";
}

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);
?>

<!-- 쪽지보기 시작 { -->
<div id="memo_view" class="new_win">
    <h1 id="win_title"><?php echo get_text($g5['title']); ?></h1>
    <div class="new_win_con2">
        <!-- 쪽지함 선택 시작 { -->
        <ul class="win_ul">
            <li class="<?php if ($memo_current_kind == 'recv') {  ?>selected<?php }  ?>"><a href="./memo.php?kind=recv">받은쪽지</a></li>
            <li class="<?php if ($memo_current_kind == 'send') {  ?>selected<?php }  ?>"><a href="./memo.php?kind=send">보낸쪽지</a></li>
            <li><a href="./memo_form.php">쪽지쓰기</a></li>
        </ul>
        <!-- } 쪽지함 선택 끝 -->

        <article id="memo_view_contents">
            <header>
                <h2>쪽지 내용</h2>
            </header>
            <div id="memo_view_ul">
                <div class="memo_view_li memo_view_name">
                	<ul class="memo_from">
						<li class="memo_profile">
				            <?php echo get_member_profile_img($memo_sender_id); ?>
				        </li>
						<li class="memo_view_nick"><?php echo $memo_sender_sideview; ?></li>
						<li class="memo_view_date"><span class="sound_only"><?php echo get_text($kind_date); ?>시간</span><time datetime="<?php echo get_text($memo_sent_at_attr); ?>"><i class="fa fa-clock-o" aria-hidden="true"></i> <?php echo get_text($memo_sent_at); ?></time></li>
						<li class="memo_op_btn list_btn"><a href="<?php echo get_text($memo_list_href); ?>" class="btn_b01 btn"><i class="fa fa-list" aria-hidden="true"></i> 목록</a></li>
						<li class="memo_op_btn del_btn"><a href="<?php echo get_text($memo_delete_href); ?>" onclick="del(this.href); return false;" class="memo_del btn_b01 btn"><i class="fa fa-trash-o" aria-hidden="true"></i> 삭제</a></li>
					</ul>
                    <div class="memo_btn">
                        <?php if($memo_prev_href !== '') {  ?>
                        <a href="<?php echo get_text($memo_prev_href); ?>" class="btn_left"><i class="fa fa-chevron-left" aria-hidden="true"></i> 이전쪽지</a>
                        <?php }  ?>
                        <?php if($memo_next_href !== '') {  ?>
                        <a href="<?php echo get_text($memo_next_href); ?>" class="btn_right">다음쪽지 <i class="fa fa-chevron-right" aria-hidden="true"></i></a>
                        <?php }  ?>
                    </div>
                </div>
            </div>
            <p>
                <?php echo conv_content($memo_body, 0) ?>
            </p>
        </article>
		<div class="win_btn">
			<?php if ($memo_current_kind == 'recv') {  ?><a href="<?php echo get_text($memo_reply_href); ?>" class="reply_btn">답장</a><?php }  ?>
			<button type="button" onclick="window.close();" class="btn_close">창닫기</button>
    	</div>
    </div>
</div>
<!-- } 쪽지보기 끝 -->
