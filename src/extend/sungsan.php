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

function sungsan_load_group_overrides($defaults)
{
    if (!defined('G5_DATA_PATH')) {
        return $defaults;
    }

    $override_path = G5_DATA_PATH.'/sungsan.groups.php';
    if (!is_file($override_path)) {
        return $defaults;
    }

    $overrides = include $override_path;
    if (!is_array($overrides)) {
        return $defaults;
    }

    $valid_overrides = array();
    foreach ($overrides as $slug => $label) {
        $slug = trim((string) $slug);
        $label = trim((string) $label);

        if ($slug === '' || $label === '' || !preg_match('/^[a-z0-9-]+$/', $slug)) {
            continue;
        }

        $valid_overrides[$slug] = $label;
    }

    return array_replace($defaults, $valid_overrides);
}

$sungsan_groups = sungsan_load_group_overrides($sungsan_groups);

function sungsan_get_news_categories($board)
{
    global $sungsan_news_categories;

    $category_list = isset($board['bo_category_list']) ? trim((string) $board['bo_category_list']) : '';
    if ($category_list === '') {
        return $sungsan_news_categories;
    }

    $categories = array();
    foreach (explode('|', $category_list) as $category) {
        $category = trim((string) $category);
        if ($category === '') {
            continue;
        }

        $categories[] = $category;
    }

    $categories = array_values(array_unique($categories));

    return !empty($categories) ? $categories : $sungsan_news_categories;
}

function sungsan_get_current_news_categories()
{
    global $g5, $sungsan_news_categories;

    if (!isset($g5['board_table']) || !function_exists('sql_fetch') || !function_exists('sql_escape_string')) {
        return $sungsan_news_categories;
    }

    $board_row = sql_fetch(" select bo_category_list from {$g5['board_table']} where bo_table = '".sql_escape_string(SUNGSAN_NEWS_BOARD)."' ");
    if (!is_array($board_row)) {
        return $sungsan_news_categories;
    }

    return sungsan_get_news_categories($board_row);
}

function sungsan_get_news_category_at($categories, $preferred, $index)
{
    if (!is_array($categories)) {
        return $preferred;
    }

    if (in_array($preferred, $categories, true)) {
        return $preferred;
    }

    return isset($categories[$index]) ? $categories[$index] : $preferred;
}

function sungsan_get_news_categories_at($categories, $preferred, $indexes)
{
    if (!is_array($categories)) {
        return $preferred;
    }

    $selected = array();
    foreach ($preferred as $category) {
        if (in_array($category, $categories, true)) {
            $selected[] = $category;
        }
    }

    foreach ($indexes as $index) {
        if (isset($categories[$index])) {
            $selected[] = $categories[$index];
        }
    }

    $selected = array_values(array_unique($selected));

    return !empty($selected) ? $selected : $preferred;
}

$sungsan_visibility_labels = array(
    'public' => '누구나',
    'member' => '회원',
    'officer' => '임원',
    'admin' => '운영자',
);

