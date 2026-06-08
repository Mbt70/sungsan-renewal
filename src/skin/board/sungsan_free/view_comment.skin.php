<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

$sungsan_comment_rows = (isset($list) && is_array($list)) ? $list : array();
$sungsan_comment_count = count($sungsan_comment_rows);
$sungsan_comment_board_id = isset($bo_table) ? $bo_table : 'free';
$sungsan_comment_wr_id = isset($wr_id) ? (int) $wr_id : 0;
$sungsan_comment_min = isset($comment_min) ? (int) $comment_min : 0;
$sungsan_comment_max = isset($comment_max) ? (int) $comment_max : 0;
$sungsan_comment_work = isset($w) && in_array($w, array('c', 'cu'), true) ? $w : 'c';
$sungsan_comment_current_id = isset($c_id) ? (int) $c_id : 0;
$sungsan_comment_sca = isset($sca) ? $sca : '';
$sungsan_comment_sfl = isset($sfl) ? $sfl : '';
$sungsan_comment_stx = isset($stx) ? $stx : '';
$sungsan_comment_spt = isset($spt) ? $spt : '';
$sungsan_comment_page = isset($page) ? $page : '';
$sungsan_comment_content_value = isset($c_wr_content) ? $c_wr_content : '';
?>
<script>
var char_min = parseInt(<?php echo $sungsan_comment_min; ?>, 10);
var char_max = parseInt(<?php echo $sungsan_comment_max; ?>, 10);
</script>

<section id="bo_vc" class="ss-comment-section" aria-labelledby="ss-comment-title">
    <div class="ss-section-header">
        <h2 id="ss-comment-title" class="ss-section-title">댓글 <?php echo number_format($sungsan_comment_count); ?></h2>
    </div>

    <?php if ($sungsan_comment_count > 0) { ?>
        <div class="ss-comment-list">
            <?php for ($i = 0; $i < count($sungsan_comment_rows); $i++) { ?>
                <?php
                $sungsan_comment_row = $sungsan_comment_rows[$i];
                $sungsan_comment_id = isset($sungsan_comment_row['wr_id']) ? (int) $sungsan_comment_row['wr_id'] : 0;
                $sungsan_comment_reply = isset($sungsan_comment_row['wr_comment_reply']) ? $sungsan_comment_row['wr_comment_reply'] : '';
                $sungsan_comment_depth = min(5, strlen($sungsan_comment_reply));
                $sungsan_comment_author = isset($sungsan_comment_row['wr_name']) ? $sungsan_comment_row['wr_name'] : '';
                $sungsan_comment_datetime = isset($sungsan_comment_row['datetime']) ? $sungsan_comment_row['datetime'] : '';
                $sungsan_comment_content = isset($sungsan_comment_row['content']) ? $sungsan_comment_row['content'] : '';
                $sungsan_comment_saved_content = isset($sungsan_comment_row['content1']) ? $sungsan_comment_row['content1'] : '';
                $sungsan_comment_secret = isset($sungsan_comment_row['wr_option']) && strpos($sungsan_comment_row['wr_option'], 'secret') !== false;
                $sungsan_comment_reply_href = $comment_common_url.'&c_id='.$sungsan_comment_id.'&w=c#bo_vc_w';
                $sungsan_comment_edit_href = $comment_common_url.'&c_id='.$sungsan_comment_id.'&w=cu#bo_vc_w';
                $sungsan_comment_delete_href = isset($sungsan_comment_row['del_link']) ? str_replace('&amp;', '&', $sungsan_comment_row['del_link']) : '';
                $sungsan_comment_can_act = !empty($sungsan_comment_row['is_reply']) || !empty($sungsan_comment_row['is_edit']) || !empty($sungsan_comment_row['is_del']);
                ?>
                <article id="c_<?php echo $sungsan_comment_id; ?>" class="ss-comment<?php echo $sungsan_comment_depth ? ' is-reply depth-'.$sungsan_comment_depth : ''; ?>">
                    <header class="ss-comment-header">
                        <strong><?php echo get_text($sungsan_comment_author); ?></strong>
                        <?php if ($sungsan_comment_secret) { ?><span class="ss-badge">비밀댓글</span><?php } ?>
                        <time datetime="<?php echo get_text($sungsan_comment_datetime); ?>"><?php echo get_text($sungsan_comment_datetime); ?></time>
                    </header>
                    <div class="ss-comment-content">
                        <?php echo $sungsan_comment_content; ?>
                    </div>

                    <div id="edit_<?php echo $sungsan_comment_id; ?>" class="ss-comment-placeholder" hidden></div>
                    <div id="reply_<?php echo $sungsan_comment_id; ?>" class="ss-comment-placeholder" hidden></div>
                    <input type="hidden" id="secret_comment_<?php echo $sungsan_comment_id; ?>" value="<?php echo $sungsan_comment_secret ? 'secret' : ''; ?>">
                    <textarea id="save_comment_<?php echo $sungsan_comment_id; ?>" hidden><?php echo get_text($sungsan_comment_saved_content, 0); ?></textarea>

                    <?php if ($sungsan_comment_can_act) { ?>
                        <div class="ss-comment-actions">
                            <?php if (!empty($sungsan_comment_row['is_reply'])) { ?>
                                <a href="<?php echo get_text($sungsan_comment_reply_href); ?>" onclick="comment_box('<?php echo $sungsan_comment_id; ?>', 'c'); return false;">답글</a>
                            <?php } ?>
                            <?php if (!empty($sungsan_comment_row['is_edit'])) { ?>
                                <a href="<?php echo get_text($sungsan_comment_edit_href); ?>" onclick="comment_box('<?php echo $sungsan_comment_id; ?>', 'cu'); return false;">수정</a>
                            <?php } ?>
                            <?php if (!empty($sungsan_comment_row['is_del']) && $sungsan_comment_delete_href !== '') { ?>
                                <a href="<?php echo get_text($sungsan_comment_delete_href); ?>" onclick="return comment_delete();">삭제</a>
                            <?php } ?>
                        </div>
                    <?php } ?>
                </article>
            <?php } ?>
        </div>
    <?php } else { ?>
        <p class="ss-comment-empty">아직 등록된 댓글이 없습니다.</p>
    <?php } ?>
