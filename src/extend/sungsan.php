<?php
if (!defined('_GNUBOARD_')) {
    exit;
}

define('SUNGSAN_NEWS_BOARD', 'news');
define('SUNGSAN_FREE_BOARD', 'free');

$sungsan_news_categories = array('공지', '행사', '자료', '규정', '활동소식');

$sungsan_groups = array(
    'notice' => '공지',
    'event' => '행사',
    'executive' => '임원회',
    'operations' => '운영위원회',
    'fund' => '기금관리위원회',
    'talent' => '인재양성부',
    'welfare' => '사회복지부',
    'culture' => '문화부',
    'economy' => '경제부',
    'sungwoo' => '성우회',
    'culture-club' => '문화클럽',
    'leaders-club' => '리더스클럽',
    'mountain-club' => '산악회',
    'newsletter' => '성산회보',
    'general-meeting' => '총회자료',
    'policy' => '규정',
    'photo' => '사진자료',
    'essay' => '좋은글',
    'etc' => '기타',
);

$sungsan_visibility_labels = array(
    'public' => '누구나',
    'member' => '회원',
    'officer' => '임원',
    'admin' => '운영자',
);

function sungsan_get_group_label($slug)
{
    global $sungsan_groups;

    return isset($sungsan_groups[$slug]) ? $sungsan_groups[$slug] : '';
}

function sungsan_get_visibility_label($visibility)
{
    global $sungsan_visibility_labels;

    return isset($sungsan_visibility_labels[$visibility]) ? $sungsan_visibility_labels[$visibility] : '회원';
}

function sungsan_can_read_visibility($visibility)
{
    global $member, $is_admin;

    if ($visibility === 'public' || $visibility === '') {
        return true;
    }

    if ($is_admin) {
        return true;
    }

    $level = isset($member['mb_level']) ? (int) $member['mb_level'] : 0;

    if ($visibility === 'member') {
        return $level >= 2;
    }

    if ($visibility === 'officer') {
        return $level >= 6;
    }

    return false;
}

function sungsan_selected($current, $value)
{
    return $current === $value ? ' selected="selected"' : '';
}

function sungsan_active_class($current, $value)
{
    return $current === $value ? ' active' : '';
}

