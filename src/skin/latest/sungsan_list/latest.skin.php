<?php
if (!defined('_GNUBOARD_')) {
    exit;
}
?>
<div class="ss-post-list">
<?php for ($i = 0; $i < count($list); $i++) { ?>
    <a class="ss-post-row" href="<?php echo get_text($list[$i]['href']); ?>">
        <p class="ss-post-title"><?php echo get_text($list[$i]['subject']); ?></p>
        <div class="ss-meta">
            <?php if (!empty($list[$i]['ca_name'])) { ?>
                <span class="ss-badge"><?php echo get_text($list[$i]['ca_name']); ?></span>
            <?php } ?>
            <span><?php echo get_text($list[$i]['datetime2']); ?></span>
        </div>
    </a>
<?php } ?>
<?php if (count($list) === 0) { ?>
    <div class="ss-post-row">
        <p class="ss-post-title">등록된 글이 없습니다.</p>
    </div>
<?php } ?>
</div>
