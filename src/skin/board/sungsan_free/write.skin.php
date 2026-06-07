<?php
if (!defined('_GNUBOARD_')) {
    exit;
}
?>
<section class="ss-section">
    <div class="ss-container">
        <h1 class="ss-section-title"><?php echo $w === 'u' ? '자유 글 수정' : '자유 글쓰기'; ?></h1>
        <p class="ss-form-help">회원끼리 나누는 글입니다. 개인정보가 포함된 자료는 올리기 전에 한 번 더 확인해 주세요.</p>
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
                <input id="wr_subject" name="wr_subject" value="<?php echo get_text($subject); ?>" required>
            </div>
            <div class="ss-field">
                <label for="wr_content">본문 <span class="ss-required">필수</span></label>
                <textarea id="wr_content" name="wr_content" required><?php echo get_text($content); ?></textarea>
            </div>
            <?php for ($i = 0; $is_file && $i < $file_count; $i++) { ?>
                <div class="ss-field">
                    <label for="bf_file_<?php echo $i + 1; ?>">첨부 파일 <?php echo $i + 1; ?></label>
                    <input type="file" name="bf_file[]" id="bf_file_<?php echo $i + 1; ?>">
                    <p class="ss-form-help">사진과 문서 파일을 첨부할 수 있습니다. PHP, HTML, JS, SVG처럼 브라우저에서 실행될 수 있는 파일은 업로드할 수 없습니다.</p>
                    <?php if ($w === 'u' && isset($file[$i]['file']) && $file[$i]['file']) { ?>
                        <label class="ss-checkline">
                            <input type="checkbox" name="bf_file_del[<?php echo $i; ?>]" value="1">
                            기존 파일 삭제: <?php echo get_text($file[$i]['source']); ?>
                        </label>
                    <?php } ?>
                </div>
            <?php } ?>
            <?php if (!empty($is_use_captcha) && isset($captcha_html)) { ?>
                <div class="ss-field ss-captcha">
                    <?php echo $captcha_html; ?>
                </div>
            <?php } ?>
            <div class="ss-action-bar">
                <button type="submit" class="ss-button">저장</button>
                <a class="ss-button secondary" href="<?php echo get_text($list_href); ?>">취소</a>
            </div>
        </form>
    </div>
</section>
