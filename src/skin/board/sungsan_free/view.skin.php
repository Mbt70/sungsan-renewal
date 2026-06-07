<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $is_member;

$sungsan_free_login_url = G5_BBS_URL.'/login.php?url='.urlencode($_SERVER['REQUEST_URI']);
?>
<article class="ss-section">
    <div class="ss-container">
        <header class="ss-panel ss-post-header">
            <h1 class="ss-section-title"><?php echo get_text($view['wr_subject']); ?></h1>
            <div class="ss-meta">
                <span><?php echo get_text($view['wr_name']); ?></span>
                <span><?php echo get_text($view['datetime']); ?></span>
                <span>조회 <?php echo number_format((int) $view['wr_hit']); ?></span>
            </div>
        </header>
        <div class="ss-panel ss-content-panel">
            <?php if ($is_member) { ?>
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
                <p class="ss-access-note">회원 전용 자유게시판 글입니다. 로그인하면 본문과 첨부를 볼 수 있습니다.</p>
                <a class="ss-button" href="<?php echo get_text($sungsan_free_login_url); ?>">로그인</a>
            <?php } ?>
        </div>
        <div class="ss-action-bar">
            <a class="ss-button secondary" href="<?php echo get_text($list_href); ?>">목록</a>
            <?php if ($update_href) { ?><a class="ss-button secondary" href="<?php echo get_text($update_href); ?>">수정</a><?php } ?>
            <?php if ($delete_href) { ?><a class="ss-button secondary" href="<?php echo get_text($delete_href); ?>" onclick="del(this.href); return false;">삭제</a><?php } ?>
        </div>
    </div>
</article>
