<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $is_member;

if (!isset($write) || !is_array($write)) {
    alert('첨부 파일 권한을 확인할 수 없습니다.');
}

if (!function_exists('sungsan_can_read_news_post')) {
    alert('첨부 파일 권한을 확인할 수 없습니다.');
}

$visibility = isset($write['wr_2']) ? $write['wr_2'] : 'member';
$is_review_restricted = function_exists('sungsan_is_review_restricted') && sungsan_is_review_restricted($write);
$sungsan_show_login_redirect = !$is_member && !$is_review_restricted;

if (!sungsan_can_read_news_post($write)) {
    if ($is_review_restricted) {
        $message = '운영자 검토 전 비공개 첨부 파일입니다.';
    } elseif ($sungsan_show_login_redirect) {
        $message = sungsan_get_visibility_label($visibility).' 공개 첨부 파일입니다. 권한이 있는 계정으로 로그인하면 첨부를 내려받을 수 있습니다.';
    } else {
        $message = '현재 계정으로는 이 첨부 파일을 내려받을 수 없습니다. '.sungsan_get_visibility_label($visibility).' 공개 첨부 파일은 해당 권한이 필요합니다.';
    }

    if ($sungsan_show_login_redirect) {
        $sungsan_news_download_return_url = get_pretty_url($bo_table, $wr_id);
        $sungsan_news_download_login_url = sungsan_login_url($sungsan_news_download_return_url);
        alert($message, $sungsan_news_download_login_url);
    }

    alert($message);
}
