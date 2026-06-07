<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('sungsan_reject_blocked_uploads')) {
    alert('첨부 파일 보안 검사를 확인할 수 없습니다.');
}

sungsan_reject_blocked_uploads($_FILES);
