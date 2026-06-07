<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

global $is_member;

if (!$is_member) {
    $message = '회원 전용 자유게시판 첨부 파일입니다. 로그인하면 첨부를 내려받을 수 있습니다.';
    $sungsan_free_download_login_url = G5_BBS_URL.'/login.php?wr_id='.$wr_id.'&'.$qstr.'&url='.urlencode(get_pretty_url($bo_table, $wr_id));

    alert($message, $sungsan_free_download_login_url);
}
