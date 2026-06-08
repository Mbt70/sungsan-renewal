<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

$sungsan_latest_rows = (isset($list) && is_array($list)) ? $list : array();
?>
<div class="ss-post-list">
<?php for ($i = 0; $i < count($sungsan_latest_rows); $i++) { ?>
    <?php
    $sungsan_latest_row = $sungsan_latest_rows[$i];
    $sungsan_latest_href = isset($sungsan_latest_row['href']) ? $sungsan_latest_row['href'] : '#';
    $sungsan_latest_subject = isset($sungsan_latest_row['subject']) ? $sungsan_latest_row['subject'] : '';
    $sungsan_latest_category = isset($sungsan_latest_row['ca_name']) ? $sungsan_latest_row['ca_name'] : '';
    $sungsan_latest_date = isset($sungsan_latest_row['datetime2']) ? $sungsan_latest_row['datetime2'] : '';
    ?>
    <a class="ss-post-row" href="<?php echo get_text($sungsan_latest_href); ?>">
        <p class="ss-post-title"><?php echo get_text($sungsan_latest_subject); ?></p>
        <div class="ss-meta">
            <?php if ($sungsan_latest_category !== '') { ?>
                <span class="ss-badge"><?php echo get_text($sungsan_latest_category); ?></span>
            <?php } ?>
            <span><?php echo get_text($sungsan_latest_date); ?></span>
        </div>
    </a>
<?php } ?>
<?php if (count($sungsan_latest_rows) === 0) { ?>
    <div class="ss-post-row">
        <p class="ss-post-title">등록된 글이 없습니다.</p>
    </div>
<?php } ?>
</div>