$sungsan_blocked_upload_extensions = array(
    'php',
    'php3',
    'php4',
    'php5',
    'pht',
    'phtm',
    'phtml',
    'phar',
    'htm',
    'html',
    'xhtml',
    'shtm',
    'shtml',
    'htaccess',
    'htpasswd',
    'user.ini',
    'ini',
    'js',
    'mjs',
    'svg',
    'svgz',
    'cgi',
    'pl',
    'exe',
    'jsp',
    'asp',
    'inc',
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

function sungsan_is_review_restricted($post)
{
    return isset($post['wr_7']) && $post['wr_7'] === 'review_required';
}

function sungsan_can_read_news_post($post)
{
    global $is_admin;

    if (sungsan_is_review_restricted($post) && !$is_admin) {
        return false;
    }

    $visibility = isset($post['wr_2']) ? $post['wr_2'] : 'member';

    return sungsan_can_read_visibility($visibility);
}

function sungsan_preserve_news_migration_fields()
{
    global $w, $wr, $is_admin, $wr_5, $wr_6, $wr_7, $wr_8;

    if ($w !== 'u' || empty($wr) || !is_array($wr)) {
        return;
    }

    $wr_5 = isset($wr['wr_5']) ? $wr['wr_5'] : $wr_5;
    $wr_6 = isset($wr['wr_6']) ? $wr['wr_6'] : $wr_6;

    if (!$is_admin) {
        $wr_7 = isset($wr['wr_7']) ? $wr['wr_7'] : $wr_7;
        $wr_8 = isset($wr['wr_8']) ? $wr['wr_8'] : $wr_8;
    }
}

function sungsan_reject_blocked_uploads($files)
{
    global $sungsan_blocked_upload_extensions;

    if (empty($files['bf_file']['name']) || !is_array($files['bf_file']['name'])) {
        return;
    }

    foreach ($files['bf_file']['name'] as $filename) {
        $filename = trim((string) $filename);
        if ($filename === '') {
            continue;
        }

        $filename_parts = explode('.', strtolower($filename));
        array_shift($filename_parts);

        foreach ($filename_parts as $extension) {
            $extension = trim($extension);
            if ($extension === '') {
                continue;
            }

            if (in_array($extension, $sungsan_blocked_upload_extensions, true)) {
                alert('실행 파일 또는 브라우저에서 실행될 수 있는 파일은 첨부할 수 없습니다.');
            }
        }
    }
}

function sungsan_selected($current, $value)
{
    return $current === $value ? ' selected="selected"' : '';
}

function sungsan_active_class($current, $value)
{
    return $current === $value ? ' active' : '';
}

function sungsan_url_origin($url)
{
    $parts = parse_url($url);
    if (!is_array($parts) || empty($parts['host'])) {
        return '';
    }

    $scheme = isset($parts['scheme']) ? strtolower($parts['scheme']) : 'http';
    if ($scheme !== 'http' && $scheme !== 'https') {
        return '';
    }

    $host = strtolower($parts['host']);
    $port = isset($parts['port']) ? ':'.(int) $parts['port'] : '';

    return $scheme.'://'.$host.$port;
}

function sungsan_sanitize_return_url($return_url)
{
    $return_url = trim((string) $return_url);
    $return_url = htmlspecialchars_decode($return_url, ENT_QUOTES);

    if ($return_url === '' || strpos($return_url, '//') === 0) {
        return G5_URL;
    }

    if (preg_match('/^[a-z][a-z0-9+.-]*:/i', $return_url)) {
        $return_origin = sungsan_url_origin($return_url);
        $allowed_origins = array_filter(array(sungsan_url_origin(G5_URL), sungsan_url_origin(G5_BBS_URL)));

        if ($return_origin !== '' && in_array($return_origin, $allowed_origins, true)) {
            return $return_url;
        }

        return G5_URL;
    }

    return $return_url;
}

function sungsan_login_url($return_url = '')
{
    $return_url = sungsan_sanitize_return_url($return_url);

    return G5_BBS_URL.'/login.php?url='.urlencode($return_url);
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

function sungsan_prepare_latest_post($row, $board_id, $with_thumbnail, $thumb_width, $thumb_height, $is_notice = false)
{
    $row['href'] = sungsan_board_href($board_id, $row['wr_id']);
    $row['subject'] = get_text($row['wr_subject']);
    $row['date'] = substr($row['wr_datetime'], 0, 10);
    $row['is_notice'] = $is_notice;

    if ($with_thumbnail && function_exists('get_list_thumbnail')) {
        $thumb = get_list_thumbnail($board_id, $row['wr_id'], $thumb_width, $thumb_height, false, true);
        $row['thumb_src'] = isset($thumb['src']) ? $thumb['src'] : '';
        $row['thumb_alt'] = isset($thumb['alt']) && $thumb['alt'] ? $thumb['alt'] : $row['subject'];
    }

    return $row;
}

function sungsan_latest_board_posts($bo_table, $args = array())
{
    global $g5, $is_admin, $member;

    if (!isset($g5['write_prefix']) || !function_exists('sql_query')) {
        return array();
    }

    $board_id = sungsan_clean_board_id($bo_table);
    if (!$board_id) {
        return array();
    }

    $limit = isset($args['limit']) ? max(1, min(10, (int) $args['limit'])) : 5;
    $with_thumbnail = !empty($args['thumbnail']);
    $thumb_width = isset($args['thumbWidth']) ? max(120, (int) $args['thumbWidth']) : 420;
    $thumb_height = isset($args['thumbHeight']) ? max(90, (int) $args['thumbHeight']) : 260;
    $include_notice = !empty($args['includeNotice']);
    $where = array('wr_is_comment = 0');

    if ($board_id === SUNGSAN_NEWS_BOARD) {
        if (!$is_admin) {
            $where[] = "(wr_7 <> 'review_required' or wr_7 is null)";
        }

        $level = isset($member['mb_level']) ? (int) $member['mb_level'] : 0;
        if (!$is_admin && $level < 2) {
            $where[] = "(wr_2 = 'public' or wr_2 = '')";
        } elseif (!$is_admin && $level < 6) {
            $where[] = "(wr_2 in ('public', 'member') or wr_2 = '')";
        }
    }

    if ($with_thumbnail && !function_exists('get_list_thumbnail') && defined('G5_LIB_PATH') && is_file(G5_LIB_PATH.'/thumbnail.lib.php')) {
        include_once G5_LIB_PATH.'/thumbnail.lib.php';
    }

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
    $notice_ids = array();

    if ($include_notice && isset($g5['board_table']) && function_exists('sql_fetch')) {
        $board_row = sql_fetch(" select bo_notice from {$g5['board_table']} where bo_table = '".sql_escape_string($board_id)."' ");
        if (!empty($board_row['bo_notice'])) {
            $raw_notice_ids = explode(',', trim($board_row['bo_notice']));

            foreach ($raw_notice_ids as $raw_notice_id) {
                $notice_id = (int) $raw_notice_id;
                if ($notice_id > 0) {
                    $notice_ids[] = $notice_id;
                }
            }

            $notice_ids = array_values(array_unique($notice_ids));
        }
    }

    $posts = array();

    if (!empty($notice_ids)) {
        $notice_sql = " select wr_id, wr_subject, ca_name, wr_datetime, wr_hit, wr_1, wr_2, wr_3, wr_4, wr_7
             from {$write_table}
             where wr_id in (".implode(',', $notice_ids).")
               and ".implode(' and ', $where)." ";
        $notice_result = sql_query($notice_sql, false);
        $notice_rows = array();

        if ($notice_result) {
            while ($row = sql_fetch_array($notice_result)) {
                $notice_rows[(int) $row['wr_id']] = $row;
            }
        }

        foreach ($notice_ids as $notice_id) {
            if (!isset($notice_rows[$notice_id])) {
                continue;
            }

            $posts[] = sungsan_prepare_latest_post($notice_rows[$notice_id], $board_id, $with_thumbnail, $thumb_width, $thumb_height, true);

            if (count($posts) >= $limit) {
                return $posts;
            }
        }

        $where[] = 'wr_id not in ('.implode(',', $notice_ids).')';
    }

    $remaining_limit = $limit - count($posts);
    if ($remaining_limit <= 0) {
        return $posts;
    }

    $sql = " select wr_id, wr_subject, ca_name, wr_datetime, wr_hit, wr_1, wr_2, wr_3, wr_4, wr_7
             from {$write_table}
             where ".implode(' and ', $where)."
             order by {$order}
             limit {$remaining_limit} ";
    $result = sql_query($sql, false);

    if (!$result) {
        return $posts;
    }

    while ($row = sql_fetch_array($result)) {
        $posts[] = sungsan_prepare_latest_post($row, $board_id, $with_thumbnail, $thumb_width, $thumb_height);
    }

    return $posts;
}

function sungsan_member_recent_posts($member_id, $limit = 5)
{
    global $g5, $is_admin, $member;

    $member_id = trim((string) $member_id);
    if ($member_id === '' || !isset($g5['write_prefix']) || !function_exists('sql_query')) {
        return array();
    }

    $limit = max(1, min(10, (int) $limit));
    $boards = array(
        SUNGSAN_NEWS_BOARD => '소식',
        SUNGSAN_FREE_BOARD => '자유게시판',
    );
    $posts = array();

    foreach ($boards as $board_id => $board_label) {
        $board_id = sungsan_clean_board_id($board_id);
        if (!$board_id) {
            continue;
        }

        $where = array(
            'wr_is_comment = 0',
            "mb_id = '".sql_escape_string($member_id)."'",
        );

        if ($board_id === SUNGSAN_NEWS_BOARD) {
            if (!$is_admin) {
                $where[] = "(wr_7 <> 'review_required' or wr_7 is null)";
            }

            $level = isset($member['mb_level']) ? (int) $member['mb_level'] : 0;
            if (!$is_admin && $level < 2) {
                $where[] = "(wr_2 = 'public' or wr_2 = '')";
            } elseif (!$is_admin && $level < 6) {
                $where[] = "(wr_2 in ('public', 'member') or wr_2 = '')";
            }
        }

        $write_table = $g5['write_prefix'].$board_id;
        $sql = " select wr_id, wr_subject, wr_datetime
                 from {$write_table}
                 where ".implode(' and ', $where)."
                 order by wr_datetime desc, wr_id desc
                 limit {$limit} ";
        $result = sql_query($sql, false);
        if (!$result) {
            continue;
        }

        while ($row = sql_fetch_array($result)) {
            $posts[] = array(
                'board_id' => $board_id,
                'board_label' => $board_label,
                'href' => sungsan_board_href($board_id, $row['wr_id']),
                'subject' => get_text($row['wr_subject']),
                'date' => substr($row['wr_datetime'], 0, 10),
                'sort_key' => $row['wr_datetime'].'-'.str_pad((string) $row['wr_id'], 10, '0', STR_PAD_LEFT),
            );
        }
    }

    usort($posts, function ($a, $b) {
        return strcmp($b['sort_key'], $a['sort_key']);
    });

    return array_slice($posts, 0, $limit);
}
