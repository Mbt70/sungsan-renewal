<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);

$password_lost_url = G5_BBS_URL.'/password_lost.php';
$register_url = G5_BBS_URL.'/register.php';
?>

<div id="mb_login" class="mbskin ss-login">
    <div class="mbskin_box">
        <header class="ss-login-header">
            <h1>성산회 회원 로그인</h1>
            <p class="ss-login-note">회원 전용 소식과 자유게시판은 로그인 후 이용할 수 있습니다.</p>
        </header>

        <form name="flogin" action="<?php echo get_text($login_action_url); ?>" onsubmit="return flogin_submit(this);" method="post">
            <input type="hidden" name="url" value="<?php echo get_text($login_url); ?>">

            <fieldset id="login_fs">
                <legend>회원 로그인</legend>

                <label for="login_id">아이디 <strong>필수</strong></label>
                <input type="text" name="mb_id" id="login_id" required class="frm_input required" size="20" maxlength="20" placeholder="아이디" autocomplete="username">

                <label for="login_pw">비밀번호 <strong>필수</strong></label>
                <input type="password" name="mb_password" id="login_pw" required class="frm_input required" size="20" maxlength="20" placeholder="비밀번호" autocomplete="current-password">

                <button type="submit" class="btn_submit">로그인</button>

                <div id="login_info">
                    <div class="login_if_auto chk_box">
                        <input type="checkbox" name="auto_login" id="login_auto_login" class="selec_chk">
                        <label for="login_auto_login"><span></span> 자동로그인</label>
                    </div>
                    <div class="login_if_lpl">
                        <a href="<?php echo get_text($password_lost_url); ?>">아이디/비밀번호 찾기</a>
                    </div>
                </div>
            </fieldset>
        </form>

        <div class="ss-login-links">
            <p>아직 성산회 홈페이지 계정이 없다면 가입 신청 후 운영자 승인을 받아 이용합니다.</p>
            <a href="<?php echo get_text($register_url); ?>" class="join">회원가입</a>
        </div>

        <?php @include_once(get_social_skin_path().'/social_login.skin.php'); ?>
    </div>
</div>

<script>
jQuery(function($) {
    $("#login_auto_login").click(function() {
        if (this.checked) {
            this.checked = confirm("자동로그인을 사용하면 다음부터 아이디와 비밀번호를 다시 입력하지 않습니다.\n\n공공장소에서는 개인정보가 노출될 수 있으니 사용을 자제해 주십시오.\n\n자동로그인을 사용하시겠습니까?");
        }
    });
});

function flogin_submit(f)
{
    if ($(document.body).triggerHandler('login_sumit', [f, 'flogin']) !== false) {
        return true;
    }

    return false;
}
</script>
