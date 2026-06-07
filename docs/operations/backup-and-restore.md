# Backup And Restore

## Backup Targets
- MySQL/MariaDB DB 전체
- `/renewal/data`
- `/renewal/data/sungsan.groups.php`: 운영자가 조정한 소속 slug와 라벨
- 기존 `/renewal` 소스
- 새 사이트 운영 전환 직전 `www/data`

## Local Restore Drill
리허설 산출물은 `docs/migration/rehearsal-tools.md`의 도구로 생성합니다. 회원 SQL은 비밀번호 재설정 플래그를 포함해야 하고, 첨부 복사 계획은 `news/free` 대상만 포함해야 합니다.

1. DB 덤프를 로컬 `backups/`에 둡니다.
2. EUC-KR 덤프는 UTF-8 변환 후 별도 파일로 저장합니다.
3. Docker DB에 복원합니다.
4. 보드별 글 수, 첨부 수, 회원 수를 대조합니다.
5. 샘플 글 20개 이상을 열어 한글과 첨부를 확인합니다.
6. 변환 결과에서 `review_required` 글 수와 제외 보드(`z6_2`, `z6_3`) 건수를 기록합니다.
7. redirect CSV를 생성해 기존 글 샘플 URL이 새 글 URL로 이어지는지 대조합니다.

## Integrity Evidence
백업과 배포 산출물은 복원 리허설 전에 해시를 남깁니다. Windows 로컬에서는 다음 명령으로 ZIP, SQL dump, data 압축 파일의 SHA256 값을 기록합니다.

```powershell
Get-FileHash -Algorithm SHA256 .\backups\*.zip
Get-FileHash -Algorithm SHA256 .\backups\*.sql*
Get-FileHash -Algorithm SHA256 .\release\sungsan-site-*.zip
```

릴리스 ZIP은 같은 이름의 `.sha256` 파일과 값이 일치해야 합니다. 백업 해시는 개인정보가 없는 파일명, SHA256 값, 생성일만 운영 기록에 남기고 원본 dump나 `/renewal/data` 압축 파일은 Git에 올리지 않습니다.

## Rehearsal Evidence
리허설이 끝나면 `rehearsal-summary.json`을 생성해 아래 항목을 검수표와 대조합니다.

- `blockedRecords`에 남은 PHP, HTML, JS, SVG 계열 첨부, `shell.php.jpg` 같은 다중 확장자 파일, `.htaccess`, `.user.ini` 서버 설정 파일 수
- `blockedByReason`, `blockedByLegacyBoard`로 나뉜 차단 첨부 사유와 원본 보드별 수
- `wr_7=review_required` 글 수, `reviewReasons`, 운영자 검토 대상 목록
- `members.byLevel`의 `member/officer/admin/pending/unknown` 분포와 운영자 승인 계획의 일치 여부
- `members.passwordResetMissing`이 0인지 확인하고 모든 이전 회원에 `mb_3=password_reset_required`가 남았는지 검토
- 게시글 비밀번호는 이전 SQL에 남기지 않고 빈 값으로 가져왔는지 샘플 SQL에서 확인
- `excludedByLegacyBoard`에서 `z6_2`, `z6_3` 원본 글과 첨부가 공개 이전 산출물에 들어가지 않았다는 확인
- `redirect` CSV와 Apache 초안의 생성 수와 샘플 URL 검수 결과

## Count Reconciliation
| 항목 | 기존 | 신규 | 검수일 | 상태 | 확인 |
| --- | --- | --- | --- | --- | --- |
| 회원 수 |  |  |  | 대기 |  |
| 공지/소식 글 수 |  |  |  | 대기 |  |
| 자유게시판 글 수 |  |  |  | 대기 |  |
| 첨부파일 수 |  |  |  | 대기 |  |
| 차단 첨부파일 수 |  |  |  | 대기 |  |
| 비공개/회원 데이터 |  |  |  | 대기 |  |
| 검토 필요 글 수 |  |  |  | 대기 |  |
| redirect 생성 수 |  |  |  | 대기 |  |

상태는 `대기/통과/보류` 중 하나로 적습니다. 보류가 하나라도 있으면 운영 전환하지 않습니다.

## Restore Rule
- 복구 파일은 GitHub에 올리지 않습니다.
- 복원 리허설 로그는 개인정보가 없는 요약만 문서화합니다.
- 운영 전환 당일 백업은 별도 이름으로 보관합니다.

## Rollback Record
운영 전환 당일에는 아래 정보를 전환 기록에 남깁니다. `rollback` 판단이 필요하면 루트 전환 전 백업한 DB와 `www/data`를 기준으로 되돌립니다.

| 항목 | 값 |
| --- | --- |
| 복구 담당자 |  |
| 검수일 |  |
| 운영 전환 직전 DB 백업 위치 |  |
| 운영 전환 직전 `/renewal/data` 백업 위치 |  |
| 운영 전환 직전 `www/data` 백업 위치 |  |
| rollback 판단 기준 | 로그인, 첨부, 게시판 권한, 기존 URL redirect 중 운영 차단 이슈 발생 |
| rollback 실행 결과 | 대기 |
