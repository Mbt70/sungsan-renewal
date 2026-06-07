# 성산회 홈페이지 개선 프로젝트

성산회 기존 그누보드4 기반 홈페이지를 그누보드5 기반으로 새로 구축하기 위한 로컬 개발 저장소입니다.

## 현재 구현 범위
- 그누보드5 `v5.6.28` 기준 로컬 부트스트랩 스크립트
- Docker Compose 개발환경 정의
- `theme/sungsan` 커스텀 테마 오버레이
- `news`, `free` 게시판용 커스텀 스킨
- SCSS 디자인 토큰과 빌드 스크립트
- 기존 그누보드4 보드 ID를 새 정보 구조로 매핑하는 마이그레이션 도구
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
5. 회원가입은 운영자 승인제로 설정합니다.

## 검증
```powershell
npm run verify
```

`npm run verify`는 마이그레이션 매핑 테스트와 SCSS 빌드를 실행합니다.

그누보드5 코어를 내려받은 뒤 설정 SQL을 갱신하려면 다음을 실행합니다.
```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-gnuboard.ps1
npm run export:setup-sql
```

PHP와 Docker가 설치된 환경에서는 추가로 다음을 실행합니다.
```powershell
docker compose build
docker compose up -d
```

## 운영 전환 개요
1. 기존 DB와 `/renewal/data`를 백업합니다.
2. 백업을 로컬로 복원해 EUC-KR에서 UTF-8 변환을 리허설합니다.
3. 새 사이트를 Cafe24 스테이징 경로에 업로드합니다.
4. 관리자와 함께 권한, 첨부, 검색, 모바일 화면을 검수합니다.
5. 최종 백업 후 루트 전환합니다.

자세한 절차는 `docs/operations`와 `docs/migration`을 확인합니다.
