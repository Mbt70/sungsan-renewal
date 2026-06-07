<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);
add_javascript('<script src="'.G5_JS_URL.'/jquery.register_form.js"></script>', 0);
if ($config['cf_cert_use'] && ($config['cf_cert_simple'] || $config['cf_cert_ipin'] || $config['cf_cert_hp']))
    add_javascript('<script src="'.G5_JS_URL.'/certify.js?v='.G5_JS_VER.'"></script>', 0);

$sungsan_member_raw = function ($field, $default = '') use ($member) {
    return isset($member[$field]) ? $member[$field] : $default;
};
$sungsan_member_value = function ($field, $default = '') use ($sungsan_member_raw) {
    return get_text($sungsan_member_raw($field, $default));
};
$sungsan_member_zip = $sungsan_member_value('mb_zip1').$sungsan_member_value('mb_zip2');
$sungsan_member_certify = $sungsan_member_raw('mb_certify');
$sungsan_member_adult = (int) $sungsan_member_raw('mb_adult', 0);
$sungsan_cancel_url = $w == 'u' ? G5_URL.'/sungsan/mypage.php' : G5_URL;
$sungsan_submit_label = $w == '' ? '가입 신청' : '저장';
$sungsan_form_title = $w == 'u' ? '내 정보 수정' : '가입 정보 입력';
?>

