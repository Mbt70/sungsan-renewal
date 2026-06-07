<?php
if (!defined('_GNUBOARD_')) {
    exit;
}
?>
<section class="ss-section">
    <div class="ss-container">
        <h1 class="ss-section-title"><?php echo $w === 'u' ? '자유 글 수정' : '자유 글쓰기'; ?></h1>
        <form name="fwrite" id="fwrite" action="<?php echo $action_url; ?>" method="post" enctype="multipart/form-data" autocomplete="off" class="ss-form-grid" style="margin-top:24px">
            <input type="hidden" name="uid" value="<?php echo get_uniqid(); ?>">
            <input type="hidden" name="w" value="<?php echo $w; ?>">
            <input type="hidden" name="bo_table" value="<?php echo $bo_table; ?>">
            <input type="hidden" name="wr_id" value="<?php echo $wr_id; ?>">
            <input type="hidden" name="sca" value="<?php echo $sca; ?>">
            <input type="hidden" name="sfl" value="<?php echo $sfl; ?>">
            <input type="hidden" name="stx" value="<?php echo $stx; ?>">
            <input type="hidden" name="spt" value="<?php echo $spt; ?>">
            <input type="hidden" name="sst" value="<?php echo $sst; ?>">
            <input type="hidden" name="sod" value="<?php echo $sod; ?>">
            <input type="hidden" name="page" value="<?php echo $page; ?>">
            <?php if (isset($option_hidden)) { echo $option_hidden; } ?>
            <div class="ss-field">
                <label for="wr_subject">제목</label>
                <input id="wr_subject" name="wr_subject" value="<?php echo $subject; ?>" required>
            </div>
            <div class="ss-field">
                <label for="wr_content">본문</label>
                <textarea id="wr_content" name="wr_content" required><?php echo $content; ?></textarea>
            </div>
            <?php for ($i = 0; $is_file && $i < $file_count; $i++) { ?>
                <div class="ss-field">
                    <label for="bf_file_<?php echo $i + 1; ?>">첨부 파일 <?php echo $i + 1; ?></label>
                    <input type="file" name="bf_file[]" id="bf_file_<?php echo $i + 1; ?>">
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
            <div class="ss-filter-bar">
                <button type="submit" class="ss-button">저장</button>
                <a class="ss-button secondary" href="<?php echo $list_href; ?>">취소</a>
            </div>
        </form>
    </div>
</section>
