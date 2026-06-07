# Backup And Restore

## Backup Targets
- MySQL/MariaDB DB 전체
- `/renewal/data`
- 기존 `/renewal` 소스
- 새 사이트 운영 전환 직전 `www/data`

## Local Restore Drill
1. DB 덤프를 로컬 `backups/`에 둡니다.
2. EUC-KR 덤프는 UTF-8 변환 후 별도 파일로 저장합니다.
3. Docker DB에 복원합니다.
4. 보드별 글 수, 첨부 수, 회원 수를 대조합니다.
5. 샘플 글 20개 이상을 열어 한글과 첨부를 확인합니다.
6. 변환 결과에서 `review_required` 글 수와 제외 보드(`z6_2`, `z6_3`) 건수를 기록합니다.
7. redirect CSV를 생성해 기존 글 샘플 URL이 새 글 URL로 이어지는지 대조합니다.

## Count Reconciliation
| 항목 | 기존 | 신규 | 확인 |
| --- | --- | --- | --- |
| 회원 수 |  |  |  |
| 공지/소식 글 수 |  |  |  |
| 자유게시판 글 수 |  |  |  |
| 첨부파일 수 |  |  |  |
| 비공개/회원 데이터 |  |  |  |
| 검토 필요 글 수 |  |  |  |
| redirect 생성 수 |  |  |  |

## Restore Rule
- 복구 파일은 GitHub에 올리지 않습니다.
- 복원 리허설 로그는 개인정보가 없는 요약만 문서화합니다.
- 운영 전환 당일 백업은 별도 이름으로 보관합니다.
