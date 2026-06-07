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

function sungsan_get_member_role_label($level)
{
    $level = (int) $level;

    if ($level >= 10) {
        return '운영자';
    }

    if ($level >= 6) {
        return '임원';
    }

    if ($level >= 2) {
        return '일반 회원';
    }

    return '승인 대기';
}

function sungsan_clean_board_id($bo_table)
{
    return preg_replace('/[^a-z0-9_]/i', '', (string) $bo_table);
}

function sungsan_board_href($bo_table, $wr_id = 0)
{
    $href = G5_BBS_URL.'/board.php?bo_table='.urlencode($bo_table);

    if ($wr_id) {
        $href .= '&amp;wr_id='.(int) $wr_id;
    }

    return $href;
}

function sungsan_latest_board_posts($bo_table, $args = array())
{
    global $g5;

    if (!isset($g5['write_prefix']) || !function_exists('sql_query')) {
        return array();
    }

    $board_id = sungsan_clean_board_id($bo_table);
    if (!$board_id) {
        return array();
    }

    $limit = isset($args['limit']) ? max(1, min(10, (int) $args['limit'])) : 5;
    $where = array('wr_is_comment = 0');

    if (!empty($args['category'])) {
        $categories = is_array($args['category']) ? $args['category'] : array($args['category']);
        $escaped = array();

        foreach ($categories as $category) {
            $escaped[] = "'".sql_escape_string($category)."'";
        }

        $where[] = 'ca_name in ('.implode(',', $escaped).')';
    }

    if (!empty($args['groupSlug'])) {
        $where[] = "wr_1 = '".sql_escape_string($args['groupSlug'])."'";
    }

    if (!empty($args['upcoming'])) {
        $today = defined('G5_TIME_YMD') ? G5_TIME_YMD : date('Y-m-d');
        $where[] = "wr_3 >= '".sql_escape_string($today)."'";
        $order = 'wr_3 asc, wr_datetime desc';
    } else {
        $order = 'wr_datetime desc, wr_id desc';
    }

    $write_table = $g5['write_prefix'].$board_id;
    $sql = " select wr_id, wr_subject, ca_name, wr_datetime, wr_hit, wr_1, wr_2, wr_3, wr_4
             from {$write_table}
             where ".implode(' and ', $where)."
             order by {$order}
             limit {$limit} ";
    $result = sql_query($sql, false);
    $posts = array();

    if (!$result) {
        return $posts;
    }

    while ($row = sql_fetch_array($result)) {
        $row['href'] = sungsan_board_href($board_id, $row['wr_id']);
        $row['subject'] = get_text($row['wr_subject']);
        $row['date'] = substr($row['wr_datetime'], 0, 10);
        $posts[] = $row;
    }

    return $posts;
}
