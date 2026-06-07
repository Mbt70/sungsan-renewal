# Cafe24 Deployment Runbook

## 1. 사전 확인
- Cafe24 서비스가 Linux 기반이며 SFTP/SSH를 지원하는지 확인합니다.
- Cafe24 PHP 선택 가능 버전을 확인합니다. PHP 8.4가 가능하면 8.4, 어려우면 8.2로 시작합니다.
- 운영 도메인 `iesungsan.or.kr`의 HTTPS 인증서 상태를 확인합니다.
- 기존 사이트 관리자, DB, SFTP 접근 권한을 확보합니다.

## 2. 백업
```text
1. DB 전체 덤프 생성
2. /renewal/data 전체 다운로드
3. 기존 /renewal 소스 압축 백업
4. 백업 파일 무결성 확인
```

백업 파일은 Git에 올리지 않습니다. 로컬 `backups/` 또는 별도 암호화 저장소에 보관합니다.

## 3. 스테이징 배포
1. `npm run verify`를 실행합니다.
2. `docs/migration/rehearsal-tools.md` 기준으로 회원 SQL, 첨부 복사 계획, `board_file` SQL, redirect 초안, 리허설 요약 JSON을 생성해 검수합니다.
3. `scripts/build-release.ps1`로 배포 zip을 만듭니다.
4. Cafe24의 임시 경로에 압축을 풉니다.
5. 새 DB를 만들거나 스테이징용 테이블 prefix를 사용합니다.
6. 그누보드 설치 후 `npm run export:setup-sql`로 생성한 `docs/generated/sungsan-setup.sql`을 검토해 적용합니다.
7. `docs/operations/data-htaccess-template.txt` 내용을 그누보드 설치 경로의 `data/.htaccess`로 복사합니다. 배포 zip은 `/data`를 제외하므로 스테이징과 운영 전환 때 모두 직접 적용합니다.
8. 관리자에서 테마 `sungsan`, 회원 스킨 `sungsan`, 게시판 스킨 `sungsan_news/sungsan_free`, 권한, 분류, 업로드 제한이 의도대로 잡혔는지 확인합니다.
9. 이전 리허설 데이터를 반영합니다. `wr_7=review_required` 글은 운영자 검토 전 공개하지 않습니다.
10. 변환 결과로 redirect CSV와 Apache 초안을 생성하고 운영 전환 전에 샘플 URL을 확인합니다.

## 4. 검수
- 모바일 375px, 태블릿, 데스크톱에서 홈/소개/소식/자유게시판 확인
- 비회원, 회원, 임원, 운영자 권한 확인
- 비회원 자유게시판 목록 노출과 본문 로그인 차단 확인
- 첨부 업로드와 다운로드 확인
- `data/.htaccess` 적용 후 `data` 하위 PHP/HTML/JS/SVG 계열 파일 직접 접근이 차단되는지 확인
- `news` 임원/운영자 공개 글의 첨부 직접 다운로드 URL 차단 확인
- 검색과 종류 필터 확인
- 한글 깨짐 확인
- 관리자 승인제 확인
- 로그인, 회원가입, 마이페이지, 내 정보 수정 진입 확인
- 회원가입 부가 입력(홈페이지, 주소, 서명, 자기소개, 추천인, 회원아이콘)이 기본 비활성화인지 확인
- `z6_2`, `z6_3` 제외와 회원 명부성 글 검토 플래그 확인
- 기존 `/renewal/bbs/board.php?bo_table=...&wr_id=...` URL redirect 샘플 확인

## 5. 운영 전환
1. 전환 직전 기존 DB와 `/renewal/data`를 다시 백업합니다.
2. 스테이징 검수본을 운영 루트로 복사합니다.
3. DB 연결 정보를 운영 DB로 교체합니다.
4. 도메인 루트가 새 그누보드 설치 경로를 보도록 조정합니다.
5. HTTPS, 로그인, 첨부, 검색, 기존 URL 리다이렉트 샘플을 즉시 확인합니다.

## 6. 롤백
- 전환 전 백업한 기존 소스와 DB를 기준으로 원복합니다.
- Cafe24 PHP 버전 변경은 데이터 삭제와 서버 초기화 가능성이 있으므로 변경 전 Cafe24 공지와 원복 조건을 다시 확인합니다.
