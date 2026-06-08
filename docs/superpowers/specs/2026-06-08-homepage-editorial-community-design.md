# Homepage Editorial Community Design

## Context

The homepage must follow the planning workbook, `DESIGN.md`, and the current migration/operations docs. The primary job is not to look like a decorative landing page. It is to help Sungsan members, including older members, confirm important notices and find materials quickly.

The current image-led hero does not meet that bar. The generated image feels artificial and takes attention away from notices, schedules, and materials. The revised direction removes the hero image and replaces it with an editorial community layout.

## Design Direction

Use the planning workbook's HOME screen as the source of truth:

- Introduce Sungsan in one or two clear lines.
- Surface recent and important notices immediately.
- Surface upcoming schedules immediately.
- Provide quick routes to notices, schedules, materials, and the free board.
- Keep photos and videos visible, but secondary to notices and schedules.
- Keep all text large, plain, and scannable on mobile first.

The visual language remains `public + warm`:

- KRDS influence: predictable structure, visible focus states, clear touch targets, strong contrast, no auto sliders.
- Phi reference influence: restrained spacing, tidy type rhythm, calm cards and lists.
- Sungsan-specific warmth: warm ivory surfaces, Sungsan blue for action/links, brown-gold accents for section markers and important labels.

## Homepage Layout

The new homepage top section uses two columns on desktop and one column on mobile:

1. Left: short identity copy, primary action to `소식`, secondary action to `소개`, and four quick route cards.
2. Right: `오늘 확인할 일`, a compact priority panel combining latest notices and upcoming schedules.

Below the top section:

1. `최근 공지` and `다가오는 일정` remain first-class lists.
2. `자료와 규정` and `자유게시판` follow as scannable list panels.
3. `활동소식`/photo-video media remains a visual secondary section.

This keeps the first screen useful even when there are no images.

## Component Rules

- Remove `hero-sungsan-hanok.png` from the production theme.
- Do not use decorative or generated hero artwork for the primary homepage message.
- Add homepage-specific classes for quick links and the priority panel; do not overload board skins.
- Keep `ss-hero` generic enough for the intro page.
- Keep buttons at least 44px high.
- Keep mobile at 375px without horizontal overflow.
- Keep body text at the existing readable scale.

## Acceptance Criteria

- Static tests assert the homepage no longer references the generated hanok hero image.
- Static tests assert the homepage renders:
  - `.ss-home-hero`
  - `.ss-home-copy`
  - `.ss-home-priority`
  - `.ss-home-quick-links`
- CSS tests assert:
  - the homepage hero returns to a warm editorial surface, not a dark image-led hero;
  - the priority panel and quick links have clear borders, readable text, and 44px touch targets;
  - mobile quick links collapse to one column.
- Browser verification captures desktop and 375px mobile previews with no horizontal overflow.
- `npm run verify` passes.

