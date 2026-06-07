<?php
include_once '../../../common.php';

$sungsan_page = 'intro';
$g5['title'] = '성산회 소개';
include_once G5_THEME_PATH.'/head.php';
?>
<section class="ss-hero">
    <div class="ss-container">
        <h1>성산회 소개</h1>
        <p>성산회의 뜻, 연혁, 조직, 성산회가를 한 페이지에서 읽기 쉽게 정리합니다.</p>
    </div>
</section>

<section class="ss-section">
    <div class="ss-container ss-form-grid">
        <article id="message" class="ss-panel">
            <h2>인사말</h2>
            <p>기존 회장 인사말과 명예회장 인사말은 데이터 이전 단계에서 이 영역으로 옮깁니다.</p>
        </article>
        <article id="charter" class="ss-panel">
            <h2>성산헌장</h2>
            <p>기존 `z2_1` 게시판의 성산헌장 내용을 검수 후 이 영역에 반영합니다.</p>
        </article>
        <article id="history" class="ss-panel">
            <h2>연혁</h2>
            <p>기존 소개 자료와 운영자 확인 내용을 바탕으로 연혁을 정리합니다.</p>
        </article>
        <article id="organization" class="ss-panel">
            <h2>조직</h2>
            <p>기존 `z2_5` 조직도 자료를 반응형 구조로 재구성합니다.</p>
        </article>
        <article id="song" class="ss-panel">
            <h2>성산회가</h2>
            <p>기존 `z2_2` 성산회가 내용을 옮깁니다.</p>
        </article>
    </div>
</section>
<?php
include_once G5_THEME_PATH.'/tail.php';

