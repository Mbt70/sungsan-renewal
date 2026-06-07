# Design System - 성산회

## Product Context
- 성산회 홈페이지는 회원이 공지, 일정, 자료, 자유게시판 글을 빠르게 확인하는 단체 운영 사이트다.
- 주요 이용자는 비회원 방문자, 일반 회원, 임원, 운영자이며 어르신 회원 비중을 고려한다.
- 화면은 모바일 우선이며 큰 글자, 명확한 버튼, 낮은 인지 부담을 우선한다.

## Aesthetic Direction
- Direction: 공공형+온기.
- Mood: KRDS처럼 명확하고 신뢰감 있는 구조에, 성산회 자료와 활동 사진이 자연스럽게 살아나는 따뜻한 단체 홈페이지.
- Reference: KRDS의 접근성/일관성, Phi의 정돈된 여백과 타이포그래피 밀도.

## Typography
- Korean/body: Pretendard GOV 또는 Pretendard. Cafe24에서 외부 폰트 로딩이 부담되면 `Noto Sans KR`, `Malgun Gothic`, sans-serif 순서로 대체한다.
- Display: 같은 계열의 굵은 weight를 사용한다. 장식적인 서체는 쓰지 않는다.
- Body size: 기본 18px, 모바일 최소 17px.
- Line-height: 본문 1.72, UI 1.45.
- Numeric/date: tabular numbers where supported.

## Color
- Primary: `#1E5AA8` Sungsan Blue. 주요 링크, 활성 필터, 기본 버튼.
- Primary strong: `#153F78`. 버튼 hover와 헤더 강조.
- Warm accent: `#B86B28`. 일정, 활동, 보조 강조.
- Surface: `#FFFFFF`, `#F7F8FA`, `#F1F4F8`.
- Text: `#1E2124`, `#464C53`, `#6B7280`.
- Border: `#D9DEE8`, `#C7CEDB`.
- Semantic: success `#17803D`, warning `#B86B28`, error `#D92D20`, info `#1E5AA8`.

## Spacing
- Base unit: 4px.
- Density: comfortable.
- Scale: 4, 8, 12, 16, 24, 32, 48, 64.
- Section spacing: mobile 32-48px, desktop 48-72px.

## Layout
- Approach: grid-disciplined with warm editorial rhythm on the home page.
- Max width: 1120px.
- Mobile: one column, visible primary navigation, no auto slider.
- Desktop: home content uses balanced two-column blocks only where scan speed improves.
- Radius: small 4px, default 8px, media 12px.
- Shadows: avoid heavy card shadows; use borders and soft surface contrast.

## Components
- Header: logo, `홈 / 소개 / 소식 / 자유게시판`, integrated search, account action.
- Buttons: primary filled, secondary outlined, text link. Height at least 44px.
- Chips: category filters with high contrast active state.
- Lists: title-first, date and category metadata visible, no tiny table text.
- Badges: category and group badges before metadata, never color-only.
- Forms: large labels, 44px inputs, clear required markers.
- Footer: group identity, email collection rejection link, management contact link.

## Accessibility
- Do not use auto-advancing sliders.
- All touch targets must be at least 44px high.
- Focus states must be visible.
- Text contrast should meet WCAG AA for normal text.
- Content should remain readable at 200% browser zoom.

## Decisions Log
| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-06-07 | 공공형+온기 direction | KRDS clarity fits older users and Phi-like spacing adds polish without making the site cold. |
| 2026-06-07 | SCSS tokens instead of Tailwind | Cafe24 deployment stays simple while keeping the design system maintainable. |