<!-- 회원정보 입력/수정 시작 { -->

<div class="register">
	<form id="fregisterform" name="fregisterform" action="<?php echo get_text($register_action_url); ?>" onsubmit="return fregisterform_submit(this);" method="post" enctype="multipart/form-data" autocomplete="off">
	<h1><?php echo get_text($sungsan_form_title); ?></h1>
	<input type="hidden" name="w" value="<?php echo get_text($w); ?>">
	<input type="hidden" name="url" value="<?php echo get_text($urlencode); ?>">
	<input type="hidden" name="agree" value="<?php echo get_text($agree); ?>">
	<input type="hidden" name="agree2" value="<?php echo get_text($agree2); ?>">
	<input type="hidden" name="cert_type" value="<?php echo $sungsan_member_value('mb_certify'); ?>">
	<input type="hidden" name="cert_no" value="">
	<?php if (isset($member['mb_sex'])) {  ?><input type="hidden" name="mb_sex" value="<?php echo $sungsan_member_value('mb_sex'); ?>"><?php }  ?>
	<?php if (isset($member['mb_nick_date']) && $member['mb_nick_date'] > date("Y-m-d", G5_SERVER_TIME - ($config['cf_nick_modify'] * 86400))) { // 닉네임수정일이 지나지 않았다면  ?>
	<input type="hidden" name="mb_nick_default" value="<?php echo $sungsan_member_value('mb_nick'); ?>">
	<input type="hidden" name="mb_nick" value="<?php echo $sungsan_member_value('mb_nick'); ?>">
	<?php }  ?>
	<div class="ss-register-compat-fields" hidden>
		<input type="hidden" name="mb_homepage" value="<?php echo $sungsan_member_value('mb_homepage'); ?>">
		<input type="hidden" name="mb_tel" value="<?php echo $sungsan_member_value('mb_tel'); ?>">
		<input type="hidden" name="mb_zip" value="<?php echo $sungsan_member_zip; ?>">
		<input type="hidden" name="mb_addr1" value="<?php echo $sungsan_member_value('mb_addr1'); ?>">
		<input type="hidden" name="mb_addr2" value="<?php echo $sungsan_member_value('mb_addr2'); ?>">
		<input type="hidden" name="mb_addr3" value="<?php echo $sungsan_member_value('mb_addr3'); ?>">
		<input type="hidden" name="mb_addr_jibeon" value="<?php echo $sungsan_member_value('mb_addr_jibeon'); ?>">
		<textarea name="mb_signature" hidden><?php echo $sungsan_member_value('mb_signature'); ?></textarea>
		<textarea name="mb_profile" hidden><?php echo $sungsan_member_value('mb_profile'); ?></textarea>
		<input type="hidden" name="mb_open_default" value="<?php echo $sungsan_member_value('mb_open'); ?>">
		<input type="hidden" name="mb_open" value="<?php echo $sungsan_member_value('mb_open'); ?>">
		<input type="hidden" name="mb_recommend" value="">
	</div>
	
	<div id="register_form" class="form_01">   
	    <div class="register_form_inner">
	        <h2>사이트 이용정보 입력</h2>
	        <ul>
	            <li>
	                <label for="reg_mb_id">
	                    아이디 (필수)
	                    <button type="button" class="tooltip_icon"><i class="fa fa-question-circle-o" aria-hidden="true"></i><span class="sound_only">설명보기</span></button>
	                    <span class="tooltip">영문자, 숫자, _ 만 입력 가능. 최소 3자이상 입력하세요.</span>
	                </label>
	                <input type="text" name="mb_id" value="<?php echo $sungsan_member_value('mb_id'); ?>" id="reg_mb_id" <?php echo $required ?> <?php echo $readonly ?> class="frm_input full_input <?php echo $required ?> <?php echo $readonly ?>" minlength="3" maxlength="20" placeholder="아이디">
	                <span id="msg_mb_id"></span>
	            </li>
	            <li class="half_input left_input margin_input">
	                <label for="reg_mb_password">비밀번호 (필수)</label>
	                <input type="password" name="mb_password" id="reg_mb_password" <?php echo $required ?> class="frm_input full_input <?php echo $required ?>" minlength="3" maxlength="20" placeholder="비밀번호">
	            </li>
	            <li class="half_input left_input">
	                <label for="reg_mb_password_re">비밀번호 확인 (필수)</label>
	                <input type="password" name="mb_password_re" id="reg_mb_password_re" <?php echo $required ?> class="frm_input full_input <?php echo $required ?>" minlength="3" maxlength="20" placeholder="비밀번호 확인">
	            </li>
	        </ul>
	    </div>
	
	    <div class="tbl_frm01 tbl_wrap register_form_inner">
	        <h2>개인정보 입력</h2>
	        <ul>
	            <?php 
					$desc_name = '';
					$desc_phone = '';
	                if ($config['cf_cert_use']) {
                        $desc_name = '<span class="cert_desc"> 본인확인 시 자동입력</span>';
                        $desc_phone = '<span class="cert_desc"> 본인확인 시 자동입력</span>';

                        if (!$config['cf_cert_simple'] && !$config['cf_cert_hp'] && $config['cf_cert_ipin']) {
                            $desc_phone = '';
                        }
	            ?>
	            <li>
	            <?php
	                    if ($config['cf_cert_simple']) {
                            echo '<button type="button" id="win_sa_kakao_cert" class="btn_frmline win_sa_cert" data-type="">간편인증</button>'.PHP_EOL;
						}
						if($config['cf_cert_hp'])
							echo '<button type="button" id="win_hp_cert" class="btn_frmline">휴대폰 본인확인</button>'.PHP_EOL;
						if ($config['cf_cert_ipin'])
							echo '<button type="button" id="win_ipin_cert" class="btn_frmline">아이핀 본인확인</button>'.PHP_EOL;
	
                        echo '<span class="cert_req">(필수)</span>';
                        echo '<noscript>본인확인을 위해서는 자바스크립트 사용이 가능해야합니다.</noscript>'.PHP_EOL;
						?>
						<?php
	                if ($sungsan_member_certify) {
                        switch ($sungsan_member_certify) {
							case "simple": 
								$mb_cert = "간편인증";
								break;
							case "ipin": 
								$mb_cert = "아이핀";
								break;
							case "hp": 
								$mb_cert = "휴대폰";
								break;
						}
	                ?>
	                <div id="msg_certify">
	                    <strong><?php echo $mb_cert; ?> 본인확인</strong><?php if ($sungsan_member_adult) { ?> 및 <strong>성인인증</strong><?php } ?> 완료
	                </div>
					<?php } ?>
				</li>
				<?php } ?>
	            <li>
	                <label for="reg_mb_name">이름 (필수)<?php echo $desc_name ?></label>
	                <input type="text" id="reg_mb_name" name="mb_name" value="<?php echo $sungsan_member_value('mb_name'); ?>" <?php echo $required ?> <?php echo $name_readonly; ?> class="frm_input full_input <?php echo $required ?> <?php echo $name_readonly ?>" size="10" placeholder="이름">
	            </li>
	            <?php if ($req_nick) {  ?>
	            <li>
	                <label for="reg_mb_nick">
	                	닉네임 (필수)
	                	<button type="button" class="tooltip_icon"><i class="fa fa-question-circle-o" aria-hidden="true"></i><span class="sound_only">설명보기</span></button>
						<span class="tooltip">공백없이 한글,영문,숫자만 입력 가능 (한글2자, 영문4자 이상)<br> 닉네임을 바꾸시면 앞으로 <?php echo (int)$config['cf_nick_modify'] ?>일 이내에는 변경 할 수 없습니다.</span>
	                </label>
	                
                    <input type="hidden" name="mb_nick_default" value="<?php echo $sungsan_member_value('mb_nick'); ?>">
                    <input type="text" name="mb_nick" value="<?php echo $sungsan_member_value('mb_nick'); ?>" id="reg_mb_nick" required class="frm_input required nospace full_input" size="10" maxlength="20" placeholder="닉네임">
                    <span id="msg_mb_nick"></span>	                
	            </li>
	            <?php }  ?>
	
	            <li>
	                <label for="reg_mb_email">E-mail (필수)
	                
	                <?php if ($config['cf_use_email_certify']) {  ?>
	                <button type="button" class="tooltip_icon"><i class="fa fa-question-circle-o" aria-hidden="true"></i><span class="sound_only">설명보기</span></button>
					<span class="tooltip">
	                    <?php if ($w=='') { echo "E-mail 로 발송된 내용을 확인한 후 인증하셔야 회원가입이 완료됩니다."; }  ?>
	                    <?php if ($w=='u') { echo "E-mail 주소를 변경하시면 다시 인증하셔야 합니다."; }  ?>
	                </span>
	                <?php }  ?>
					</label>

	                <input type="hidden" name="old_email" value="<?php echo $sungsan_member_value('mb_email'); ?>">
	                <input type="email" name="mb_email" value="<?php echo $sungsan_member_value('mb_email'); ?>" id="reg_mb_email" required class="frm_input email full_input required" size="70" maxlength="100" autocomplete="email" placeholder="E-mail">
	            </li>
	
				<li>
	            <?php if ($config['cf_use_hp'] || ($config["cf_cert_use"] && ($config['cf_cert_hp'] || $config['cf_cert_simple']))) {  ?>
	                <label for="reg_mb_hp">휴대폰번호<?php if (!empty($hp_required)) { ?> (필수)<?php } ?><?php echo $desc_phone ?></label>
	                
	                <input type="tel" name="mb_hp" value="<?php echo $sungsan_member_value('mb_hp'); ?>" id="reg_mb_hp" <?php echo $hp_required; ?> <?php echo $hp_readonly; ?> class="frm_input full_input <?php echo $hp_required; ?> <?php echo $hp_readonly; ?>" maxlength="20" inputmode="tel" autocomplete="tel" placeholder="휴대폰번호">
	                <?php if ($config['cf_cert_use'] && ($config['cf_cert_hp'] || $config['cf_cert_simple'])) { ?>
	                <input type="hidden" name="old_mb_hp" value="<?php echo $sungsan_member_value('mb_hp'); ?>">
	                <?php } ?>
	            <?php }  ?>
	            </li>
	        </ul>
	    </div>

		<!-- 회원가입 약관 동의에 광고성 정보 수신 동의 표시 여부가 사용시에만 -->
		<?php if($config['cf_use_promotion'] == 1) { ?>
		<div class="tbl_frm01 tbl_wrap register_form_inner">
			<h2>수신설정</h2>
			<!-- 수신설정만 팝업 및 체크박스 관련 class 적용 -->
			<ul>
				<!-- (선택) 마케팅 목적의 개인정보 수집 및 이용 -->
				<li class="chk_box">
				<div class="consent-line">
					<input type="checkbox" name="mb_marketing_agree" value="1" id="reg_mb_marketing_agree" aria-describedby="desc_marketing" <?php echo $sungsan_member_value('mb_marketing_agree') ? 'checked' : ''; ?> class="selec_chk marketing-sync">
					<label for="reg_mb_marketing_agree"><span></span><b class="sound_only">(선택) 성산회 소식 수신을 위한 개인정보 수집 및 이용</b></label>
					<span class="chk_li">(선택) 성산회 소식 수신을 위한 개인정보 수집 및 이용</span>
					<button type="button" class="js-open-consent" data-title="성산회 소식 수신을 위한 개인정보 수집 및 이용" data-template="#tpl_marketing" data-check="#reg_mb_marketing_agree" aria-controls="consentDialog">자세히보기</button>
				</div>
				<input type="hidden" name="mb_marketing_agree_default" value="<?php echo $sungsan_member_value('mb_marketing_agree'); ?>">
				<div id="desc_marketing" class="sound_only">성산회 소식 수신을 위한 개인정보 수집·이용 안내입니다. 자세히보기를 눌러 전문을 확인할 수 있습니다.</div>
				<div class="consent-date"><?php if ($sungsan_member_value('mb_marketing_agree') == 1 && $sungsan_member_value('mb_marketing_date') != "0000-00-00 00:00:00") echo "(동의일자: ".$sungsan_member_value('mb_marketing_date').")"; ?></div>

				<template id="tpl_marketing">
					* 목적: 성산회 소식과 행사 안내<br>
					* 항목: 이름, 이메일<?php echo ($config['cf_use_hp'] || ($config["cf_cert_use"] && ($config['cf_cert_hp'] || $config['cf_cert_simple']))) ? ", 휴대폰 번호" : "";?><br>
					* 보유기간: 회원 탈퇴 시까지<br>
					동의를 거부하셔도 홈페이지 기본 이용에는 제한이 없습니다.
				</template>
				</li>

				<!-- (선택) 광고성 정보 수신 동의 (상위) -->
				<li class="chk_box consent-group">
				<div class="consent-line">
					<input type="checkbox" name="mb_promotion_agree" value="1" id="reg_mb_promotion_agree" aria-describedby="desc_promotion" class="selec_chk marketing-sync parent-promo">
					<label for="reg_mb_promotion_agree"><span></span><b class="sound_only">(선택) 광고성 정보 수신 동의</b></label>
					<span class="chk_li">(선택) 광고성 정보 수신 동의</span>
					<button type="button" class="js-open-consent" data-title="광고성 정보 수신 동의" data-template="#tpl_promotion" data-check="#reg_mb_promotion_agree" data-check-group=".child-promo" aria-controls="consentDialog">자세히보기</button>
				</div>
				
				<div id="desc_promotion" class="sound_only">광고성 정보(이메일/SMS·카카오톡) 수신 동의의 상위 항목입니다. 자세히보기를 눌러 전문을 확인할 수 있습니다.</div>

				<!-- 하위 채널(이메일/SMS) -->
				<ul class="sub-consents">
					<li class="chk_box is-inline">
						<input type="checkbox" name="mb_mailling" value="1" id="reg_mb_mailling" <?php echo $sungsan_member_value('mb_mailling') ? 'checked' : ''; ?> class="selec_chk child-promo">
						<label for="reg_mb_mailling"><span></span><b class="sound_only">광고성 이메일 수신 동의</b></label>
						<span class="chk_li">광고성 이메일 수신 동의</span>
						<input type="hidden" name="mb_mailling_default" value="<?php echo $sungsan_member_value('mb_mailling'); ?>">
						<div class="consent-date"><?php if ($w == 'u' && $sungsan_member_value('mb_mailling') == 1 && $sungsan_member_value('mb_mailling_date') != "0000-00-00 00:00:00") echo "(동의일자: ".$sungsan_member_value('mb_mailling_date').")"; ?></div>
					</li>

					<!-- 휴대폰번호 입력 보이기 or 필수입력일 경우에만 -->
					<?php if ($config['cf_use_hp'] || $config['cf_req_hp']) { ?>
					<li class="chk_box is-inline">
						<input type="checkbox" name="mb_sms" value="1" id="reg_mb_sms" <?php echo $sungsan_member_value('mb_sms') ? 'checked' : ''; ?> class="selec_chk child-promo">
						<label for="reg_mb_sms"><span></span><b class="sound_only">광고성 SMS/카카오톡 수신 동의</b></label>
						<span class="chk_li">광고성 SMS/카카오톡 수신 동의</span>
						<input type="hidden" name="mb_sms_default" value="<?php echo $sungsan_member_value('mb_sms'); ?>">
						<div class="consent-date"><?php if ($w == 'u' && $sungsan_member_value('mb_sms') == 1 && $sungsan_member_value('mb_sms_date') != "0000-00-00 00:00:00") echo "(동의일자: ".$sungsan_member_value('mb_sms_date').")"; ?></div>
					</li>
					<?php } ?>
				</ul>

				<template id="tpl_promotion">
					수집·이용에 동의한 개인정보를 이용하여 이메일/SMS/카카오톡 등으로 오전 8시~오후 9시에 광고성 정보를 전송할 수 있습니다.<br>
					동의는 언제든지 마이페이지에서 철회할 수 있습니다.
				</template>
				</li>

				<!-- (선택) 개인정보 제3자 제공 동의 -->
				<!-- SMS 사용시에만 -->
				<?php
					$configKeys = array('cf_sms_use');
					$companies = array('icode' => '아이코드');

					$usedCompanies = array();
					foreach ($configKeys as $key) {
						if (!empty($config[$key]) && isset($companies[$config[$key]])) {
							$usedCompanies[] = $companies[$config[$key]];
						}
					}
				?>
				<?php if (!empty($usedCompanies)) { ?>
				<li class="chk_box">
				<div class="consent-line">
					<input type="checkbox" name="mb_thirdparty_agree" value="1" id="reg_mb_thirdparty_agree" aria-describedby="desc_thirdparty" <?php echo $sungsan_member_value('mb_thirdparty_agree') ? 'checked' : ''; ?> class="selec_chk marketing-sync">
					<label for="reg_mb_thirdparty_agree"><span></span><b class="sound_only">(선택) 개인정보 제3자 제공 동의</b></label>
					<span class="chk_li">(선택) 개인정보 제3자 제공 동의</span>
					<button type="button" class="js-open-consent" data-title="개인정보 제3자 제공 동의" data-template="#tpl_thirdparty" data-check="#reg_mb_thirdparty_agree" aria-controls="consentDialog">자세히보기</button>
				</div>
				<input type="hidden" name="mb_thirdparty_agree_default" value="<?php echo $sungsan_member_value('mb_thirdparty_agree'); ?>">
				<div id="desc_thirdparty" class="sound_only">개인정보 제3자 제공 동의에 대한 안내입니다. 자세히보기를 눌러 전문을 확인할 수 있습니다.</div>
				<div class="consent-date"><?php if ($sungsan_member_value('mb_thirdparty_agree') == 1 && $sungsan_member_value('mb_thirdparty_date') != "0000-00-00 00:00:00") echo "(동의일자: ".$sungsan_member_value('mb_thirdparty_date').")"; ?></div>

				<template id="tpl_thirdparty">
					* 목적: 성산회 운영 안내와 행사 알림 발송 대행<br>
					* 항목: 이름, 휴대폰 번호<br>
					* 제공받는 자: <?php echo get_text(implode(', ', $usedCompanies)); ?><br>
					* 보유기간: 발송 대행 기간 또는 동의 철회 시까지
				</template>
				</li>
				<?php } ?>
			</ul>
		</div>
		<?php } ?>

		<div class="tbl_frm01 tbl_wrap register_form_inner">
			<h2>자동등록방지</h2>
			<ul>
				<li class="is_captcha_use">
					자동등록방지
					<?php echo captcha_html(); ?>
				</li>
			</ul>
		</div>
	</div>
	<div class="btn_confirm">
	    <a href="<?php echo get_text($sungsan_cancel_url); ?>" class="btn_close">취소</a>
	    <button type="submit" id="btn_submit" class="btn_submit" accesskey="s"><?php echo get_text($sungsan_submit_label); ?></button>
	</div>
	</form>
</div>

<?php include_once(dirname(__FILE__) . '/consent_modal.inc.php'); ?>

<script>
$(function() {
    $("#reg_zip_find").css("display", "inline-block");
    var pageTypeParam = "pageType=register";

	<?php if($config['cf_cert_use'] && $config['cf_cert_simple']) { ?>
	// 이니시스 간편인증
	var url = "<?php echo G5_INICERT_URL; ?>/ini_request.php";
	var type = "";    
    var params = "";
    var request_url = "";

	$(".win_sa_cert").click(function() {
		if(!cert_confirm()) return false;
		type = $(this).data("type");
        params = "?directAgency=" + type + "&" + pageTypeParam;
        request_url = url + params;
        call_sa(request_url);
	});
    <?php } ?>
    <?php if($config['cf_cert_use'] && $config['cf_cert_ipin']) { ?>
    // 아이핀인증
    var params = "";
    $("#win_ipin_cert").click(function() {
		if(!cert_confirm()) return false;
        params = "?" + pageTypeParam;
        var url = "<?php echo G5_OKNAME_URL; ?>/ipin1.php"+params;
        certify_win_open('kcb-ipin', url);
        return;
    });

    <?php } ?>
    <?php if($config['cf_cert_use'] && $config['cf_cert_hp']) { ?>
    // 휴대폰인증
    var params = "";
    $("#win_hp_cert").click(function() {
		if(!cert_confirm()) return false;
        params = "?" + pageTypeParam;
        <?php     
        $cert_type = '';
        $cert_url = '';
        switch($config['cf_cert_hp']) {
            case 'kcb':                
                $cert_url = G5_OKNAME_URL.'/hpcert1.php';
                $cert_type = 'kcb-hp';
                break;
            case 'kcp':
                $cert_url = G5_KCPCERT_URL.'/kcpcert_form.php';
                $cert_type = 'kcp-hp';
                break;
            case 'kcp_v2':
                $cert_url = G5_KCPCERT_V2_URL.'/kcpcert_form.php';
                $cert_type = 'kcp_v2-hp';
                break;
            case 'lg':
                $cert_url = G5_LGXPAY_URL.'/AuthOnlyReq.php';
                $cert_type = 'lg-hp';
                break;
            default:
                echo 'alert("기본환경설정에서 휴대폰 본인확인 설정을 해주십시오");';
                echo 'return false;';
                break;
        }
        $cert_type_json = json_encode($cert_type, JSON_UNESCAPED_SLASHES);
        $cert_url_json = json_encode($cert_url, JSON_UNESCAPED_SLASHES);
        ?>
        
        certify_win_open(<?php echo $cert_type_json; ?>, <?php echo $cert_url_json; ?> + params);
        return;
    });
    <?php } ?>
});

// submit 최종 폼체크
function fregisterform_submit(f)
{
    // 회원아이디 검사
    if (f.w.value == "") {
        var msg = reg_mb_id_check();
        if (msg) {
            alert(msg);
            f.mb_id.select();
            return false;
        }
    }

    if (f.w.value == "") {
        if (f.mb_password.value.length < 3) {
            alert("비밀번호를 3글자 이상 입력하십시오.");
            f.mb_password.focus();
            return false;
        }
    }

    if (f.mb_password.value != f.mb_password_re.value) {
        alert("비밀번호가 같지 않습니다.");
        f.mb_password_re.focus();
        return false;
    }

    if (f.mb_password.value.length > 0) {
        if (f.mb_password_re.value.length < 3) {
            alert("비밀번호를 3글자 이상 입력하십시오.");
            f.mb_password_re.focus();
            return false;
        }
    }

    // 이름 검사
    if (f.w.value=="") {
        if (f.mb_name.value.length < 1) {
            alert("이름을 입력하십시오.");
            f.mb_name.focus();
            return false;
        }

        /*
        var pattern = /([^가-힣\x20])/i;
        if (pattern.test(f.mb_name.value)) {
            alert("이름은 한글로 입력하십시오.");
            f.mb_name.select();
            return false;
        }
        */
    }

    <?php if($w == '' && $config['cf_cert_use'] && $config['cf_cert_req']) { ?>
    // 본인확인 체크
    if(f.cert_no.value=="") {
        alert("회원가입을 위해서는 본인확인을 해주셔야 합니다.");
        return false;
    }
    <?php } ?>

    // 닉네임 검사
    if ((f.w.value == "") || (f.w.value == "u" && f.mb_nick.defaultValue != f.mb_nick.value)) {
        var msg = reg_mb_nick_check();
        if (msg) {
            alert(msg);
            f.reg_mb_nick.select();
            return false;
        }
    }

    // E-mail 검사
    if ((f.w.value == "") || (f.w.value == "u" && f.mb_email.defaultValue != f.mb_email.value)) {
        var msg = reg_mb_email_check();
        if (msg) {
            alert(msg);
            f.reg_mb_email.select();
            return false;
        }
    }

    <?php if (($config['cf_use_hp'] || $config['cf_cert_hp']) && $config['cf_req_hp']) {  ?>
    // 휴대폰번호 체크
    var msg = reg_mb_hp_check();
    if (msg) {
        alert(msg);
        f.reg_mb_hp.select();
        return false;
    }
    <?php } ?>

    if (typeof f.mb_icon != "undefined") {
        if (f.mb_icon.value) {
            if (!f.mb_icon.value.toLowerCase().match(/.(gif|jpe?g|png)$/i)) {
                alert("회원아이콘이 이미지 파일이 아닙니다.");
                f.mb_icon.focus();
                return false;
            }
        }
    }

    if (typeof f.mb_img != "undefined") {
        if (f.mb_img.value) {
            if (!f.mb_img.value.toLowerCase().match(/.(gif|jpe?g|png)$/i)) {
                alert("회원이미지가 이미지 파일이 아닙니다.");
                f.mb_img.focus();
                return false;
            }
        }
    }

    if (typeof(f.mb_recommend) != "undefined" && f.mb_recommend.value) {
        if (f.mb_id.value == f.mb_recommend.value) {
            alert("본인을 추천할 수 없습니다.");
            f.mb_recommend.focus();
            return false;
        }

        var msg = reg_mb_recommend_check();
        if (msg) {
            alert(msg);
            f.mb_recommend.select();
            return false;
        }
    }

    <?php echo chk_captcha_js();  ?>

    document.getElementById("btn_submit").disabled = "disabled";

    return true;
}

jQuery(function($){
	//tooltip
    $(document).on("click", ".tooltip_icon", function(e){
        $(this).next(".tooltip").fadeIn(400).css("display","inline-block");
    }).on("mouseout", ".tooltip_icon", function(e){
        $(this).next(".tooltip").fadeOut();
    });
});

document.addEventListener('DOMContentLoaded', function () {
  const parentPromo = document.getElementById('reg_mb_promotion_agree');
  const childPromo  = Array.from(document.querySelectorAll('.child-promo'));
  if (!parentPromo || childPromo.length === 0) return;

  const syncParentFromChildren = () => {
    const anyChecked = childPromo.some(cb => cb.checked);
    parentPromo.checked = anyChecked; // 하나라도 체크되면 부모 체크
  };

  const syncChildrenFromParent = () => {
    const isChecked = parentPromo.checked;
    childPromo.forEach(cb => {
      cb.checked = isChecked;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  syncParentFromChildren();

  parentPromo.addEventListener('change', syncChildrenFromParent);
  childPromo.forEach(cb => cb.addEventListener('change', syncParentFromChildren));
});

</script>

<!-- } 회원정보 입력/수정 끝 -->
