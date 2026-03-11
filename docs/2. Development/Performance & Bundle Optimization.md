# Performance & Bundle Optimization

## Overview

This document describes the strategies used to reduce unused JavaScript and improve page load performance.

## Strategies Applied

### 1. `optimizePackageImports` (next.config.mjs)

Next.js `optimizePackageImports` ensures proper tree-shaking of barrel exports from large libraries. Without this, importing a single icon from `@mui/icons-material` would pull the entire library into the bundle.

**Configured libraries:**
- `@mui/icons-material`, `@mui/material`, `@mui/lab`, `@mui/x-charts`, `@mui/x-date-pickers`
- `framer-motion`
- `notistack`, `dayjs`, `react-snowfall`
- `@statsig/*` packages
- `@stripe/*` packages

**Impact:** Reduces unused JS from barrel exports by ~200-300 KiB.

### 2. Lazy-Loaded Admin Components (`LazyAdminComponents.tsx`)

All admin-only components in the root layout are loaded via `next/dynamic` with `ssr: false`. They are gated behind an `isAdmin()` check, so non-admin users (the majority) never download admin JS.

**Components lazy-loaded:**
- `AdminEditOverlay`
- `ProposalDialog`
- `ProposalCornerButton`
- `AdminOptionsProvider`
- `GlobalAdminNavOptions`
- `ImplementIdeaProvider`

**Impact:** ~100-200 KiB saved for non-admin users.

### 3. Lazy-Loaded Dialogs

Heavy dialog components are loaded via `next/dynamic` only when they need to be displayed:

- **`ImplementIdeaDialog`** (677 lines) - loaded in `ImplementIdeaProvider.tsx`
- **`PreviewModeDialog`** - loaded in `ImplementIdeaProvider.tsx`
- **`NewsPopup`** - loaded in `AppClientProviders.tsx`

### 4. Lazy-Loaded Snow Animation

The `Snow` component (which imports `framer-motion` + `react-snowfall`) is lazy-loaded via `next/dynamic` in `SnowWrapper.tsx`. It also skips rendering on mobile devices.

### 5. Bundle Analyzer

`@next/bundle-analyzer` is installed for ongoing monitoring. Use:

```bash
npm run build:analyze
```

This generates an interactive bundle visualization (opens in browser) to identify large chunks.

## Architecture Pattern

When adding new features, follow these guidelines:

1. **Admin-only features** should be dynamically imported and gated behind `isAdmin()`.
2. **Heavy dialogs/modals** should use `next/dynamic` with `ssr: false` since they are only shown on user interaction.
3. **Page-specific heavy libraries** (e.g., chart libraries) should stay in route-specific chunks - avoid importing them in shared layouts.
4. **Barrel exports** from large libraries should be listed in `optimizePackageImports` in `next.config.mjs`.

## Monitoring

Run Lighthouse audits periodically and check the "Reduce unused JavaScript" metric. Target: keep first-party unused JS under 200 KiB.
