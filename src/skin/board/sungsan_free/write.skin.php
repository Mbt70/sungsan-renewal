<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

$sungsan_cancel_url = ($w === 'u' && !empty($wr_id)) ? get_pretty_url($bo_table, $wr_id) : $list_href;
$sungsan_upload_limit_mb = isset($board['bo_upload_size']) ? max(1, (int) ceil((int) $board['bo_upload_size'] / 1048576)) : 10;
$sungsan_attachment_accept = '.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm,.pdf,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
$sungsan_submit_label = $w === 'u' ? '수정 완료' : '자유글 등록';
$sungsan_write_min = isset($write_min) ? (int) $write_min : 0;
$sungsan_write_max = isset($write_max) ? (int) $write_max : 0;
?>
<script>
var char_min = parseInt(<?php echo $sungsan_write_min; ?>, 10);
var char_max = parseInt(<?php echo $sungsan_write_max; ?>, 10);
</script>

<section class="ss-section">
    <div class="ss-container">
        <h1 class="ss-section-title"><?php echo $w === 'u' ? '자유 글 수정' : '자유 글쓰기'; ?></h1>
        <p id="ss-write-required-help" class="ss-form-help ss-form-summary">제목과 본문은 필수입니다. 회원끼리 나누는 글이므로 개인정보가 포함된 자료는 올리기 전에 한 번 더 확인해 주세요.</p>
        <p id="ss-free-privacy-help" class="ss-form-help">자유게시판은 회원 전용 공간이지만 개인정보나 민감한 자료는 본문과 첨부에 올리기 전 다시 확인해 주세요.</p>
        <form name="fwrite" id="fwrite" action="<?php echo get_text($action_url); ?>" onsubmit="return fwrite_submit(this);" method="post" enctype="multipart/form-data" autocomplete="off" class="ss-form-grid ss-write-form">
            <input type="hidden" name="uid" value="<?php echo get_uniqid(); ?>">
            <input type="hidden" name="w" value="<?php echo get_text($w); ?>">
            <input type="hidden" name="bo_table" value="<?php echo get_text($bo_table); ?>">
            <input type="hidden" name="wr_id" value="<?php echo get_text($wr_id); ?>">
            <input type="hidden" name="sca" value="<?php echo get_text($sca); ?>">
            <input type="hidden" name="sfl" value="<?php echo get_text($sfl); ?>">
            <input type="hidden" name="stx" value="<?php echo get_text($stx); ?>">
            <input type="hidden" name="spt" value="<?php echo get_text($spt); ?>">
            <input type="hidden" name="sst" value="<?php echo get_text($sst); ?>">
            <input type="hidden" name="sod" value="<?php echo get_text($sod); ?>">
            <input type="hidden" name="page" value="<?php echo get_text($page); ?>">
            <?php if (isset($option_hidden)) { echo $option_hidden; } ?>
            <div class="ss-field">
                <label for="wr_subject">제목 <span class="ss-required">필수</span></label>
                <input id="wr_subject" name="wr_subject" value="<?php echo get_text($subject); ?>" required aria-describedby="ss-write-required-help">
            </div>
            <div class="ss-field">
                <label for="wr_content">본문 <span class="ss-required">필수</span></label>
                <?php if ($sungsan_write_min || $sungsan_write_max) { ?>
                    <p id="char_cnt" class="ss-form-help" aria-live="polite"><span id="char_count"></span>글자</p>
                <?php } ?>
                <textarea id="wr_content" name="wr_content" required aria-describedby="ss-write-required-help<?php if ($sungsan_write_min || $sungsan_write_max) { ?> char_cnt<?php } ?>" <?php if ($sungsan_write_min || $sungsan_write_max) { ?>onkeyup="check_byte('wr_content', 'char_count');"<?php } ?>><?php echo get_text($content); ?></textarea>
            </div>
            <?php if ($is_file) { ?>
                <p id="ss-attachment-help" class="ss-form-help ss-attachment-help">사진·영상과 문서 파일을 첨부할 수 있습니다. 파일 한 개당 <?php echo number_format((int) $sungsan_upload_limit_mb); ?>MB 이하로 올려 주세요. PHP, HTML, JS, SVG, .htaccess, .user.ini처럼 브라우저나 서버에서 실행될 수 있는 파일은 업로드할 수 없습니다. shell.php7, shell.php8, shell.php.jpg처럼 실행형 또는 여러 확장자를 붙인 파일도 차단됩니다.</p>
                <?php for ($i = 0; $i < $file_count; $i++) { ?>
                    <?php
                    $sungsan_write_file = isset($file[$i]) ? $file[$i] : array();
                    $sungsan_write_file_exists = isset($sungsan_write_file['file']) ? $sungsan_write_file['file'] : '';
                    $sungsan_write_file_source = isset($sungsan_write_file['source']) ? $sungsan_write_file['source'] : '';
                    $sungsan_write_file_size = isset($sungsan_write_file['size']) ? $sungsan_write_file['size'] : '';
                    $sungsan_write_file_delete_id = 'bf_file_del_'.$i;
                    ?>
                    <div class="ss-field">
                        <label for="bf_file_<?php echo $i + 1; ?>">첨부 파일 <?php echo $i + 1; ?></label>
                        <input type="file" name="bf_file[]" id="bf_file_<?php echo $i + 1; ?>" accept="<?php echo get_text($sungsan_attachment_accept); ?>" aria-describedby="ss-attachment-help ss-free-privacy-help">
                        <?php if ($w === 'u' && $sungsan_write_file_exists !== '') { ?>
                            <div class="ss-existing-file">
                                <p>
                                    <strong>현재 첨부</strong>
                                    <span><?php echo get_text($sungsan_write_file_source); ?></span>
                                    <?php if ($sungsan_write_file_size !== '') { ?><span><?php echo get_text($sungsan_write_file_size); ?></span><?php } ?>
                                </p>
                                <label class="ss-checkline" for="<?php echo get_text($sungsan_write_file_delete_id); ?>">
                                    <input type="checkbox" id="<?php echo get_text($sungsan_write_file_delete_id); ?>" name="bf_file_del[<?php echo $i; ?>]" value="1">
                                    이 파일 삭제
                                </label>
                            </div>
                        <?php } ?>
                    </div>
                <?php } ?>
            <?php } ?>
            <?php if (!empty($is_use_captcha) && isset($captcha_html)) { ?>
                <div class="ss-field ss-captcha">
                    <?php echo $captcha_html; ?>
                </div>
            <?php } ?>
            <div class="ss-action-bar">
                <button type="submit" id="btn_submit" accesskey="s" class="ss-button"><?php echo get_text($sungsan_submit_label); ?></button>
                <a class="ss-button secondary" href="<?php echo get_text($sungsan_cancel_url); ?>">취소</a>
            </div>
        </form>

        <script>
        function fwrite_submit(f)
        {
            <?php echo $editor_js; ?>

            var subject = '';
            var content = '';

            $.ajax({
                url: g5_bbs_url + '/ajax.filter.php',
                type: 'POST',
                data: {
                    subject: f.wr_subject.value,
                    content: f.wr_content.value
                },
                dataType: 'json',
                async: false,
                cache: false,
                success: function(data) {
                    subject = data.subject;
                    content = data.content;
                }
            });

            if (subject) {
                alert('제목에 금지단어(' + subject + ')가 포함되어 있습니다.');
                f.wr_subject.focus();
                return false;
            }

            if (content) {
                alert('내용에 금지단어(' + content + ')가 포함되어 있습니다.');
                if (typeof ed_wr_content !== 'undefined') {
                    ed_wr_content.returnFalse();
                } else {
                    f.wr_content.focus();
                }
                return false;
            }

            if (document.getElementById('char_count')) {
                if (char_min > 0 || char_max > 0) {
                    var cnt = parseInt(check_byte('wr_content', 'char_count'), 10);

                    if (char_min > 0 && char_min > cnt) {
                        alert('본문은 ' + char_min + '글자 이상 입력해 주세요.');
                        return false;
                    }

                    if (char_max > 0 && char_max < cnt) {
                        alert('본문은 ' + char_max + '글자 이하로 입력해 주세요.');
                        return false;
                    }
                }
            }

            <?php echo $captcha_js; ?>

            document.getElementById('btn_submit').disabled = true;

            return true;
        }
        </script>
    </div>
</section>
