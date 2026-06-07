<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!isset($write) || !is_array($write)) {
    alert('첨부 파일 권한을 확인할 수 없습니다.');
}

if (!function_exists('sungsan_can_read_news_post')) {
    alert('첨부 파일 권한을 확인할 수 없습니다.');
}

$visibility = isset($write['wr_2']) ? $write['wr_2'] : 'member';

if (!sungsan_can_read_news_post($write)) {
    $message = function_exists('sungsan_is_review_restricted') && sungsan_is_review_restricted($write)
        ? '운영자 검토 전 비공개 첨부 파일입니다.'
        : sungsan_get_visibility_label($visibility).' 공개 첨부 파일입니다. 로그인 후 권한을 확인해 주세요.';

    if (!empty($member['mb_id'])) {
        alert($message);
    }

    alert($message, G5_BBS_URL.'/login.php?wr_id='.$wr_id.'&amp;'.$qstr.'&amp;url='.urlencode(get_pretty_url($bo_table, $wr_id)));
}
