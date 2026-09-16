---
name: frontend-design
description: Use for ANY UI work in this repo — creating or changing components, pages, layouts, styling, colors, spacing, popups, redesigns or "make it look better" requests. Ensures changes use the house UI kit and stay visually consistent with the rest of the app.
---

# Frontend design workflow (wt-frontend)

This app has a house design system. AI-generated UI that ignores it looks
foreign and gets reverted. Follow this workflow for every UI task.

## 1. Load the contract

Read (skim headings, read relevant sections fully):

- `docs/design/DESIGN-SYSTEM.md` — tokens (colors, typography, spacing, breakpoints, Z_INDEX)
- `docs/design/COMPONENTS.md` — decision table + catalog of `@/common/ui` primitives and composites
- `docs/design/PATTERNS.md` — page structure, styling rules, i18n, verification

## 2. Find the precedent

Never design from scratch. Locate 2–3 existing screens/components most
similar to the task (song page `src/app/(layout)/pisen`, list `seznam`,
account `ucet`, team pages, or the closest composite in
`src/common/components`). Read them and copy their structure: SmartPage
options, spacing rhythm, component choices, i18n namespaces.

If unsure how a primitive behaves, check its `*.story.tsx` and the
`/storybook` route.

## 3. Build within the system

Hard rules (full list in CLAUDE.md):

- `@/common/ui` primitives; **no `@mui/material` imports**; escape hatch `@/common/ui/mui`
- `sx` with theme units + palette paths; no hex, no raw px magic numbers
- `Typography` sugar props (`strong`, `small`) instead of font `sx` tweaks
- Texts via `useTranslations` + keys into `content/*.json` (all brands)
- Typed navigation (`to`/`toParams`); modals via `Popup`; `alt`/`tooltip` on icon buttons
- New primitive → barrel export + `.story.tsx` + register in `src/common/ui/index.story.tsx`

Design intent, when improving visuals: keep it light and airy (white
surfaces, `grey.100/200` panels, 1px `grey.300` borders), rounded corners,
generous whitespace (theme spacing ≥2 between blocks), blue `primary` accents,
gradient (`primarygradient`) only for hero CTAs, subtle motion via
`Clickable`. Small, consistent improvements beat dramatic restyling.

## 4. Verify (required)

```bash
npm run check-types && npm run lint && npm run test:jest
```

Visual check with the dev server (never run E2E tests):

```bash
grep -q test-chvalotce.cz /etc/hosts || echo "127.0.0.1 test-chvalotce.cz" >> /etc/hosts
npm run dev   # http://test-chvalotce.cz:5500
```

Screenshot affected pages with Playwright (Chromium is preinstalled) at
**390px and 1440px** widths — plus `/storybook` if a primitive changed — and
actually look at the screenshots. Compare against a neighboring unchanged
screen: same spacing rhythm, same component shapes, nothing visually foreign.

## 5. Review

Run the `design-reviewer` agent on the diff before finishing. Fix what it
finds. Then walk the checklist in `docs/design/PATTERNS.md` §8.
