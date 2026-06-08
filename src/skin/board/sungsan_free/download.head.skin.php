<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $is_member;

$sungsan_free_download_is_member = !empty($is_member);

if (!$sungsan_free_download_is_member) {
    $message = '회원 전용 자유게시판 첨부 파일입니다. 로그인하면 첨부를 내려받을 수 있습니다.';
    $sungsan_free_download_return_url = get_pretty_url($bo_table, $wr_id);
    $sungsan_free_download_login_url = sungsan_login_url($sungsan_free_download_return_url);

    alert($message, $sungsan_free_download_login_url);
}
