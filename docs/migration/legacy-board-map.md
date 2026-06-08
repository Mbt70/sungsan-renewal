# Legacy Board Migration Map

기존 사이트는 그누보드4 계열이며 공개 화면에서 다음 보드 ID가 확인되었습니다. 새 사이트에서는 상단 메뉴를 단순화하고 기존 보드명은 `news`의 종류와 소속으로 보존합니다.

| 기존 보드 | 기존 이름 | 새 대상 | 종류 | 소속 slug | 공개 범위 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| `z1_1` | 공지사항 | `news` | 공지 | `notice` | public | 홈 최신 공지 |
| `z1_2` | 묻고 답하기 | `news` | 자료 | `faq` | member | 운영자 검수 |
| `z1_3` | 홈페이지 개선 제안 | `news` | 자료 | `website` | member | 보존성 검토 |
| `schedule` | 성산회 일정 | `news` | 행사 | `event` | public | `wr_3`, `wr_4`에 일정일 저장 |
| `z2_1` | 성산헌장 | intro | - | - | public | 소개 섹션 |
| `z2_2` | 성산회가 | intro | - | - | public | 소개 섹션 |
| `z2_3` | 명예회장 인사말 | intro | - | - | public | 소개 섹션 |
| `z2_4` | 회장 인사말 | intro | - | - | public | 소개 섹션 |
| `z2_5` | 조직도 | intro | - | - | public | 소개 섹션 |
| `z3_1` | 임원회 | `news` | 활동소식 | `executive` | member | 임원 전용 여부 재검토 |
| `z3_2` | 경제부 | `news` | 활동소식 | `economy` | member |  |
| `z3_3` | 사회복지부 | `news` | 활동소식 | `welfare` | member |  |
| `z3_4` | 인재양성부 | `news` | 활동소식 | `talent` | member |  |
| `z3_5` | 문화부 | `news` | 활동소식 | `culture` | member |  |
| `z3_6` | 기금관리위원회 | `news` | 활동소식 | `fund` | officer | 민감 가능성 |
| `z3_7` | 운영위원회 | `news` | 활동소식 | `operations` | officer | 민감 가능성 |
| `z3_9` | 성우회 | `news` | 활동소식 | `sungwoo` | member |  |
| `z4_1` | 문화클럽 | `news` | 활동소식 | `culture-club` | member |  |
| `z4_2` | 리더스클럽 | `news` | 활동소식 | `leaders-club` | member |  |
| `z4_3` | 산악회 | `news` | 활동소식 | `mountain-club` | member |  |
| `z5_1` | 성산회보 | `news` | 자료 | `newsletter` | member | 첨부 중심 |
| `z5_2` | 사진자료 | `news` | 활동소식 | `photo` | member | 미디어 갤러리 후보 |
| `z5_3` | 좋은글 모음 | `news` | 자료 | `essay` | member | 보존성 검토 |
| `z5_4` | 총회 및 마짐회자료 | `news` | 자료 | `general-meeting` | member | 첨부 중심 |
| `z5_5` | 업무규정 및 절차 | `news` | 규정 | `policy` | member | 중요 글 고정 |
| `z5_6` | 기타자료 | `news` | 자료 | `etc` | member |  |
| `z6_1` | 자유게시판 | `free` | - | - | member | 자유게시판 |
| `z6_2` | 회원정보 | exclude | - | - | admin | 공개 이전 금지 |
| `z6_3` | 회원이력 | exclude | - | - | admin | 공개 이전 금지 |

## Field Policy
- `ca_name`: `공지`, `행사`, `자료`, `규정`, `활동소식`
- `wr_1`: 소속 slug
- `wr_2`: 공개 범위, `public`, `member`, `officer`
- `wr_3`: 행사 시작일
- `wr_4`: 행사 종료일
- `wr_5`: 기존 보드 ID
- `wr_6`: 기존 글 ID
- `wr_7`: 이전 리허설 검토 플래그. 수동 검토가 필요하면 `review_required`
- `wr_8`: 검토 사유. 예: `possible-member-directory`

## Migration Rule
- `tools/migration/member-transform.mjs`는 기존 회원 기본 정보와 권한만 `g5_member`로 옮기는 SQL을 만들고, 레거시 비밀번호 해시는 버립니다. 모든 이전 회원은 `mb_3=password_reset_required`로 표시합니다.
- `tools/migration/file-plan.mjs`는 `news/free`로 실제 이전된 글의 첨부만 `data/file/{target_board}` 복사 계획과 `g5_board_file` SQL로 만듭니다. `z6_2`, `z6_3`, `intro`, `exclude` 대상 첨부는 산출물에서 제외하고 PHP, HTML, JS, SVG 계열 파일과 서버 허용 목록 밖 확장자는 `blockedRecords`로 남깁니다.
- `tools/migration/rehearsal-summary.mjs`는 글, 회원, 첨부, redirect, 수동 검토 플래그 수를 JSON으로 요약해 운영자 검수표와 대조합니다.
- 기존 글 ID와 보드 ID는 항상 보존합니다.
- 첨부파일은 기존 `/renewal/data/file/{bo_table}`에서 새 `data/file/{target_board}`로 복사합니다.
- 회원 비밀번호와 게시글 비밀번호는 그대로 이전하지 않습니다. 기본 정보와 권한만 이전하고 재설정 절차를 사용합니다.
- `z6_2`, `z6_3`은 운영자 검수 전까지 새 공개 화면으로 이전하지 않습니다.
- 모든 이전 대상 게시글은 제목·본문에 `회원명부`, `회원명단`, `주소록`, `연락처` 성격의 표현이 있으면 `wr_7`, `wr_8`에 검토 플래그를 남깁니다.
- 기존 URL redirect는 실제로 `news/free`에 이전된 글만 생성합니다. `tools/migration/redirect-map.mjs`는 JSON/JSONL 변환 결과를 받아 CSV 또는 Cafe24 전달용 Apache `RewriteCond`/`RewriteRule` 초안을 만듭니다. 기존 그누보드4 글 URL은 bo_table/wr_id 쿼리스트링으로 글을 식별하므로 Apache 산출물은 query string 조건을 함께 확인합니다.
- Rows with `wr_7=review_required` stay out of redirect CSV/Apache output until operator review clears them.
