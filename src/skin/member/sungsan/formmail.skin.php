<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);

$formmail_action_url = './formmail_send.php';
$formmail_recipient_name = isset($name) ? $name : '';
$formmail_recipient_email = isset($email) ? $email : '';
$formmail_member_nick = isset($member['mb_nick']) ? $member['mb_nick'] : '';
$formmail_member_email = isset($member['mb_email']) ? $member['mb_email'] : '';
$formmail_upload_limit_mb = 20;
$formmail_attachment_accept = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
?>

<!-- 폼메일 시작 { -->
<div id="formmail" class="new_win">
    <h1 id="win_title"><?php echo get_text($formmail_recipient_name); ?>님께 메일보내기</h1>

    <form name="fformmail" action="<?php echo get_text($formmail_action_url); ?>" onsubmit="return fformmail_submit(this);" method="post" enctype="multipart/form-data">
    <input type="hidden" name="to" value="<?php echo get_text($formmail_recipient_email); ?>">
    <input type="hidden" name="attach" value="2">
    <?php if ($is_member) { // 회원이면  ?>
    <input type="hidden" name="fnick" value="<?php echo get_text($formmail_member_nick); ?>">
    <input type="hidden" name="fmail" value="<?php echo get_text($formmail_member_email); ?>">
    <?php }  ?>

    <div class="form_01 new_win_con">
        <h2 class="sound_only">메일쓰기</h2>
        <ul>
            <?php if (!$is_member) {  ?>
            <li>
                <label for="fnick">이름 <strong>필수</strong></label>
                <input type="text" name="fnick" id="fnick" required class="frm_input full_input required">
            </li>
            <li>
                <label for="fmail">E-mail <strong>필수</strong></label>
                <input type="email" name="fmail"  id="fmail" required class="frm_input full_input required" autocomplete="email">
            </li>
            <?php }  ?>
            <li>
                <label for="subject">제목 <strong>필수</strong></label>
                <input type="text" name="subject" id="subject" required class="frm_input full_input required">
            </li>
            <li>
                <fieldset class="ss-choice-group">
                    <legend>메일 형식</legend>
                    <div class="ss-choice-options">
                        <input type="radio" name="type" value="0" id="type_text" checked>
                        <label for="type_text"><span></span>TEXT</label>

                        <input type="radio" name="type" value="1" id="type_html">
                        <label for="type_html"><span></span>HTML</label>

                        <input type="radio" name="type" value="2" id="type_both">
                        <label for="type_both"><span></span>TEXT+HTML</label>
                    </div>
                </fieldset>
            </li>
            <li>
                <label for="content">내용 <strong>필수</strong></label>
                <textarea name="content" id="content" required class="required"></textarea>
            </li>
            <li class="formmail_flie">
                <div class="file_wr">
                    <label for="file1">첨부 파일 1</label>
                    <input type="file" name="file1"  id="file1"  class="frm_file full_input" accept="<?php echo get_text($formmail_attachment_accept); ?>" aria-describedby="formmail_attachment_help">
               </div>
               <div id="formmail_attachment_help" class="frm_info">사진과 문서 파일만 첨부해 주세요. 파일 한 개당 <?php echo number_format((int) $formmail_upload_limit_mb); ?>MB 이하로 첨부해 주세요. PHP, HTML, JS, SVG, .htaccess, .user.ini처럼 브라우저나 서버에서 실행될 수 있는 파일은 첨부할 수 없습니다. shell.php7, shell.php8, shell.php.jpg처럼 실행형 또는 여러 확장자를 붙인 파일도 보내지 마세요. 메일을 보낸 후 파일이 첨부 되었는지 반드시 확인해 주시기 바랍니다.</div>
            </li>
            <li class="formmail_flie">
                <div class="file_wr">
                    <label for="file2">첨부 파일 2</label>
                    <input type="file" name="file2" id="file2" class="frm_file full_input" accept="<?php echo get_text($formmail_attachment_accept); ?>" aria-describedby="formmail_attachment_help">
                </div>
            </li>
            <li>
                <span class="sound_only">자동등록방지</span>
                <?php echo captcha_html(); ?>
            </li>
        </ul>
        <div class="win_btn">
        	<button type="submit" id="btn_submit" class="btn_b02 reply_btn">메일발송</button>
            <button type="button" onclick="window.close();" class="btn_close">창닫기</button>
        </div>
    </div>


    </form>
</div>

<script>
const senderNameField = document.getElementById('fnick');
const subjectField = document.fformmail.subject;

if (senderNameField) {
    senderNameField.focus();
} else if (subjectField) {
    subjectField.focus();
}

function fformmail_submit(f)
{
    <?php echo chk_captcha_js();  ?>

    if (f.file1.value || f.file2.value) {
        // 4.00.11
        if (!confirm("첨부파일의 용량이 큰경우 전송시간이 오래 걸립니다.\n\n메일보내기가 완료되기 전에 창을 닫거나 새로고침 하지 마십시오."))
            return false;
    }

    document.getElementById('btn_submit').disabled = true;

    return true;
}
</script>
<!-- } 폼메일 끝 -->
