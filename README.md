# 성산회 홈페이지 개선 프로젝트

성산회 기존 그누보드4 기반 홈페이지를 그누보드5 기반으로 새로 구축하기 위한 로컬 개발 저장소입니다.

## 현재 구현 범위
- 그누보드5 `v5.6.28` 기준 로컬 부트스트랩 스크립트
- Docker Compose 개발환경 정의
- `theme/sungsan` 커스텀 테마 오버레이
- `news`, `free` 게시판용 커스텀 스킨
- 로그인·회원가입·마이페이지용 `sungsan` 회원 스킨과 회원 허브 화면
- SCSS 디자인 토큰과 빌드 스크립트
- 기존 그누보드4 보드 ID를 새 정보 구조로 매핑하는 마이그레이션 도구
- 공개 범위 검토 플래그와 기존 URL redirect 매핑 생성 도구
- Cafe24 스테이징/전환 체크리스트

## 준비물
- Node.js 24 이상
- Docker Desktop
- Cafe24 SFTP/DB/관리자 접근 권한
- GitHub private repository

## 로컬 시작
```powershell
Copy-Item .env.example .env
npm run build:css
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-gnuboard.ps1
docker compose up -d
```

브라우저에서 `http://localhost:8080`을 열고 그누보드 설치 화면을 진행합니다.

현재 Node 빌드는 외부 npm 패키지를 쓰지 않으므로 `npm install`은 필수 단계가 아닙니다.

로컬 DB 기본값은 `.env.example`을 기준으로 합니다. 실제 운영 비밀번호는 `.env`에만 두고 Git에 올리지 않습니다.

## 그누보드 설치 후 관리자 설정
1. 그누보드 설치를 완료합니다.
2. `npm run export:setup-sql`로 `docs/generated/sungsan-setup.sql`을 갱신합니다.
3. 스테이징 DB에서 SQL 내용을 검토 후 적용합니다.
4. 관리자에서 테마가 `sungsan`, 게시판 `news/free`와 스킨 `sungsan_news/sungsan_free`로 잡혔는지 확인합니다.
5. 회원 스킨이 `sungsan`으로 잡혔는지 확인합니다.
6. 회원가입은 운영자 승인제로 설정합니다. 설정 SQL은 가입 직후 권한을 `1`로 두므로 운영자가 승인 후 회원 권한을 부여합니다.

## 검증
```powershell
npm run verify
```

`npm run verify`는 마이그레이션 매핑 테스트와 SCSS 빌드를 실행합니다.

마이그레이션 리허설 후 기존 URL redirect 초안을 만들 때는 변환 결과를 JSON 또는 JSONL로 준비한 뒤 다음을 실행합니다.
```powershell
node tools/migration/redirect-map.mjs .\migration-output.json .\redirects.csv csv
node tools/migration/redirect-map.mjs .\migration-output.json .\redirects-apache.txt apache
```

회원, 첨부, 리허설 요약 산출물은 다음 도구로 분리해 만듭니다.
```powershell
node tools/migration/member-transform.mjs .\members.jsonl .\members-import.sql
node tools/migration/file-plan.mjs .\attachments.jsonl .\attachment-copy-plan.json .\board-file-import.sql
node tools/migration/rehearsal-summary.mjs .\rehearsal-bundle.json .\rehearsal-summary.json
```

회원 비밀번호 해시는 이전하지 않으며, 첨부 계획은 `news/free`로 실제 이전된 글만 대상으로 합니다. PHP, HTML, JS, SVG 계열 첨부는 `blockedRecords`에 표시하고 복사하지 않습니다. 자세한 기준은 `docs/migration/rehearsal-tools.md`를 확인합니다.
`z6_2`, `z6_3`, 소개 페이지 대상 글은 redirect에서 제외되고 `news/free`로 실제 이전된 글만 포함됩니다. `wr_7=review_required` 글은 운영자 검토가 끝날 때까지 redirect CSV/Apache output에서도 제외됩니다.

설정 SQL은 추적 파일인 `tools/setup/sql_write.template.sql`을 기본 입력으로 사용하므로 `www/` 부트스트랩 산출물이 없어도 GitHub 체크아웃에서 재현할 수 있습니다.
그누보드5 코어를 새로 내려받아 `www/adm/sql_write.sql` 기준으로 템플릿 차이를 검토하려면 다음처럼 실행합니다.
```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-gnuboard.ps1
Copy-Item .\www\adm\sql_write.sql .\tools\setup\sql_write.template.sql
npm run export:setup-sql
```
코어 템플릿을 복사하지 않고 일회성으로만 비교할 때는 `GNUBOARD_WRITE_SQL_TEMPLATE` 환경변수에 `www/adm/sql_write.sql` 경로를 지정해 실행합니다.

PHP와 Docker가 설치된 환경에서는 추가로 다음을 실행합니다.
```powershell
docker compose build
docker compose up -d
```

## 배포 산출물
```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-release.ps1
Get-FileHash -Algorithm SHA256 .\release\sungsan-site-*.zip
```

`scripts/build-release.ps1`는 `release/sungsan-site-YYYYMMDD-HHMMSS.zip`과 같은 이름의 `.sha256` 체크섬 파일을 만듭니다. Cafe24 SFTP 업로드 전후에 ZIP의 SHA256 값이 `.sha256` 파일과 일치하는지 확인합니다. 자세한 절차는 `docs/operations/cafe24-deployment.md`를 확인합니다.

## 운영 전환 개요
1. 기존 DB와 `/renewal/data`를 백업하고 `docs/operations/backup-and-restore.md` 기준으로 무결성 값을 남깁니다.
2. 백업을 로컬로 복원해 EUC-KR에서 UTF-8 변환을 리허설합니다.
3. 새 사이트를 Cafe24 스테이징 경로에 업로드합니다.
4. 관리자와 함께 권한, 첨부, 검색, 모바일 화면을 검수하고 `docs/operations/staging-validation-checklist.md`에 결과를 남깁니다.
5. 최종 백업 후 루트 전환합니다.

자세한 절차는 `docs/operations/backup-and-restore.md`, `docs/operations/cafe24-deployment.md`, `docs/migration`을 확인합니다.
