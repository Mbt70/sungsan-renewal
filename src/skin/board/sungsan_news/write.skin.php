<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $sungsan_news_categories, $sungsan_groups;

$visibility = isset($write['wr_2']) && $write['wr_2'] ? $write['wr_2'] : 'member';
$group_slug = isset($write['wr_1']) ? $write['wr_1'] : '';
$legacy_board_id = isset($write['wr_5']) ? get_text($write['wr_5']) : '';
$legacy_post_id = isset($write['wr_6']) ? get_text($write['wr_6']) : '';
$review_flag = isset($write['wr_7']) ? get_text($write['wr_7']) : '';
$review_reason = isset($write['wr_8']) ? get_text($write['wr_8']) : '';
$sungsan_cancel_url = ($w === 'u' && !empty($wr_id)) ? get_pretty_url($bo_table, $wr_id) : $list_href;
?>
<section class="ss-section">
    <div class="ss-container">
        <h1 class="ss-section-title"><?php echo $w === 'u' ? '소식 수정' : '소식 글쓰기'; ?></h1>
        <p id="ss-write-required-help" class="ss-form-help ss-form-summary">종류, 제목, 본문은 필수입니다. 소속과 공개 범위는 글의 성격에 맞게 선택해 주세요.</p>
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
            <input type="hidden" name="wr_5" value="<?php echo get_text($legacy_board_id); ?>">
            <input type="hidden" name="wr_6" value="<?php echo get_text($legacy_post_id); ?>">
            <input type="hidden" name="wr_7" value="<?php echo get_text($review_flag); ?>">
            <input type="hidden" name="wr_8" value="<?php echo get_text($review_reason); ?>">
            <?php if (isset($option_hidden)) { echo $option_hidden; } ?>

            <div class="ss-field">
                <label for="wr_subject">제목 <span class="ss-required">필수</span></label>
                <input id="wr_subject" name="wr_subject" value="<?php echo get_text($subject); ?>" required aria-describedby="ss-write-required-help">
            </div>

            <div class="ss-card-grid">
                <div class="ss-field">
                    <label for="ca_name">종류 <span class="ss-required">필수</span></label>
                    <select id="ca_name" name="ca_name" required aria-describedby="ss-write-required-help">
                        <option value="">종류 선택</option>
                        <?php foreach ($sungsan_news_categories as $category) { ?>
                            <option value="<?php echo get_text($category); ?>"<?php echo sungsan_selected($ca_name, $category); ?>><?php echo get_text($category); ?></option>
                        <?php } ?>
                    </select>
                </div>
                <div class="ss-field">
                    <label for="wr_1">소속</label>
                    <select id="wr_1" name="wr_1">
                        <option value="">소속 없음</option>
                        <?php foreach ($sungsan_groups as $slug => $label) { ?>
                            <option value="<?php echo get_text($slug); ?>"<?php echo sungsan_selected($group_slug, $slug); ?>><?php echo get_text($label); ?></option>
                        <?php } ?>
                    </select>
                </div>
            </div>

            <div class="ss-card-grid">
                <div class="ss-field">
                    <label for="wr_2">공개 범위</label>
                    <select id="wr_2" name="wr_2">
                        <option value="public"<?php echo sungsan_selected($visibility, 'public'); ?>>누구나</option>
                        <option value="member"<?php echo sungsan_selected($visibility, 'member'); ?>>회원</option>
                        <option value="officer"<?php echo sungsan_selected($visibility, 'officer'); ?>>임원</option>
                    </select>
                </div>
                <div class="ss-field">
                    <label for="wr_3">행사 시작일</label>
                    <input id="wr_3" name="wr_3" type="date" value="<?php echo isset($write['wr_3']) ? get_text($write['wr_3']) : ''; ?>">
                </div>
                <div class="ss-field">
                    <label for="wr_4">행사 종료일</label>
                    <input id="wr_4" name="wr_4" type="date" value="<?php echo isset($write['wr_4']) ? get_text($write['wr_4']) : ''; ?>">
                </div>
            </div>

            <div class="ss-field">
                <label for="wr_content">본문 <span class="ss-required">필수</span></label>
                <textarea id="wr_content" name="wr_content" required aria-describedby="ss-write-required-help"><?php echo get_text($content); ?></textarea>
            </div>

            <?php if ($is_file) { ?>
                <p id="ss-attachment-help" class="ss-form-help ss-attachment-help">사진과 문서 파일을 첨부할 수 있습니다. PHP, HTML, JS, SVG처럼 브라우저에서 실행될 수 있는 파일은 업로드할 수 없습니다.</p>
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
