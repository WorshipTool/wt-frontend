# CLAUDE.md — wt-frontend (WorshipTool / chvalotce.cz)

Frontend-only repository: Next.js 14 (App Router) + TypeScript (strict) +
MUI v5 wrapped in a **house UI kit**. Backend lives elsewhere; all data comes
from a generated API client. Multi-brand white-label app (chvalotce /
chwalmy / hallelujahhub via `content/*.json`).

## ⚠️ Before ANY UI / design / styling work

Read these three docs first — they are the contract for visual consistency:

1. `docs/design/DESIGN-SYSTEM.md` — tokens: colors, typography, spacing, breakpoints, z-index
2. `docs/design/COMPONENTS.md` — the house component catalog + decision table (what to use instead of raw MUI)
3. `docs/design/PATTERNS.md` — how to build pages, styling rules, i18n, responsiveness, verification checklist

The golden rule: **imitate existing screens, don't invent new visual
language.** If your change looks different from neighboring screens, it's
wrong even if it looks good in isolation.

## Critical rules (apply to every change)

- **Never import from `@mui/material` directly** (ESLint error). Use
  `@/common/ui` primitives; escape hatch: `@/common/ui/mui`. Icons from
  `@mui/icons-material` are fine.
- **No hardcoded user-facing strings** — everything via next-intl
  `useTranslations`; add keys to `content/chvalotce.json` (+ the other brand
  catalogs).
- **No hardcoded hex colors / raw px spacing** in TSX — palette paths
  (`'grey.200'`, `'primary.main'`) and theme spacing units in `sx`.
- **Typed navigation only** — route keys in `src/routes/routes.ts`,
  `to`/`toParams` props, `useSmartNavigate()`. Never string URLs.
- **Modals via `Popup`** (`@/common/components/Popup/Popup`), never MUI
  Dialog or `window.confirm`.
- **Pages export `SmartPage(Component, options)`**, not bare components.
- **Generated API files are READ-ONLY** (`src/api/generated`, regenerated
  from backend Swagger via `npm run generate-api`). Never edit them.
- Don't add `'use server'` as a "server file marker" — server components are
  the default; the directive creates Server Actions.

## Commands

```bash
npm run dev           # dev server → http://test-chvalotce.cz:5500
                      # (needs `127.0.0.1 test-chvalotce.cz` in /etc/hosts)
npm run check-types   # tsc --noEmit — run after every change
npm run lint          # next lint
npm run test:jest     # unit tests (Jest)
npm run build         # production build
```

**NEVER run E2E tests** (`npm run test:e2e*`) during development — slow,
they run in CI / manually. Use Jest only.

## Architecture map

```
src/
  app/                  App Router pages
    (layout)/           standard pages with Toolbar/Footer (home, pisen, playlist, seznam, ucet, storybook…)
    (nolayout)/         chromeless pages on gradient bg (login, registration)
    (submodules)/(teams)/  team module (own providers, SmartTeamPage)
    (subdomains)/       subdomain routing internals
    theme.tsx           MUI theme (typography scale)
  common/
    ui/                 ★ house UI primitives (Button, Typography, …) — see docs/design/COMPONENTS.md
    components/         composites (Popup, Toolbar, SmartPage, SongListCards, SheetDisplay…)
    constants/          theme palette seed, Z_INDEX
    hooks/              useDownSize, …
  hooks/                app hooks (auth, playlist, song, permissions, useApiState…)
  routes/               ★ typed routing layer (routesPaths, useSmartNavigate, SmartParams)
  api/                  generated OpenAPI client (READ-ONLY) + wrapper
  tech/                 framework-agnostic utilities (theme.tech getColorHex/breakpoints, string, date…)
  interfaces/, types/   domain types (historically split — don't add a third home)
content/*.json          i18n message catalogs per brand (next-intl)
docs/                   project docs; docs/DESIGN-REVIEW.md = known tech-debt audit
```

`/storybook` route = live in-app component gallery (custom `createStory`
registry, `*.story.tsx` files next to each primitive).

## Working style

- Focus on correctness and clarity; prefer simple solutions over complex
  abstractions; avoid unnecessary refactors and drive-by changes.
- UI work is done only after the verification checklist in
  `docs/design/PATTERNS.md` §8 passes (types, lint, jest, visual check at
  mobile + desktop widths).
- Known tech debt is catalogued in `docs/DESIGN-REVIEW.md` — don't "fix"
  architectural debt casually inside unrelated tasks, and don't copy the
  anti-patterns it lists (legacy MUI Dialogs, hardcoded hexes, `'use server'`
  markers, deprecated alias props…).

## Specialized agents (.claude/agents)

- `design-reviewer` — run after UI changes to check design-system compliance
- `bug-fixer`, `clean-code-reviewer` — debugging / code-quality reviews
