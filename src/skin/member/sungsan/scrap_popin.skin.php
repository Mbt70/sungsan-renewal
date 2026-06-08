<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

$scrap_popin_subject = isset($write['wr_subject']) ? $write['wr_subject'] : '';
$scrap_popin_board_id = isset($bo_table) ? $bo_table : '';
$scrap_popin_wr_id = isset($wr_id) ? (int) $wr_id : 0;
$scrap_popin_action_url = './scrap_popin_update.php';

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);
?>

<!-- 스크랩 시작 { -->
<div id="scrap_do" class="new_win">
    <h1 id="win_title">스크랩하기</h1>
    <form name="f_scrap_popin" action="<?php echo get_text($scrap_popin_action_url); ?>" method="post">
    <input type="hidden" name="bo_table" value="<?php echo get_text($scrap_popin_board_id); ?>">
    <input type="hidden" name="wr_id" value="<?php echo (int) $scrap_popin_wr_id; ?>">
    <div class="new_win_con">
	    <h2 class="sound_only">제목 확인 및 댓글 쓰기</h2>
	    <ul>
	        <li class="scrap_tit">
	            <span class="sound_only">제목</span>
	            <?php echo get_text(cut_str($scrap_popin_subject, 255)) ?>
	        </li>
	        <li>
	            <label for="wr_content">댓글작성</label>
	            <textarea name="wr_content" id="wr_content" aria-describedby="scrap_comment_help"></textarea>
	        </li>
	    </ul>
	</div>
    <p id="scrap_comment_help" class="win_desc">스크랩을 하시면서 감사 혹은 격려의 댓글을 남기실 수 있습니다.</p>

    <div class="win_btn">
        <button type="submit" class="btn_submit">스크랩 확인</button>
        <button type="button" onclick="window.close();" class="btn_close">창닫기</button>
    </div>
    </form>
</div>
<!-- } 스크랩 끝 -->
