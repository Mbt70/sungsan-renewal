# Migration Rehearsal Tools

이 문서는 기존 그누보드4 백업을 새 그누보드5 `sungsan` 사이트로 옮기기 전, 로컬 또는 Cafe24 스테이징에서 반복 실행할 리허설 산출물을 정리합니다. 원본 DB dump, 회원 명부, 첨부 파일 원본, `.env`는 Git에 올리지 않습니다.

## Outputs

| 도구 | 입력 | 출력 | 기준 |
| --- | --- | --- | --- |
| `tools/migration/post-transform.mjs` | 기존 게시글 행 | `news/free` 글 INSERT SQL | `wr_5`, `wr_6`에 기존 보드/글 ID 보존 |
| `tools/migration/member-transform.mjs` | 기존 회원 행 JSON/JSONL | `g5_member` INSERT SQL | 레거시 비밀번호 해시는 버리고 `mb_3=password_reset_required` 표시 |
| `tools/migration/file-plan.mjs` | 이전된 글과 첨부 묶음 JSON/JSONL | 첨부 계획 JSON, `g5_board_file` INSERT SQL | `news/free` 대상만 생성, `exclude/intro` 대상과 차단 확장자는 복사 제외 |
| `tools/migration/redirect-map.mjs` | 이전 결과 JSON/JSONL | redirect CSV 또는 Apache 초안 | 실제 이전된 `news/free` 글만 포함 |
| `tools/migration/rehearsal-summary.mjs` | posts, members, attachmentPlan, redirectRecords 묶음 JSON | 리허설 요약 JSON | 글/회원/첨부/redirect/검토 플래그 수와 사유별 하위 카운트 대조 |

## Commands

```powershell
node tools/migration/member-transform.mjs .\members.jsonl .\members-import.sql
node tools/migration/file-plan.mjs .\attachments.jsonl .\attachment-copy-plan.json .\board-file-import.sql
node tools/migration/redirect-map.mjs .\migration-output.jsonl .\redirects.csv csv
node tools/migration/redirect-map.mjs .\migration-output.jsonl .\redirects-apache.txt apache
node tools/migration/rehearsal-summary.mjs .\rehearsal-bundle.json .\rehearsal-summary.json
```

`attachments.jsonl`의 각 행은 `legacyBoard`, `legacyPostId`, `targetBoard`, `targetPostId`, `files`를 포함합니다. `files`는 기존 `board_file` 행 배열입니다. 도구는 `../danger.pdf` 같은 경로 조작 문자열에서 파일명만 남기고, 새 파일명은 `{legacyBoard}_{legacyPostId}_{sourceFile}` 형식으로 만듭니다.

`attachment-copy-plan.json`은 `copyRecords`, `fileRows`, `blockedRecords`를 포함합니다. `blockedRecords`에는 PHP, PHP7/PHP8, HTML, JS, SVG 계열 파일, `shell.php7`, `shell.php8`, `shell.php.jpg` 같은 실행형 또는 다중 확장자 파일, `.htaccess`, `.user.ini` 같은 서버 설정 파일이 `blocked-extension` 사유로 기록됩니다.

`rehearsal-summary.json`은 운영자 검수표에 바로 옮길 수 있도록 다음 하위 카운트를 포함합니다.

- `posts.excludedByLegacyBoard`: `z6_2`, `z6_3`처럼 공개 이전 금지 보드에서 제외된 글 수
- `posts.reviewReasons`: `possible-member-directory`처럼 `wr_7=review_required`로 남긴 검토 사유별 글 수
- `members.byLevel`: 이전 회원의 새 권한 분포. `member`, `officer`, `admin`, `pending`, `unknown` 수를 운영자 승인 계획과 대조합니다.
- `members.passwordResetMissing`: `mb_3=password_reset_required` 플래그가 없는 회원 수. 0이 아니면 회원 SQL을 다시 검토합니다.
- `attachments.blockedByReason`: `blocked-extension` 등 첨부 복사 차단 사유별 수
- `attachments.blockedByLegacyBoard`: 차단 첨부가 나온 원본 보드별 수

## Review Rules

- `z6_2`, `z6_3`은 공개 이전 금지 보드이므로 글, 첨부, redirect 산출물에 들어가면 안 됩니다.
- 모든 이전 대상 게시글에서 회원 명부성 문구가 발견되면 `wr_7=review_required`, `wr_8=possible-member-directory`로 표시된 수를 운영자가 확인합니다.
- 회원 비밀번호와 게시글 비밀번호는 이전하지 않습니다. 스테이징에서 회원에게 비밀번호 재설정 절차를 안내할 운영 문구와 관리자 승인 흐름을 별도로 점검합니다.
- 첨부 복사는 계획 JSON을 먼저 검토한 뒤 SFTP 또는 로컬 스크립트로 수행합니다. `blockedRecords`에 기록된 PHP, PHP7/PHP8, HTML, JS, SVG 계열 파일, `shell.php7`, `shell.php8`, `shell.php.jpg` 같은 실행형 또는 다중 확장자 파일, `.htaccess`, `.user.ini` 같은 서버 설정 파일은 복사하지 않습니다.
- 리허설 요약의 기존 글 수, 새 글 수, 회원 수, 첨부 수, redirect 수가 운영자 검수표와 맞아야 운영 전환 단계로 넘어갑니다.
