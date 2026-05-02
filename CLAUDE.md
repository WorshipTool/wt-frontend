# CLAUDE.md — WorshipTool Frontend

## Project Overview

WorshipTool (ChValotce / worship.cz) is a worship song management platform built with Next.js 14 (App Router), Material-UI 5, TypeScript, and framer-motion.

## Key Directories

- `src/app/(layout)/` — Pages with toolbar/footer (home, song detail, playlists, etc.)
- `src/app/(nolayout)/` — Pages without layout (login, registration)
- `src/app/components/` — App-level components (home page, providers)
- `src/app/components/home/` — New home page components (redesigned March 2026)
- `src/common/` — Shared components, providers, hooks, UI primitives
- `src/common/ui/` — Re-exported/wrapped MUI components
- `src/hooks/` — Custom React hooks
- `src/api/` — Auto-generated API clients (OpenAPI)
- `src/routes/` — Type-safe route definitions
- `src/types/` — TypeScript type definitions
- `content/` — i18n translation files (chvalotce.json, chwalmy.json, hallelujahhub.json)

## Development

```bash
npm run dev          # Start dev server on port 5500
npm run build        # Production build
npm run test:jest    # Unit tests (Jest)
npm run test:e2e     # E2E tests (Playwright)
```

## Architecture Notes

- **Routing**: App Router with route groups `(layout)`, `(nolayout)`, `(submodules)`
- **Styling**: MUI theme + Emotion + CSS Modules for new components
- **i18n**: next-intl with multiple content versions (chvalotce, chwalmy, hallelujahhub)
- **State**: React Context providers (auth, toolbar, footer, favorites, etc.)
- **API**: Generated from OpenAPI spec, consumed via `useApi()` hook
- **Search**: Full-text search + embedding-based smart search (feature-flagged)

## Home Page (Redesigned March 2026)

The home page was redesigned from scratch with an editorial/warm aesthetic:

- **Location**: `src/app/components/home/`
- **Entry**: `HomeDesktopNew.tsx` (re-exported from `HomeDesktop.tsx`)
- **Components**: HomeSearchBar, QuickSearchTags, SongIdeasSection, RecentlyAddedSection, BrowseAllBanner
- **Styling**: `HomeDesktop.module.css` (CSS Modules with warm dark hero + cream content area)
- **Layout**: Full-width via `SmartPage(fullWidth, hidePadding)`, `.pageWrapper` covers global background, hero uses negative margin to extend behind transparent toolbar, gradient transition between hero and content
- **Tests**: `__tests__/` directory with 17 unit tests

## Conventions

- Components use `'use client'` directive when they need client-side features
- Translation keys accessed via `useTranslations('namespace')`
- Routes defined in `src/routes/routes.ts` with type-safe params
- Song variants identified by `packAlias` and navigated via `parseVariantAlias()`
- Feature flags controlled via Statsig (`useFlag` hook)
