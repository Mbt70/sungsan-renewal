<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$member_skin_url.'/style.css">', 0);

$profile_member_id = isset($mb['mb_id']) ? $mb['mb_id'] : '';
$profile_member_level = isset($mb['mb_level']) ? (int) $mb['mb_level'] : 0;
$profile_member_point = isset($mb['mb_point']) ? (int) $mb['mb_point'] : 0;
$profile_viewer_level = isset($member['mb_level']) ? (int) $member['mb_level'] : 0;
$profile_member_join_date = isset($mb['mb_datetime']) ? substr($mb['mb_datetime'], 0, 10) : '';
$profile_member_today_login = isset($mb['mb_today_login']) ? $mb['mb_today_login'] : '';
$profile_member_reg_after = isset($mb_reg_after) ? (int) $mb_reg_after : 0;
$profile_can_view_activity_dates = $profile_viewer_level >= $profile_member_level;
$profile_homepage_raw = isset($mb['mb_homepage']) ? trim($mb['mb_homepage']) : '';
$profile_homepage_url = '';
if ($profile_homepage_raw !== '') {
    $profile_homepage_scheme = parse_url($profile_homepage_raw, PHP_URL_SCHEME);
    if ($profile_homepage_scheme === null || in_array(strtolower((string) $profile_homepage_scheme), array('http', 'https'), true)) {
        $profile_homepage_url = set_http($profile_homepage_raw);
    }
}
?>

<!-- 자기소개 시작 { -->
<div id="profile" class="new_win">
    <h1 id="win_title"><?php echo get_text($mb_nick); ?>님의 프로필</h1>
    <div class="profile_name">
        <span class="my_profile_img">
            <?php echo get_member_profile_img($profile_member_id); ?>
        </span>
        <?php echo get_text($mb_nick); ?>
    </div>
    <div class="tbl_head02 tbl_wrap new_win_con">
        <table>
        <tbody>
        <tr>
            <th scope="row"><i class="fa fa-star-o" aria-hidden="true"></i>  회원권한</th>
            <td><?php echo $profile_member_level; ?></td>
            <th scope="row"><i class="fa fa-database" aria-hidden="true"></i> 포인트</th>
            <td><?php echo number_format($profile_member_point); ?></td>
        </tr>
        <tr>
            <th scope="row"><i class="fa fa-clock-o" aria-hidden="true"></i> 회원가입일</th>
            <td><?php echo $profile_can_view_activity_dates ? get_text($profile_member_join_date)." (".number_format($profile_member_reg_after)." 일)" : "알 수 없음"; ?></td>
            <th scope="row"><i class="fa fa-clock-o" aria-hidden="true"></i> 최종접속일</th>
            <td><?php echo $profile_can_view_activity_dates ? get_text($profile_member_today_login) : "알 수 없음"; ?></td>
        </tr>
        <?php if ($profile_homepage_url !== '') {  ?>
        <tr>
            <th scope="row"><i class="fa fa-home" aria-hidden="true"></i> 홈페이지</th>
            <td colspan="3"><a href="<?php echo get_text($profile_homepage_url); ?>" target="_blank" rel="noopener noreferrer"><?php echo get_text($mb_homepage); ?></a></td>
        </tr>
        <?php }  ?>

        </tbody>
        </table>
    

        <section>
            <h2>인사말</h2>
            <p><?php echo get_text($mb_profile); ?></p>
        </section>
    </div>
    <div class="win_btn">
        <button type="button" onclick="window.close();" class="btn_close">창닫기</button>
    </div>
</div>
<!-- } 자기소개 끝 -->
