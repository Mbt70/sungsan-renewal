<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $is_member;

$sungsan_view_board_id = isset($bo_table) ? $bo_table : 'news';
$sungsan_view_is_member = !empty($is_member);
$sungsan_view_subject = isset($view['wr_subject']) ? $view['wr_subject'] : '';
$sungsan_view_writer = isset($view['wr_name']) ? $view['wr_name'] : '';
$sungsan_view_date = isset($view['datetime']) ? $view['datetime'] : '';
$sungsan_view_date_attr = preg_match('/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/', $sungsan_view_date) ? str_replace(' ', 'T', $sungsan_view_date) : '';
$sungsan_view_hits = isset($view['wr_hit']) ? (int) $view['wr_hit'] : 0;
$sungsan_view_content = isset($view['content']) ? $view['content'] : '';
$sungsan_view_category = isset($view['ca_name']) ? $view['ca_name'] : '';
$sungsan_view_list_href = isset($list_href) ? $list_href : get_pretty_url($sungsan_view_board_id);
$sungsan_view_update_href = isset($update_href) ? $update_href : '';
$sungsan_view_delete_href = isset($delete_href) ? $delete_href : '';
$sungsan_view_files = (isset($view['file']) && is_array($view['file'])) ? $view['file'] : array();
$sungsan_view_file_count = isset($sungsan_view_files['count']) ? max(0, (int) $sungsan_view_files['count']) : 0;
$visibility = isset($view['wr_2']) ? $view['wr_2'] : 'member';
$visibility_label = get_text(sungsan_get_visibility_label($visibility));
$group_label = sungsan_get_group_label(isset($view['wr_1']) ? $view['wr_1'] : '');
$can_read = sungsan_can_read_news_post($view);
$sungsan_show_login_cta = !$sungsan_view_is_member && !sungsan_is_review_restricted($view);
$sungsan_request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
$sungsan_login_url = sungsan_login_url($sungsan_request_uri);
if (sungsan_is_review_restricted($view)) {
    $access_message = '운영자 검토 전 비공개 글입니다.';
} elseif ($sungsan_show_login_cta) {
    $access_message = '이 글은 '.$visibility_label.' 공개 글입니다. 권한이 있는 계정으로 로그인하면 본문과 첨부를 볼 수 있습니다.';
} else {
    $access_message = '현재 계정으로는 이 글을 열람할 수 없습니다. '.$visibility_label.' 공개 글은 해당 권한이 필요합니다.';
}
?>
<article class="ss-section">
    <div class="ss-container">
        <header class="ss-panel ss-post-header">
            <h1 class="ss-section-title"><?php echo get_text($sungsan_view_subject); ?></h1>
            <div class="ss-meta">
                <?php if ($sungsan_view_category !== '') { ?><span class="ss-badge"><?php echo get_text($sungsan_view_category); ?></span><?php } ?>
                <?php if ($group_label) { ?><span class="ss-badge accent"><?php echo get_text($group_label); ?></span><?php } ?>
                <span><?php echo get_text(sungsan_get_visibility_label($visibility)); ?></span>
                <span><?php echo get_text($sungsan_view_writer); ?></span>
                <?php if ($sungsan_view_date_attr !== '') { ?>
                    <time datetime="<?php echo get_text($sungsan_view_date_attr); ?>"><?php echo get_text($sungsan_view_date); ?></time>
                <?php } else { ?>
                    <span><?php echo get_text($sungsan_view_date); ?></span>
                <?php } ?>
                <span>조회 <?php echo number_format($sungsan_view_hits); ?></span>
            </div>
        </header>

        <div class="ss-panel ss-content-panel">
            <?php if ($can_read) { ?>
                <div class="ss-content">
                    <?php echo get_view_thumbnail($sungsan_view_content); ?>
                </div>

                <?php if ($sungsan_view_file_count > 0) { ?>
                    <section class="ss-attachment-section">
                        <h2 class="ss-section-title">첨부 파일</h2>
                        <div class="ss-attachment-list">
                        <?php for ($i = 0; $i < $sungsan_view_file_count; $i++) { ?>
                            <?php
                            $sungsan_view_file = isset($sungsan_view_files[$i]) ? $sungsan_view_files[$i] : array();
                            $sungsan_view_file_href = isset($sungsan_view_file['href']) ? $sungsan_view_file['href'] : '#';
                            $sungsan_view_file_source = isset($sungsan_view_file['source']) ? $sungsan_view_file['source'] : '';
                            ?>
                            <?php if ($sungsan_view_file_source !== '') { ?>
                                <a class="ss-attachment-row" href="<?php echo get_text($sungsan_view_file_href); ?>">
                                    <span class="ss-file-icon" aria-hidden="true"></span>
                                    <span><?php echo get_text($sungsan_view_file_source); ?></span>
                                    <strong>내려받기</strong>
                                </a>
                            <?php } ?>
                        <?php } ?>
                        </div>
                    </section>
                <?php } ?>
            <?php } else { ?>
                <p class="ss-access-note"><?php echo get_text($access_message); ?></p>
                <?php if ($sungsan_show_login_cta) { ?>
                    <a class="ss-button" href="<?php echo get_text($sungsan_login_url); ?>">로그인</a>
                <?php } else { ?>
                    <a class="ss-button secondary" href="<?php echo get_text($sungsan_view_list_href); ?>">목록으로 돌아가기</a>
                <?php } ?>
            <?php } ?>
        </div>

        <div class="ss-action-bar">
            <a class="ss-button secondary" href="<?php echo get_text($sungsan_view_list_href); ?>">목록</a>
            <?php if ($sungsan_view_update_href !== '') { ?><a class="ss-button secondary" href="<?php echo get_text($sungsan_view_update_href); ?>">수정</a><?php } ?>
            <?php if ($sungsan_view_delete_href !== '') { ?><a class="ss-button secondary" href="<?php echo get_text($sungsan_view_delete_href); ?>" onclick="del(this.href); return false;">삭제</a><?php } ?>
        </div>
    </div>
</article>
