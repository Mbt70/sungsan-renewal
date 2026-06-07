# Current Site Findings

점검일: 2026-06-07

대상:
- `http://iesungsan.or.kr/`
- `http://iesungsan.or.kr/renewal/`
- `http://iesungsan.or.kr/renewal/bbs/board.php?bo_table=z5_4`
- `https://iesungsan.or.kr/`

## 확인된 사실
- HTTP 응답 헤더가 `Content-Type: text/html; charset=euc-kr`로 내려옵니다.
- HTTP 응답 헤더가 `X-Powered-By: PHP/4.4.9p2`를 노출합니다.
- `z5_4` 게시판에서 PHP warning이 공개 화면에 노출됩니다.
- `z5_4` 목록에는 회원 명부성 게시글 제목이 섞여 있어 새 사이트 공개 이전 시 공개 범위 재검토가 필요합니다.
- `https://iesungsan.or.kr/`는 2026-06-07 점검 시 15초 안에 정상 응답하지 않았습니다.

## 이전 작업 반영
- 신규 사이트는 UTF-8/utf8mb4 기준으로 구성합니다.
- PHP 오류 노출은 운영에서 비활성화합니다.
- `z6_2`, `z6_3`은 공개 이전 대상에서 제외합니다.
- `z5_4`처럼 회원 명부성 자료가 섞인 보드는 마이그레이션 리허설 때 게시글별 공개 범위를 별도 검토합니다.
- Cafe24 전환 전 HTTPS 인증서와 리다이렉트 동작을 필수 검수 항목으로 둡니다.
