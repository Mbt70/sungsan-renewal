<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $is_member;

$visibility = isset($view['wr_2']) ? $view['wr_2'] : 'member';
$group_label = sungsan_get_group_label(isset($view['wr_1']) ? $view['wr_1'] : '');
$can_read = sungsan_can_read_news_post($view);
$sungsan_show_login_cta = !$is_member && !sungsan_is_review_restricted($view);
$sungsan_login_url = G5_BBS_URL.'/login.php?url='.urlencode($_SERVER['REQUEST_URI']);
if (sungsan_is_review_restricted($view)) {
    $access_message = '운영자 검토 전 비공개 글입니다.';
} elseif ($sungsan_show_login_cta) {
    $access_message = '이 글은 '.sungsan_get_visibility_label($visibility).' 공개 글입니다. 권한이 있는 계정으로 로그인하면 본문과 첨부를 볼 수 있습니다.';
} else {
    $access_message = '현재 계정으로는 이 글을 열람할 수 없습니다. '.sungsan_get_visibility_label($visibility).' 공개 글은 해당 권한이 필요합니다.';
}
?>
<article class="ss-section">
    <div class="ss-container">
        <header class="ss-panel ss-post-header">
            <h1 class="ss-section-title"><?php echo get_text($view['wr_subject']); ?></h1>
            <div class="ss-meta">
                <?php if ($view['ca_name']) { ?><span class="ss-badge"><?php echo get_text($view['ca_name']); ?></span><?php } ?>
                <?php if ($group_label) { ?><span class="ss-badge accent"><?php echo get_text($group_label); ?></span><?php } ?>
                <span><?php echo sungsan_get_visibility_label($visibility); ?></span>
                <span><?php echo get_text($view['wr_name']); ?></span>
                <span><?php echo get_text($view['datetime']); ?></span>
                <span>조회 <?php echo number_format((int) $view['wr_hit']); ?></span>
            </div>
        </header>

        <div class="ss-panel ss-content-panel">
            <?php if ($can_read) { ?>
                <div class="ss-content">
                    <?php echo get_view_thumbnail($view['content']); ?>
                </div>

                <?php if (!empty($view['file']['count'])) { ?>
                    <section class="ss-attachment-section">
                        <h2 class="ss-section-title">첨부 파일</h2>
                        <div class="ss-attachment-list">
                        <?php for ($i = 0; $i < $view['file']['count']; $i++) { ?>
                            <?php if (!empty($view['file'][$i]['source'])) { ?>
                                <a class="ss-attachment-row" href="<?php echo get_text($view['file'][$i]['href']); ?>">
                                    <span class="ss-file-icon" aria-hidden="true"></span>
                                    <span><?php echo get_text($view['file'][$i]['source']); ?></span>
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
                    <a class="ss-button secondary" href="<?php echo get_text($list_href); ?>">목록으로 돌아가기</a>
                <?php } ?>
            <?php } ?>
        </div>

        <div class="ss-action-bar">
            <a class="ss-button secondary" href="<?php echo get_text($list_href); ?>">목록</a>
            <?php if ($update_href) { ?><a class="ss-button secondary" href="<?php echo get_text($update_href); ?>">수정</a><?php } ?>
            <?php if ($delete_href) { ?><a class="ss-button secondary" href="<?php echo get_text($delete_href); ?>" onclick="del(this.href); return false;">삭제</a><?php } ?>
        </div>
    </div>
</article>
