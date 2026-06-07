<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

if (!function_exists('sungsan_reject_blocked_uploads')) {
    alert('첨부 파일 보안 검사를 확인할 수 없습니다.');
}

if (!function_exists('sungsan_preserve_news_migration_fields')) {
    alert('소식 이전 검토 정보를 확인할 수 없습니다.');
}

if (!function_exists('sungsan_normalize_news_write_fields')) {
    alert('소식 메타 정보를 확인할 수 없습니다.');
}

sungsan_preserve_news_migration_fields();
sungsan_normalize_news_write_fields();
sungsan_reject_blocked_uploads($_FILES);
