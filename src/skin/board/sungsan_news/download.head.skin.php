<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!isset($write) || !is_array($write)) {
    alert('첨부 파일 권한을 확인할 수 없습니다.');
}

if (!function_exists('sungsan_can_read_visibility')) {
    alert('첨부 파일 권한을 확인할 수 없습니다.');
}

$visibility = isset($write['wr_2']) ? $write['wr_2'] : 'member';

if (!sungsan_can_read_visibility($visibility)) {
    $visibility_label = function_exists('sungsan_get_visibility_label')
        ? sungsan_get_visibility_label($visibility)
        : '회원';
    $message = $visibility_label.' 공개 첨부 파일입니다. 로그인 후 권한을 확인해 주세요.';

    if (!empty($member['mb_id'])) {
        alert($message);
    }

    alert($message, G5_BBS_URL.'/login.php?wr_id='.$wr_id.'&amp;'.$qstr.'&amp;url='.urlencode(get_pretty_url($bo_table, $wr_id)));
}
