<?php
if (!defined('_GNUBOARD_')) {
    exit;
}
?>
<article class="ss-section">
    <div class="ss-container">
        <header class="ss-panel" style="margin-bottom:24px">
            <h1 class="ss-section-title"><?php echo get_text($view['wr_subject']); ?></h1>
            <div class="ss-meta" style="margin-top:12px">
                <span><?php echo $view['name']; ?></span>
                <span><?php echo $view['datetime']; ?></span>
                <span>조회 <?php echo number_format($view['wr_hit']); ?></span>
            </div>
        </header>
        <div class="ss-panel"><?php echo get_view_thumbnail($view['content']); ?></div>
        <div class="ss-filter-bar" style="margin-top:24px">
            <a class="ss-button secondary" href="<?php echo $list_href; ?>">목록</a>
            <?php if ($update_href) { ?><a class="ss-button secondary" href="<?php echo $update_href; ?>">수정</a><?php } ?>
            <?php if ($delete_href) { ?><a class="ss-button secondary" href="<?php echo $delete_href; ?>" onclick="del(this.href); return false;">삭제</a><?php } ?>
        </div>
    </div>
</article>

