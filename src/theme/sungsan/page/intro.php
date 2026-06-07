<?php
include_once '../../../common.php';

$sungsan_page = 'intro';
$g5['title'] = '성산회 소개';
include_once G5_THEME_PATH.'/head.php';
?>
<section class="ss-hero">
    <div class="ss-container ss-hero-layout">
        <div>
            <p class="ss-eyebrow">소개</p>
            <h1>성산회 소개</h1>
            <p>성산회는 회원의 교류와 활동을 이어가며 공지, 자료, 행사 정보를 안정적으로 공유하는 회원 공동체입니다.</p>
        </div>
        <nav class="ss-hero-summary" aria-label="소개 바로가기">
            <strong>바로가기</strong>
            <ul>
                <li><a href="#message">인사말</a></li>
                <li><a href="#charter">성산헌장</a></li>
                <li><a href="#history">연혁</a></li>
                <li><a href="#organization">조직</a></li>
                <li><a href="#song">성산회가</a></li>
            </ul>
        </nav>
    </div>
</section>

<section class="ss-section">
    <div class="ss-container ss-form-grid">
        <article id="message" class="ss-panel">
            <h2>인사말</h2>
            <p>성산회 홈페이지는 회원 여러분이 필요한 소식과 자료를 쉽고 안전하게 확인하는 공간입니다. 새 홈페이지는 모바일에서도 읽기 편한 글자와 단순한 메뉴를 중심으로 구성했습니다.</p>
            <p class="ss-review-note">기존 회장·명예회장 인사말 원문은 이전 리허설 후 운영자 검수를 거쳐 이 영역에 반영합니다.</p>
        </article>
        <article id="charter" class="ss-panel">
            <h2>성산헌장</h2>
            <p>성산헌장은 성산회의 목적과 회원 활동의 기준을 담은 핵심 자료입니다. 현행본은 회원이 언제든 찾을 수 있도록 소개 화면과 소식의 규정 분류에서 함께 안내합니다.</p>
            <p class="ss-review-note">기존 `z2_1` 성산헌장 원문을 검수한 뒤 최종 문안으로 교체합니다.</p>
        </article>
        <article id="history" class="ss-panel">
            <h2>연혁</h2>
            <p>성산회의 주요 활동, 총회, 자료 발간, 부서·동아리 활동 이력을 시간순으로 정리합니다. 긴 연혁은 모바일에서 읽기 쉽도록 연도별 목록으로 나눕니다.</p>
        </article>
        <article id="organization" class="ss-panel">
            <h2>조직</h2>
            <p>임원회, 운영위원회, 기금관리위원회와 각 부서·동아리 정보를 회원이 빠르게 이해할 수 있도록 정리합니다.</p>
            <div class="ss-org-grid" aria-label="성산회 주요 조직">
                <span>임원회</span>
                <span>운영위원회</span>
                <span>기금관리위원회</span>
                <span>경제부</span>
                <span>사회복지부</span>
                <span>인재양성부</span>
                <span>문화부</span>
                <span>성우회</span>
            </div>
        </article>
        <article id="song" class="ss-panel">
            <h2>성산회가</h2>
            <p>성산회가는 기존 자료의 저작·공개 범위를 확인한 뒤 전문을 게시합니다. 운영 검수 전까지는 자료 이전 대상임을 명확히 표시합니다.</p>
        </article>
    </div>
</section>
<?php
include_once G5_THEME_PATH.'/tail.php';
