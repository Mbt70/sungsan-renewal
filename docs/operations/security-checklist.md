# Security Checklist

## Accounts
- 기본 `admin` ID는 사용하지 않습니다.
- 운영자 계정은 최소 인원만 유지합니다.
- 임원 권한은 `mb_level >= 6`, 운영자는 `10`으로 분리합니다.
- 회원가입은 운영자 승인제로 설정합니다.
- 기존 회원 이전 SQL은 레거시 비밀번호 해시를 포함하지 않고 `mb_3=password_reset_required`를 남기는지 확인합니다.
- 기존 게시글 이전 SQL은 레거시 게시글 비밀번호를 포함하지 않는지 확인합니다.

## Boards
- `news` 첨부 직접 다운로드 URL은 게시글 `wr_2` 공개 범위와 같은 권한으로 차단되는지 확인합니다.
- `news` 읽기 권한은 글 공개 범위와 게시판 권한을 함께 확인합니다.
- `free` 목록은 비회원에게 제목을 보여주되 본문, 작성, 첨부는 회원 이상으로 제한합니다.
- `free` 쓰기 권한은 회원 이상으로 제한합니다.
- `z6_2`, `z6_3` 성격의 데이터는 공개 화면으로 이전하지 않습니다.
- `z5_4`처럼 공개 게시판에 회원 명부성 글이 섞인 경우 게시글별로 임원 전용 또는 이전 제외 처리합니다.
- 이전 리허설에서 `wr_7=review_required`로 표시된 글은 운영자 검토 전 공개하지 않습니다.

## Uploads
- 허용 확장자만 업로드합니다.
- PHP, PHP7/PHP8, HTML, JS, SVG, `.htaccess`, `.user.ini` 업로드를 차단합니다.
- `news/free` 작성 화면에서 PHP, PHP7/PHP8, HTML, JS, SVG 계열 첨부, `shell.php7`, `shell.php8`, `shell.php.jpg` 같은 실행형 또는 다중 확장자 파일, `.htaccess`, `.user.ini`가 저장 전에 차단되는지 확인합니다.
- `formmail_send.php` 폼메일 첨부 `file1/file2`도 20MB 초과 파일과 PHP, PHP7/PHP8, HTML, JS, SVG 계열 첨부, `shell.php7`, `shell.php8`, `shell.php.jpg` 같은 실행형 또는 다중 확장자 파일, `.htaccess`, `.user.ini`가 전송 전에 차단되는지 확인합니다.
- 첨부 용량 기본값은 20MB 이하로 유지합니다.
- 운영 전 `docs/operations/data-htaccess-template.txt`를 `data/.htaccess`로 복사해 `data` 하위의 실행 권한과 위험 확장자 직접 접근을 차단합니다.
- 첨부 복사 계획에 `z6_2`, `z6_3`, `intro`, `exclude` 대상 파일이 없는지 확인합니다.
- 첨부 복사 계획의 `blockedRecords`에 표시된 PHP, PHP7/PHP8, HTML, JS, SVG 계열 파일, `shell.php7`, `shell.php8`, `shell.php.jpg` 같은 실행형 또는 다중 확장자 파일, `.htaccess`, `.user.ini`는 운영 서버에 복사하지 않습니다.

## Runtime
- PHP 오류는 화면에 표시하지 않고 로그로만 남깁니다.
- HTTPS 인증서를 확인합니다.
- 세션 쿠키는 `HttpOnly`, 가능하면 `Secure`로 설정합니다.
- 오래된 PHP 4.4 기반 사이트는 전환 후 외부 노출을 중단합니다.
- 현재 사이트처럼 PHP warning과 PHP 버전이 공개 응답에 노출되지 않는지 스테이징과 운영에서 모두 확인합니다.
- 설정 SQL 적용 후 회원가입 기본 권한이 승인 대기 수준인지 확인합니다.

## Version Control
- `.env`, `.env.*`, `deploy.env`, `cafe24*.env`는 Git에 올리지 않습니다.
- DB와 리허설 덤프는 `*.sql`, `*.sql.gz`, `*.sql.zip`, `*.dump`, `*.dump.gz` 패턴으로 Git에서 제외합니다.
- 기존 소스와 첨부 백업은 `backups/`, `*.tar.gz`, `*.tgz`, `*.7z`처럼 로컬 백업 경로 또는 압축 파일로만 보관합니다.
- Cafe24 SFTP/SSH 비밀값은 `*.pem`, `*.key`, `*.ppk`, `*.p12`, `sftp*.json`, `secrets/`에 두고 Git에 올리지 않습니다.
- 예외로 `.env.example`과 `docs/generated/sungsan-setup.sql`만 검토 가능한 샘플/설정 산출물로 추적합니다.

## Verification
- 비회원으로 회원 전용 글 본문 접근 차단 확인
- 회원으로 자유게시판 작성 확인
- 임원으로 소식 작성 확인
- 일반 회원으로 임원 전용 글 차단 확인
- 첨부 다운로드 URL 직접 접근 확인
