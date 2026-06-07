<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);

$sungsan_register_cancel_url = G5_URL;
$sungsan_register_stipulation = isset($config['cf_stipulation']) ? $config['cf_stipulation'] : '';
$sungsan_register_cert_enabled = !empty($config['cf_cert_use']);
?>

<!-- 회원가입약관 동의 시작 { -->
<div class="register">

    <form  name="fregister" id="fregister" action="<?php echo get_text($register_action_url); ?>" onsubmit="return fregister_submit(this);" method="POST" autocomplete="off">

    <p><i class="fa fa-check-circle" aria-hidden="true"></i> 회원가입약관 및 개인정보 수집 및 이용의 내용에 동의하셔야 회원가입 하실 수 있습니다.</p>
    
    <?php
    // 소셜로그인 사용시 소셜로그인 버튼
    @include_once(get_social_skin_path().'/social_register.skin.php');
    ?>
    <section id="fregister_term">
        <h2>(필수) 회원가입약관</h2>
        <textarea readonly><?php echo get_text($sungsan_register_stipulation); ?></textarea>
        <fieldset class="fregister_agree">
            <input type="checkbox" name="agree" value="1" id="agree11" class="selec_chk">
            <label for="agree11"><span></span><b class="sound_only">회원가입약관의 내용에 동의합니다.</b></label>
        </fieldset>
    </section>

    <section id="fregister_private" class="fregister_terms">
        <h2>(필수) 개인정보 수집 및 이용</h2>
        <div>
            <table>
                <caption>개인정보 수집 및 이용</caption>
                <thead>
                <tr>
                    <th scope="col">목적</th>
                    <th scope="col">항목</th>
                    <th scope="col">보유기간</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>이용자 식별 및 본인여부 확인</td>
                    <td>아이디, 이름, 비밀번호<?php echo ($sungsan_register_cert_enabled) ? ", 생년월일, 휴대폰 번호(본인인증 할 때만, 아이핀 제외), 암호화된 개인식별부호(CI)" : ""; ?></td>
                    <td>회원 탈퇴 시까지</td>
                </tr>
                <tr>
                    <td>회원 관리와 회 운영 안내,<br>문의 대응을 위한 이용자 식별</td>
                    <td>연락처 (이메일, 휴대전화번호)</td>
                    <td>회원 탈퇴 시까지</td>
                </tr>
                </tbody>
            </table>
        </div>

        <fieldset class="fregister_agree">
            <input type="checkbox" name="agree2" value="1" id="agree21" class="selec_chk">
            <label for="agree21"><span></span><b class="sound_only">개인정보 수집 및 이용의 내용에 동의합니다.</b></label>
       </fieldset>
    </section>
	
	<div id="fregister_chkall" class="chk_all fregister_agree">
        <input type="checkbox" name="chk_all" id="chk_all" class="selec_chk">
        <label for="chk_all"><span></span>회원가입 약관에 모두 동의합니다</label>
    </div>
	    
    <div class="btn_confirm">
        <a href="<?php echo get_text($sungsan_register_cancel_url); ?>" class="btn_close">취소</a>
        <button type="submit" class="btn_submit">회원가입</button>
    </div>

    </form>

    <script>
    function fregister_submit(f)
    {
        if (!f.agree.checked) {
            alert("회원가입약관의 내용에 동의하셔야 회원가입 하실 수 있습니다.");
            f.agree.focus();
            return false;
        }

        if (!f.agree2.checked) {
            alert("개인정보 수집 및 이용의 내용에 동의하셔야 회원가입 하실 수 있습니다.");
            f.agree2.focus();
            return false;
        }

        return true;
    }
    
    jQuery(function($){
        // 모두선택
        $("input[name=chk_all]").click(function() {
            if ($(this).prop('checked')) {
                $("input[name^=agree]").prop('checked', true);
            } else {
                $("input[name^=agree]").prop("checked", false);
            }
        });
    });

    </script>
</div>
<!-- } 회원가입 약관 동의 끝 -->
