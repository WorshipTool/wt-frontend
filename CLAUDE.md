# WorshipTool Frontend - Claude Code Guide

## Project Overview

WorshipTool is a church worship songbook management system built with Next.js 14 (App Router), Material UI v5, and TypeScript.

## Tech Stack

- **Framework**: Next.js 14.2 with App Router
- **UI Library**: Material UI v5 + Emotion CSS-in-JS
- **Animations**: Framer Motion
- **i18n**: next-intl
- **State**: React hooks + URL state + context
- **API**: Auto-generated from OpenAPI (Axios-based)
- **Feature flags**: Statsig
- **Tests**: Jest + Playwright

## Key Conventions

- Use `@/common/ui` for UI component imports (Box, Typography, Button, etc.)
- Use `@/common/ui/mui` for raw MUI imports (useMediaQuery, InputBase, etc.)
- `useTheme` is exported from `@/common/ui` (not from `@/common/ui/mui`)
- Routing uses type-safe `Link` component with route names (e.g., `to="songsList"`)
- Feature flags via `useFlag('flag_name')` hook
- Translations via `useTranslations('namespace')` from next-intl

## Architecture

- `/src/app/(layout)/` - Pages with standard layout (toolbar + footer)
- `/src/app/(nolayout)/` - Pages without layout (auth pages)
- `/src/app/components/` - Page-level components
- `/src/app/components/home/` - Homepage redesign components
- `/src/common/` - Shared components, UI library, providers
- `/src/api/` - API layer (generated + custom hooks)
- `/src/hooks/` - Custom React hooks
- `/src/routes/` - Type-safe routing

## Homepage Architecture

The homepage (`/`) uses a modular component structure:
- `HomeDesktop` - Main orchestrator (search state, toolbar config)
- `HeroSection` - Hero area with animated gradient background and search
- `SongIdeasSection` - Horizontal scrolling recommended songs
- `RecentlyAddedSection` - Grid of recently added songs
- `HomeSearchBar` - Glassmorphism search input
- `HomeSearchResults` - Search results wrapper

## Testing

- Jest unit tests in `__tests__/` directories alongside components
- When testing components with deep dependency chains, mock ESM modules (statsig, next-intl, react-masonry, framer-motion) in a shared setup file
- Playwright E2E tests in `/tests/e2e/`
- Run: `npm run test:jest` for unit tests, `npm run test:e2e:smoke` for E2E

## Commands

```bash
npm run dev          # Dev server on port 5500
npm run build        # Production build
npm run test:jest    # Unit tests
npm run check-types  # TypeScript type checking
```
