<?php
include_once '../common.php';

if (!$is_member) {
    goto_url(G5_BBS_URL.'/login.php?url='.urlencode(G5_URL.'/sungsan/mypage.php'));
}

$sungsan_page = 'mypage';
$g5['title'] = '마이페이지';
include_once G5_THEME_PATH.'/head.php';

$member_level = isset($member['mb_level']) ? (int) $member['mb_level'] : 0;
$role_label = function_exists('sungsan_get_member_role_label') ? sungsan_get_member_role_label($member_level) : '회원';
$my_posts_url = G5_BBS_URL.'/new.php?mb_id='.urlencode($member['mb_id']);
$edit_url = G5_BBS_URL.'/member_confirm.php?url=register_form.php';
$logout_url = G5_BBS_URL.'/logout.php';
$recent_posts = function_exists('sungsan_member_recent_posts') ? sungsan_member_recent_posts($member['mb_id'], 5) : array();
?>
<section class="ss-page-header">
    <div class="ss-container">
        <p class="ss-eyebrow">회원 공간</p>
        <h1>마이페이지</h1>
        <p>내 정보와 내가 쓴 글을 확인하고 필요한 회원 기능으로 이동합니다.</p>
    </div>
</section>

<section class="ss-section">
    <div class="ss-container ss-member-shell">
        <article class="ss-panel ss-member-summary">
            <h2><?php echo get_text($member['mb_name']); ?>님</h2>
            <dl class="ss-definition-list">
                <div>
                    <dt>아이디</dt>
                    <dd><?php echo get_text($member['mb_id']); ?></dd>
                </div>
                <div>
                    <dt>권한</dt>
                    <dd><?php echo get_text($role_label); ?></dd>
                </div>
                <div>
                    <dt>최근 로그인</dt>
                    <dd><?php echo get_text(isset($member['mb_today_login']) ? $member['mb_today_login'] : ''); ?></dd>
                </div>
            </dl>
        </article>

        <nav class="ss-panel ss-member-actions" aria-label="회원 메뉴">
            <a class="ss-button" href="<?php echo get_text($edit_url); ?>">내 정보 수정</a>
            <a class="ss-button secondary" href="<?php echo get_text($my_posts_url); ?>">내가 쓴 글</a>
            <a class="ss-button secondary" href="<?php echo get_text($logout_url); ?>">로그아웃</a>
        </nav>

        <section class="ss-panel ss-member-posts">
            <div class="ss-section-header">
                <h2>내가 쓴 글</h2>
                <a class="ss-button secondary" href="<?php echo get_text($my_posts_url); ?>">전체 보기</a>
            </div>
            <div class="ss-post-list">
                <?php for ($i = 0; $i < count($recent_posts); $i++) { ?>
                    <a class="ss-post-row" href="<?php echo get_text($recent_posts[$i]['href']); ?>">
                        <p class="ss-post-title">
                            <span class="ss-badge"><?php echo get_text($recent_posts[$i]['board_label']); ?></span>
                            <?php echo get_text($recent_posts[$i]['subject']); ?>
                        </p>
                        <div class="ss-meta">
                            <span><?php echo get_text($recent_posts[$i]['date']); ?></span>
                        </div>
                    </a>
                <?php } ?>
                <?php if (count($recent_posts) === 0) { ?>
                    <div class="ss-post-row">
                        <p class="ss-post-title">아직 작성한 글이 없습니다.</p>
                    </div>
                <?php } ?>
            </div>
        </section>

        <section class="ss-panel ss-review-note">
            <h2>회원 이용 안내</h2>
            <p>회원가입 직후에는 운영자 승인 전까지 일부 게시판 이용이 제한될 수 있습니다. 권한 변경이나 정보 정정이 필요하면 운영자에게 문의해 주세요.</p>
        </section>
    </div>
</section>
<?php
include_once G5_THEME_PATH.'/tail.php';
