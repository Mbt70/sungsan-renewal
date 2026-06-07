<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);

$sungsan_register_home_url = G5_URL;
$register_result_mb_name = isset($mb['mb_name']) ? $mb['mb_name'] : '';
$register_result_mb_id = isset($mb['mb_id']) ? $mb['mb_id'] : '';
$register_result_mb_email = isset($mb['mb_email']) ? $mb['mb_email'] : '';
?>

<!-- 회원가입결과 시작 { -->
<div id="reg_result" class="register ss-register-result">
    <div class="mbskin_box">
        <h1>가입 신청이 접수되었습니다</h1>
        <p class="reg_result_p">
            <strong><?php echo get_text($register_result_mb_name); ?></strong>님의 성산회 홈페이지 가입 신청이 접수되었습니다.
        </p>
        <p class="result_txt">
            운영자 승인 후 회원 전용 게시판과 소식 자료를 이용할 수 있습니다. 승인 전까지는 일부 게시판 열람과 작성이 제한됩니다.
        </p>

        <?php if (is_use_email_certify()) {  ?>
        <p class="result_txt">
            가입 시 입력하신 이메일 주소로 인증 메일이 발송되었습니다. 메일 인증을 마친 뒤 운영자 승인을 기다려 주세요.
        </p>
        <div id="result_email">
            <span>아이디</span>
            <strong><?php echo get_text($register_result_mb_id); ?></strong><br>
            <span>이메일 주소</span>
            <strong><?php echo get_text($register_result_mb_email); ?></strong>
        </div>
        <p class="result_txt">
            이메일 주소를 잘못 입력하셨다면 사이트 관리자에게 문의해 주세요.
        </p>
        <?php }  ?>

        <p class="result_txt">
            비밀번호는 암호화되어 저장됩니다. 아이디나 비밀번호를 잊은 경우 가입 시 입력한 이메일 주소로 찾을 수 있습니다.
        </p>

        <div class="btn_confirm_reg">
            <a href="<?php echo get_text($sungsan_register_home_url); ?>" class="btn_submit">메인으로</a>
        </div>
    </div>
</div>
<!-- } 회원가입결과 끝 -->