</section>

<?php if ($is_comment_write) { ?>
    <section id="bo_vc_w" class="ss-panel ss-comment-form" aria-labelledby="ss-comment-form-title">
        <h2 id="ss-comment-form-title">댓글 쓰기</h2>
        <p id="ss-comment-help" class="ss-form-help">회원 간 안부와 의견을 남기는 공간입니다. 개인정보나 공개하기 어려운 내용은 입력 전 다시 확인해 주세요.</p>
        <form name="fviewcomment" id="fviewcomment" action="<?php echo get_text($comment_action_url); ?>" onsubmit="return fviewcomment_submit(this);" method="post" autocomplete="off">
            <input type="hidden" name="w" value="<?php echo get_text($sungsan_comment_work); ?>" id="w">
            <input type="hidden" name="bo_table" value="<?php echo get_text($sungsan_comment_board_id); ?>">
            <input type="hidden" name="wr_id" value="<?php echo (int) $sungsan_comment_wr_id; ?>">
            <input type="hidden" name="comment_id" value="<?php echo get_text($sungsan_comment_current_id); ?>" id="comment_id">
            <input type="hidden" name="sca" value="<?php echo get_text($sungsan_comment_sca); ?>">
            <input type="hidden" name="sfl" value="<?php echo get_text($sungsan_comment_sfl); ?>">
            <input type="hidden" name="stx" value="<?php echo get_text($sungsan_comment_stx); ?>">
            <input type="hidden" name="spt" value="<?php echo get_text($sungsan_comment_spt); ?>">
            <input type="hidden" name="page" value="<?php echo get_text($sungsan_comment_page); ?>">
            <input type="hidden" name="is_good" value="">
            <input type="hidden" name="token" value="">

            <label class="ss-comment-content-label" for="wr_content">댓글 내용 <span class="ss-required">필수</span></label>
            <?php if ($sungsan_comment_min || $sungsan_comment_max) { ?>
                <p id="char_cnt" class="ss-form-help" aria-live="polite"><span id="char_count"></span>글자</p>
            <?php } ?>

            <textarea id="wr_content" name="wr_content" maxlength="10000" required class="required" aria-describedby="ss-comment-help<?php if ($sungsan_comment_min || $sungsan_comment_max) { ?> char_cnt<?php } ?>" <?php if ($sungsan_comment_min || $sungsan_comment_max) { ?>onkeyup="check_byte('wr_content', 'char_count');"<?php } ?>><?php echo get_text($sungsan_comment_content_value); ?></textarea>

            <div class="ss-comment-form-footer">
                <label class="ss-checkline" for="wr_secret">
                    <input type="checkbox" name="wr_secret" value="secret" id="wr_secret">
                    비밀댓글
                </label>
                <button type="submit" id="btn_submit" class="ss-button">댓글 등록</button>
            </div>
        </form>
    </section>

    <script>
    var save_before = '';

    function fviewcomment_submit(f)
    {
        var pattern = /(^\s*)|(\s*$)/g;

        f.is_good.value = 0;
        f.wr_content.value = f.wr_content.value.replace(pattern, '');

        var content = '';
        $.ajax({
            url: g5_bbs_url + '/ajax.filter.php',
            type: 'POST',
            data: {
                subject: '',
                content: f.wr_content.value
            },
            dataType: 'json',
            async: false,
            cache: false,
            success: function(data) {
                content = data.content;
            }
        });

        if (content) {
            alert('내용에 금지단어(' + content + ')가 포함되어 있습니다.');
            f.wr_content.focus();
            return false;
        }

        if (char_min > 0 || char_max > 0) {
            check_byte('wr_content', 'char_count');
            var cnt = parseInt(document.getElementById('char_count').innerHTML, 10);

            if (char_min > 0 && char_min > cnt) {
                alert('댓글은 ' + char_min + '글자 이상 입력해 주세요.');
                f.wr_content.focus();
                return false;
            }

            if (char_max > 0 && char_max < cnt) {
                alert('댓글은 ' + char_max + '글자 이하로 입력해 주세요.');
                f.wr_content.focus();
                return false;
            }
        } else if (!f.wr_content.value) {
            alert('댓글 내용을 입력해 주세요.');
            f.wr_content.focus();
            return false;
        }

        set_comment_token(f);
        document.getElementById('btn_submit').disabled = true;

        return true;
    }

    function comment_box(comment_id, work)
    {
        var el_id = comment_id ? (work === 'cu' ? 'edit_' + comment_id : 'reply_' + comment_id) : 'bo_vc_w';
        var respond = document.getElementById('fviewcomment');

        if (!respond || !document.getElementById(el_id) || save_before === el_id) {
            return;
        }

        if (save_before && document.getElementById(save_before)) {
            document.getElementById(save_before).setAttribute('hidden', 'hidden');
        }

        document.getElementById(el_id).removeAttribute('hidden');
        document.getElementById(el_id).appendChild(respond);
        document.getElementById('wr_content').value = '';

        if (work === 'cu' && document.getElementById('save_comment_' + comment_id)) {
            document.getElementById('wr_content').value = document.getElementById('save_comment_' + comment_id).value;
        }

        if (document.getElementById('wr_secret')) {
            document.getElementById('wr_secret').checked = !!(comment_id && document.getElementById('secret_comment_' + comment_id) && document.getElementById('secret_comment_' + comment_id).value);
        }

        document.getElementById('comment_id').value = comment_id;
        document.getElementById('w').value = work;

        if (typeof check_byte === 'function' && document.getElementById('char_count')) {
            check_byte('wr_content', 'char_count');
        }

        save_before = el_id;
    }

    function comment_delete()
    {
        return confirm('이 댓글을 삭제하시겠습니까?');
    }

    comment_box('<?php echo $sungsan_comment_current_id ? (int) $sungsan_comment_current_id : ''; ?>', '<?php echo get_text($sungsan_comment_work); ?>');
    </script>
<?php } ?>
