<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

$sungsan_cancel_url = ($w === 'u' && !empty($wr_id)) ? get_pretty_url($bo_table, $wr_id) : $list_href;
$sungsan_upload_limit_mb = isset($board['bo_upload_size']) ? max(1, (int) ceil((int) $board['bo_upload_size'] / 1048576)) : 10;
?>
<section class="ss-section">
    <div class="ss-container">
        <h1 class="ss-section-title"><?php echo $w === 'u' ? '자유 글 수정' : '자유 글쓰기'; ?></h1>
        <p id="ss-write-required-help" class="ss-form-help ss-form-summary">제목과 본문은 필수입니다. 회원끼리 나누는 글이므로 개인정보가 포함된 자료는 올리기 전에 한 번 더 확인해 주세요.</p>
        <form name="fwrite" id="fwrite" action="<?php echo get_text($action_url); ?>" method="post" enctype="multipart/form-data" autocomplete="off" class="ss-form-grid ss-write-form">
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
                <textarea id="wr_content" name="wr_content" required aria-describedby="ss-write-required-help"><?php echo get_text($content); ?></textarea>
            </div>
            <?php if ($is_file) { ?>
                <p id="ss-attachment-help" class="ss-form-help ss-attachment-help">사진과 문서 파일을 첨부할 수 있습니다. 파일 한 개당 <?php echo number_format((int) $sungsan_upload_limit_mb); ?>MB 이하로 올려 주세요. PHP, HTML, JS, SVG처럼 브라우저에서 실행될 수 있는 파일은 업로드할 수 없습니다.</p>
                <?php for ($i = 0; $i < $file_count; $i++) { ?>
                    <div class="ss-field">
                        <label for="bf_file_<?php echo $i + 1; ?>">첨부 파일 <?php echo $i + 1; ?></label>
                        <input type="file" name="bf_file[]" id="bf_file_<?php echo $i + 1; ?>" aria-describedby="ss-attachment-help">
                        <?php if ($w === 'u' && isset($file[$i]['file']) && $file[$i]['file']) { ?>
                            <label class="ss-checkline">
                                <input type="checkbox" name="bf_file_del[<?php echo $i; ?>]" value="1">
                                기존 파일 삭제: <?php echo get_text($file[$i]['source']); ?>
                            </label>
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
                <button type="submit" class="ss-button">저장</button>
                <a class="ss-button secondary" href="<?php echo get_text($sungsan_cancel_url); ?>">취소</a>
            </div>
        </form>
    </div>
</section>
