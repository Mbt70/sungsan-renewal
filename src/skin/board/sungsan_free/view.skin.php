<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $is_member;

$sungsan_view_board_id = isset($bo_table) ? $bo_table : 'free';
$sungsan_view_is_member = !empty($is_member);
$sungsan_view_subject = isset($view['wr_subject']) ? $view['wr_subject'] : '';
$sungsan_view_writer = isset($view['wr_name']) ? $view['wr_name'] : '';
$sungsan_view_date = isset($view['datetime']) ? $view['datetime'] : '';
$sungsan_view_date_attr = preg_match('/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/', $sungsan_view_date) ? str_replace(' ', 'T', $sungsan_view_date) : '';
$sungsan_view_hits = isset($view['wr_hit']) ? (int) $view['wr_hit'] : 0;
$sungsan_view_content = isset($view['content']) ? $view['content'] : '';
$sungsan_view_list_href = isset($list_href) ? $list_href : get_pretty_url($sungsan_view_board_id);
$sungsan_view_update_href = isset($update_href) ? $update_href : '';
$sungsan_view_delete_href = isset($delete_href) ? $delete_href : '';
$sungsan_view_files = (isset($view['file']) && is_array($view['file'])) ? $view['file'] : array();
$sungsan_view_file_count = isset($sungsan_view_files['count']) ? max(0, (int) $sungsan_view_files['count']) : 0;
$sungsan_free_request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
$sungsan_free_login_url = sungsan_login_url($sungsan_free_request_uri);
?>
<article class="ss-section">
    <div class="ss-container">
        <header class="ss-panel ss-post-header">
            <h1 class="ss-section-title"><?php echo get_text($sungsan_view_subject); ?></h1>
            <div class="ss-meta">
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
            <?php if ($sungsan_view_is_member) { ?>
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
                <p class="ss-access-note">회원 전용 자유게시판 글입니다. 로그인하면 본문과 첨부를 볼 수 있습니다.</p>
                <a class="ss-button" href="<?php echo get_text($sungsan_free_login_url); ?>">로그인</a>
            <?php } ?>
        </div>
        <?php if ($sungsan_view_is_member) { include_once(G5_BBS_PATH.'/view_comment.php'); } ?>
        <div class="ss-action-bar">
            <a class="ss-button secondary" href="<?php echo get_text($sungsan_view_list_href); ?>">목록</a>
            <?php if ($sungsan_view_update_href !== '') { ?><a class="ss-button secondary" href="<?php echo get_text($sungsan_view_update_href); ?>">수정</a><?php } ?>
            <?php if ($sungsan_view_delete_href !== '') { ?><a class="ss-button secondary" href="<?php echo get_text($sungsan_view_delete_href); ?>" onclick="del(this.href); return false;">삭제</a><?php } ?>
        </div>
    </div>
</article>
