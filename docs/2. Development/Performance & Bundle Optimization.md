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
- `@react-oauth/google`
- `mixpanel-browser`, `socket.io-client`, `jwt-decode`, `crypto-js`

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

### 5. Dynamically Imported Heavy Libraries

Several heavy libraries are loaded via dynamic `import()` to keep them out of the initial page bundle:

- **Statsig plugins** (`@statsig/web-analytics`, `@statsig/session-replay`) - imported dynamically in `FeatureFlagsProvider.tsx` rather than at module level. The provider renders children immediately and wraps them with StatsigProvider once plugins are loaded.
- **Mixpanel** (`mixpanel-browser`) - imported dynamically in `MixPanelAnalytics.tsx` and `analytics.tech.ts` using `import()` instead of static imports.
- **Google OAuth** (`@react-oauth/google`) - loaded via `next/dynamic` wrapper (`LazyGoogleOAuthProvider.tsx`) with `ssr: false`, deferring the Google GSI script (~91 KiB) from initial page load.
- **Analytics component** - The root `Analytics` component in `layout.tsx` is lazy-loaded with `next/dynamic` and `ssr: false`.

### 6. Route-Level Providers

Providers that are only needed by specific routes are placed at the component level instead of wrapping the entire app:

- **`LocalizationProvider`** (MUI DatePicker + DayJS adapter) - moved from `AppClientProviders.tsx` (global) to `TeamEventPopup.tsx` (only component using DatePicker). This prevents `@mui/x-date-pickers` and `dayjs/locale/cs` from loading on every page.

### 7. Removed Unused Dependencies

The following packages were removed because they had no imports in the codebase:

- `react-markdown`
- `react-spotify-embed`
- `@stripe/react-stripe-js`
- `@stripe/stripe-js`
- `react-device-detect` (replaced with lightweight UA detection in `src/tech/device.tech.ts`)

### 8. Legacy JavaScript Elimination

Lighthouse flagged ~29 KiB of unnecessary polyfills shipped to modern browsers. Two changes address this:

**a) Removed Next.js built-in `polyfill-module.js` (~11 KiB saved)**

Next.js 14 unconditionally bundles `next/dist/build/polyfills/polyfill-module.js` into every client page. This file polyfills `Array.prototype.{at,flat,flatMap}`, `Object.{fromEntries,hasOwn}`, `String.prototype.{trimStart,trimEnd}`, `Symbol.prototype.description`, and `Promise.prototype.finally`.

Since our browserslist targets (Chrome 93+, Edge 93+, Firefox 92+, Safari 15.4+) natively support all of these, the polyfill is dead weight. The webpack config aliases this file to an empty module (`src/polyfills/empty.js`) for client builds only.

**b) Added `notistack` to `transpilePackages`**

notistack ships pre-compiled ESM with inline Babel class helpers (`_createClass`, `_defineProperties`, `_inheritsLoose`, `_extends`). Adding it to `transpilePackages` lets SWC re-compile the package using our browserslist targets, converting these to native class syntax.

**Guard rails:**
- `src/tech/__tests__/browserslist.tech.test.ts` validates that:
  - Browserslist targets are modern enough for all polyfilled features
  - The empty polyfill replacement file exists and contains no executable code
  - `next.config.mjs` correctly aliases the polyfill and includes packages in `transpilePackages`

### 9. Bundle Analyzer

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
5. **Analytics/tracking libraries** should be dynamically imported since they aren't needed for initial render.
6. **Providers wrapping the entire app** should only be at root level if they're truly needed on every page. Otherwise, place them at the route or component level.
7. **Third-party auth scripts** (Google, Facebook, etc.) should be deferred or lazy-loaded to avoid blocking initial page render.

## Monitoring

Run Lighthouse audits periodically and check the "Reduce unused JavaScript" metric. Target: keep first-party unused JS under 200 KiB.
