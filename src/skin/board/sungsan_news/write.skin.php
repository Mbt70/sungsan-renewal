<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $sungsan_groups;

$sungsan_write_mode = isset($w) ? $w : '';
$sungsan_write_action_url = isset($action_url) ? $action_url : '';
$sungsan_write_subject = isset($subject) ? $subject : '';
$sungsan_write_content = isset($content) ? $content : '';
$sungsan_write_board_id = isset($bo_table) ? $bo_table : 'news';
$sungsan_write_wr_id = isset($wr_id) ? (int) $wr_id : 0;
$sungsan_write_sca = isset($sca) ? $sca : '';
$sungsan_write_sfl = isset($sfl) ? $sfl : '';
$sungsan_write_stx = isset($stx) ? $stx : '';
$sungsan_write_spt = isset($spt) ? $spt : '';
$sungsan_write_sst = isset($sst) ? $sst : '';
$sungsan_write_sod = isset($sod) ? $sod : '';
$sungsan_write_page = isset($page) ? (int) $page : 0;
$sungsan_option_hidden = isset($option_hidden) ? $option_hidden : '';
$sungsan_write_uses_files = isset($is_file) ? (bool) $is_file : false;
$sungsan_write_file_count = isset($file_count) ? max(0, (int) $file_count) : 0;
$sungsan_write_files = (isset($file) && is_array($file)) ? $file : array();
$sungsan_uses_captcha = !empty($is_use_captcha);
$sungsan_captcha_html = isset($captcha_html) ? $captcha_html : '';
$sungsan_editor_js = isset($editor_js) ? $editor_js : '';
$sungsan_captcha_js = isset($captcha_js) ? $captcha_js : '';
$visibility = isset($write['wr_2']) && $write['wr_2'] ? $write['wr_2'] : 'member';
$group_slug = isset($write['wr_1']) ? $write['wr_1'] : '';
$sungsan_event_start_date = isset($write['wr_3']) ? $write['wr_3'] : '';
$sungsan_event_end_date = isset($write['wr_4']) ? $write['wr_4'] : '';
$legacy_board_id = isset($write['wr_5']) ? get_text($write['wr_5']) : '';
$legacy_post_id = isset($write['wr_6']) ? get_text($write['wr_6']) : '';
$review_flag = isset($write['wr_7']) ? get_text($write['wr_7']) : '';
$review_reason = isset($write['wr_8']) ? get_text($write['wr_8']) : '';
$sungsan_write_list_href = isset($list_href) ? $list_href : get_pretty_url($sungsan_write_board_id);
$sungsan_cancel_url = ($sungsan_write_mode === 'u' && $sungsan_write_wr_id > 0) ? get_pretty_url($sungsan_write_board_id, $sungsan_write_wr_id) : $sungsan_write_list_href;
$sungsan_upload_limit_mb = isset($board['bo_upload_size']) ? max(1, (int) ceil((int) $board['bo_upload_size'] / 1048576)) : 10;
$sungsan_attachment_accept = '.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm,.pdf,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
$sungsan_news_category_options = sungsan_get_news_categories(isset($board) ? $board : array());
$sungsan_visibility_options = array('public', 'member', 'officer');
$sungsan_submit_label = $sungsan_write_mode === 'u' ? '수정 완료' : '소식 등록';
$sungsan_write_min = isset($write_min) ? (int) $write_min : 0;
$sungsan_write_max = isset($write_max) ? (int) $write_max : 0;
?>
<script>
var char_min = parseInt(<?php echo $sungsan_write_min; ?>, 10);
var char_max = parseInt(<?php echo $sungsan_write_max; ?>, 10);
</script>

