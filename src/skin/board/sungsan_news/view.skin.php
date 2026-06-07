<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

$visibility = isset($view['wr_2']) ? $view['wr_2'] : 'member';
$group_label = sungsan_get_group_label(isset($view['wr_1']) ? $view['wr_1'] : '');
$can_read = sungsan_can_read_visibility($visibility);
?>
<article class="ss-section">
    <div class="ss-container">
        <header class="ss-panel ss-post-header">
            <h1 class="ss-section-title"><?php echo get_text($view['wr_subject']); ?></h1>
            <div class="ss-meta">
                <?php if ($view['ca_name']) { ?><span class="ss-badge"><?php echo get_text($view['ca_name']); ?></span><?php } ?>
                <?php if ($group_label) { ?><span class="ss-badge accent"><?php echo get_text($group_label); ?></span><?php } ?>
                <span><?php echo sungsan_get_visibility_label($visibility); ?></span>
                <span><?php echo $view['name']; ?></span>
                <span><?php echo $view['datetime']; ?></span>
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
                                <a class="ss-attachment-row" href="<?php echo $view['file'][$i]['href']; ?>">
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
                <p class="ss-access-note">이 글은 <?php echo sungsan_get_visibility_label($visibility); ?> 공개 글입니다. 로그인 후 확인해 주세요.</p>
                <a class="ss-button" href="<?php echo G5_BBS_URL; ?>/login.php?url=<?php echo urlencode($_SERVER['REQUEST_URI']); ?>">로그인</a>
            <?php } ?>
        </div>

        <div class="ss-action-bar">
            <a class="ss-button secondary" href="<?php echo $list_href; ?>">목록</a>
            <?php if ($update_href) { ?><a class="ss-button secondary" href="<?php echo $update_href; ?>">수정</a><?php } ?>
            <?php if ($delete_href) { ?><a class="ss-button secondary" href="<?php echo $delete_href; ?>" onclick="del(this.href); return false;">삭제</a><?php } ?>
        </div>
    </div>
</article>
