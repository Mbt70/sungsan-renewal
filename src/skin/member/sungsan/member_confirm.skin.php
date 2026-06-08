<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);

$member_confirm_mb_id = isset($member['mb_id']) ? $member['mb_id'] : '';
$member_confirm_raw_url = isset($url) ? trim((string) $url) : '';
$member_confirm_action_url = preg_match('/^\/?\w[\w\.\/-]*$/', $member_confirm_raw_url) ? $member_confirm_raw_url : 'register_form.php';
$member_confirm_is_leave = $member_confirm_action_url === 'member_leave.php';
?>

<!-- 회원 비밀번호 확인 시작 { -->
<div id="mb_confirm" class="mbskin">
    <h1><?php echo get_text($g5['title']); ?></h1>

    <p id="member_confirm_help">
        <strong>비밀번호를 한번 더 입력해주세요.</strong>
        <?php if ($member_confirm_is_leave) { ?>
        비밀번호를 입력하시면 회원탈퇴가 완료됩니다.
        <?php }else{ ?>
        회원님의 정보를 안전하게 보호하기 위해 비밀번호를 한번 더 확인합니다.
        <?php }  ?>
    </p>

    <form name="fmemberconfirm" action="<?php echo get_text($member_confirm_action_url); ?>" onsubmit="return fmemberconfirm_submit(this);" method="post">
    <input type="hidden" name="mb_id" value="<?php echo get_text($member_confirm_mb_id); ?>">
    <input type="hidden" name="w" value="u">

    <fieldset>
        <span class="confirm_id">회원아이디</span>
        <span id="mb_confirm_id"><?php echo get_text($member_confirm_mb_id); ?></span>
        <label for="confirm_mb_password">비밀번호 <strong>필수</strong></label>
        <input type="password" name="mb_password" id="confirm_mb_password" required class="required frm_input" size="15" maxLength="20" aria-describedby="member_confirm_help">
        <input type="submit" value="확인" id="btn_submit" class="btn_submit">
    </fieldset>

    </form>

</div>

<script>
function fmemberconfirm_submit(f)
{
    document.getElementById("btn_submit").disabled = true;

    return true;
}
</script>
<!-- } 회원 비밀번호 확인 끝 -->