<section class="ss-section">
    <div class="ss-container">
        <h1 class="ss-section-title"><?php echo $sungsan_write_mode === 'u' ? '소식 수정' : '소식 글쓰기'; ?></h1>
        <p id="ss-write-required-help" class="ss-form-help ss-form-summary">종류, 제목, 본문은 필수입니다. 소속과 공개 범위는 글의 성격에 맞게 선택해 주세요.</p>
        <form name="fwrite" id="fwrite" action="<?php echo get_text($sungsan_write_action_url); ?>" onsubmit="return fwrite_submit(this);" method="post" enctype="multipart/form-data" autocomplete="off" class="ss-form-grid ss-write-form">
            <input type="hidden" name="uid" value="<?php echo get_uniqid(); ?>">
            <input type="hidden" name="w" value="<?php echo get_text($sungsan_write_mode); ?>">
            <input type="hidden" name="bo_table" value="<?php echo get_text($sungsan_write_board_id); ?>">
            <input type="hidden" name="wr_id" value="<?php echo (int) $sungsan_write_wr_id; ?>">
            <input type="hidden" name="sca" value="<?php echo get_text($sungsan_write_sca); ?>">
            <input type="hidden" name="sfl" value="<?php echo get_text($sungsan_write_sfl); ?>">
            <input type="hidden" name="stx" value="<?php echo get_text($sungsan_write_stx); ?>">
            <input type="hidden" name="spt" value="<?php echo get_text($sungsan_write_spt); ?>">
            <input type="hidden" name="sst" value="<?php echo get_text($sungsan_write_sst); ?>">
            <input type="hidden" name="sod" value="<?php echo get_text($sungsan_write_sod); ?>">
            <input type="hidden" name="page" value="<?php echo (int) $sungsan_write_page; ?>">
            <input type="hidden" name="wr_5" value="<?php echo get_text($legacy_board_id); ?>">
            <input type="hidden" name="wr_6" value="<?php echo get_text($legacy_post_id); ?>">
            <input type="hidden" name="wr_7" value="<?php echo get_text($review_flag); ?>">
            <input type="hidden" name="wr_8" value="<?php echo get_text($review_reason); ?>">
            <?php echo $sungsan_option_hidden; ?>

            <div class="ss-field">
                <label for="wr_subject">제목 <span class="ss-required">필수</span></label>
                <input id="wr_subject" name="wr_subject" value="<?php echo get_text($sungsan_write_subject); ?>" required aria-describedby="ss-write-required-help">
            </div>

            <p id="ss-news-meta-help" class="ss-form-help">소속, 공개 범위, 행사일은 소식 목록에서 함께 보입니다. 해당 사항이 없으면 소속 없음과 기본 공개 범위를 그대로 두어도 됩니다.</p>

            <div class="ss-card-grid">
                <div class="ss-field">
                    <label for="ca_name">종류 <span class="ss-required">필수</span></label>
                    <select id="ca_name" name="ca_name" required aria-describedby="ss-write-required-help">
                        <option value="">종류 선택</option>
                        <?php foreach ($sungsan_news_category_options as $category) { ?>
                            <option value="<?php echo get_text($category); ?>"<?php echo sungsan_selected($ca_name, $category); ?>><?php echo get_text($category); ?></option>
                        <?php } ?>
                    </select>
                </div>
                <div class="ss-field">
                    <label for="wr_1">소속</label>
                    <select id="wr_1" name="wr_1" aria-describedby="ss-news-meta-help">
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
                    <select id="wr_2" name="wr_2" aria-describedby="ss-news-meta-help">
                        <?php foreach ($sungsan_visibility_options as $sungsan_visibility) { ?>
                            <option value="<?php echo get_text($sungsan_visibility); ?>"<?php echo sungsan_selected($visibility, $sungsan_visibility); ?>><?php echo get_text(sungsan_get_visibility_label($sungsan_visibility)); ?></option>
                        <?php } ?>
                    </select>
                </div>
                <div class="ss-field">
                    <label for="wr_3">행사 시작일</label>
                    <input id="wr_3" name="wr_3" type="date" value="<?php echo get_text($sungsan_event_start_date); ?>" aria-describedby="ss-news-meta-help">
                </div>
                <div class="ss-field">
                    <label for="wr_4">행사 종료일</label>
                    <input id="wr_4" name="wr_4" type="date" value="<?php echo get_text($sungsan_event_end_date); ?>" aria-describedby="ss-news-meta-help">
                </div>
            </div>

            <div class="ss-field">
                <label for="wr_content">본문 <span class="ss-required">필수</span></label>
                <?php if ($sungsan_write_min || $sungsan_write_max) { ?>
                    <p id="char_cnt" class="ss-form-help" aria-live="polite"><span id="char_count"></span>글자</p>
                <?php } ?>
                <textarea id="wr_content" name="wr_content" required aria-describedby="ss-write-required-help<?php if ($sungsan_write_min || $sungsan_write_max) { ?> char_cnt<?php } ?>" <?php if ($sungsan_write_min || $sungsan_write_max) { ?>onkeyup="check_byte('wr_content', 'char_count');"<?php } ?>><?php echo get_text($sungsan_write_content); ?></textarea>
            </div>

            <?php if ($sungsan_write_uses_files) { ?>
                <p id="ss-attachment-help" class="ss-form-help ss-attachment-help">사진·영상과 문서 파일을 첨부할 수 있습니다. 파일 한 개당 <?php echo number_format((int) $sungsan_upload_limit_mb); ?>MB 이하로 올려 주세요. PHP, HTML, JS, SVG, .htaccess, .user.ini처럼 브라우저나 서버에서 실행될 수 있는 파일은 업로드할 수 없습니다. shell.php7, shell.php8, shell.php.jpg처럼 실행형 또는 여러 확장자를 붙인 파일도 차단됩니다.</p>
                <?php for ($i = 0; $i < $sungsan_write_file_count; $i++) { ?>
                    <?php
                    $sungsan_write_file = isset($sungsan_write_files[$i]) ? $sungsan_write_files[$i] : array();
                    $sungsan_write_file_exists = isset($sungsan_write_file['file']) ? $sungsan_write_file['file'] : '';
                    $sungsan_write_file_source = isset($sungsan_write_file['source']) ? $sungsan_write_file['source'] : '';
                    $sungsan_write_file_size = isset($sungsan_write_file['size']) ? $sungsan_write_file['size'] : '';
                    $sungsan_write_file_delete_id = 'bf_file_del_'.$i;
                    ?>
                    <div class="ss-field">
                        <label for="bf_file_<?php echo $i + 1; ?>">첨부 파일 <?php echo $i + 1; ?></label>
                        <input type="file" name="bf_file[]" id="bf_file_<?php echo $i + 1; ?>" accept="<?php echo get_text($sungsan_attachment_accept); ?>" aria-describedby="ss-attachment-help">
                        <?php if ($sungsan_write_mode === 'u' && $sungsan_write_file_exists !== '') { ?>
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

            <?php if ($sungsan_uses_captcha && $sungsan_captcha_html !== '') { ?>
                <div class="ss-field ss-captcha">
                    <?php echo $sungsan_captcha_html; ?>
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
            <?php echo $sungsan_editor_js; ?>

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

            <?php echo $sungsan_captcha_js; ?>

            document.getElementById('btn_submit').disabled = true;

            return true;
        }
        </script>
    </div>
</section>
