# UI Patterns — how to build screens that look like this app

> Audience: AI agents and developers. Companion to
> [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) (tokens) and
> [COMPONENTS.md](./COMPONENTS.md) (building blocks).

The golden rule: **imitate, don't invent.** Before designing anything, open
2–3 existing screens closest to your task (song page, `seznam`, account
pages, team pages) and reuse their structure, spacing and components. A
change that looks different from the rest of the app is wrong even if it
looks good in isolation.

---

## 1. Building a page

1. **Pick the route group** under `src/app`:
   - `(layout)` — normal pages with Toolbar/Footer.
   - `(nolayout)/(background)` — chromeless pages on gradient background
     (login/registration style).
   - `(submodules)/(teams)` — team module (own providers + `SmartTeamPage`).
   - `(subdomains)` — subdomain routing internals; don't add pages here.
2. **Register the route** in `src/routes/routes.ts` (`routesPaths`) — all
   navigation is typed by these keys. Add search params to
   `routesSearchParams` if needed.
3. **Export through SmartPage** (see COMPONENTS.md):
   ```tsx
   export default SmartPage(MyPage, ['middleWidth'])
   ```
4. **Server-first when possible**: fetch initial data in an async server
   `page.tsx`, pass to client components. Read route params via
   `SmartParams<'routeKey'>` from `@/routes`. Don't put `'use server'` at the
   top of files as a "server marker" — it creates Server Actions; server
   components are the default. On the client, navigate with
   `useSmartNavigate()` / `useSmartParams()`.
5. **Add `loading.tsx`** with skeletons that mirror the final layout
   (`Skeleton` from `@/common/ui/mui/Skeleton`), and rely on the segment
   `error.tsx`/`not-found.tsx` conventions.
6. **Page title/metadata** comes from i18n messages, not hardcoded strings.

## 2. Styling rules (priority order)

1. **`sx` prop on house components** — the default for ~everything.
   - Spacing in theme units: `padding: 2` (=16px), `gap: 1`. No raw
     `margin: '17px'` style magic numbers.
   - Colors as palette paths: `bgcolor: 'grey.100'`, `color: 'primary.main'`.
   - Responsive values as breakpoint objects:
     `sx={{ flexDirection: { xs: 'column', md: 'row' } }}`.
2. **`styled()`** (import from `@/common/ui/mui`) — only for reusable chrome
   with pseudo-classes/animations (toolbar-like pieces, containers reused
   many times). Always use the theme callback:
   ```tsx
   const Panel = styled(Box)(({ theme }) => ({
     backgroundColor: theme.palette.grey[100],
     [theme.breakpoints.down('sm')]: { padding: theme.spacing(1) },
   }))
   ```
3. **Plain `.css` files** — legacy/special cases only (global scrollbar,
   keyframes). Use the `--color-*`/`--spacing-*` CSS vars there, never hex.
4. **Inline `style={}`** — avoid; only for truly dynamic values that `sx`
   can't express cheaply.

Layout is flexbox-first: `Box` + `display:'flex'` + `gap`, `Grid` from
`@/common/ui/mui/Grid` for card grids. Shadows: prefer the subtle house
style (`'0px 2px 3px 1px rgba(0,0,0,0.1)'`-like or `Clickable`'s
drop-shadow) over strong MUI elevations.

## 3. Responsiveness

Mobile matters: test every screen mentally at 360px and at 1440px.

| Situation | Tool |
|---|---|
| CSS differs per breakpoint | breakpoint object in `sx` |
| Component renders differently / different logic | `useDownSize('md')` from `@/common/hooks/useDownSize` |
| A JS value (counts, columns) per breakpoint | `useResponsiveValue({ xs: 1, md: 3 })` |
| Media query inside `styled()` | `theme.breakpoints.down('sm')` |

Common app breakpoints in practice: `md` (900px) is the phone/desktop
switch used by the Toolbar; song lists use `{xs:1, md:2, lg:4, xl:5}`
columns.

## 4. Texts & i18n (no hardcoded strings)

Every user-facing string goes through **next-intl**:

```tsx
const t = useTranslations('songPage')          // scoped namespace
<Typography>{t('topPanel.title')}</Typography>
t('updateSuccess.withTitle', { title })         // interpolation
```

- Message catalogs: `content/chvalotce.json` (default brand — **always add
  keys here**), plus `content/chwalmy.json` and `content/hallelujahhub.json`
  (multi-brand white-label; add the key to all three, translating or
  reusing the Czech/Polish/English value as appropriate).
- Key style: nested namespaces, camelCase leaves
  (`teams.joinPopup.joinButton`). Put keys in the namespace of the feature,
  reuse `common.*` for generic words (yes/no/save/cancel).
- Never leave Czech (or any) literals in TSX — including fallbacks, empty
  states, error messages and `aria-label`s. Admin-only screens are the single
  tolerated exception in legacy code; don't extend it.

## 5. Navigation

- Always typed: `to="variant" toParams={{ hex, alias }}` on
  `Button`/`IconButton`, `<CustomLink to params>`, or
  `useSmartNavigate().navigate('variant', { hex, alias })`.
- Never concatenate URL strings for internal routes; never raw `next/link`
  or `router.push('/pisen/…')`.
- External links: `href` + (`external` on CustomLink).

## 6. Interaction patterns

- **Modals**: `Popup` only (with `onSubmit` for forms). Confirmations are
  Popups with `actions` buttons, not `window.confirm`.
- **Feedback**: use `notistack` snackbars (`enqueueSnackbar`) for
  success/error toasts, as existing flows do; API-level network errors
  already raise global events.
- **Loading**: `loading` prop on `Button` for in-flight actions; `Skeleton`s
  for content areas; full-screen loading is handled by the app, don't add
  your own.
- **Hover**: wrap custom clickable surfaces in `Clickable`; don't write
  bespoke hover transforms.
- **API state**: follow the `useApiState`/`ApiState` machine
  (`{loading, success, error, data}`) used across the app; don't introduce
  new fetching libraries into UI work.

## 7. Accessibility minimum

- `IconButton`/`Button` without visible descriptive text → set `alt` or
  `tooltip` (they become `aria-label`).
- `Image` requires meaningful `alt`.
- Don't convey state by color alone; pair with icon/text.
- Don't use `grey.500`/`grey.600` for essential text on white, and never
  `secondary` yellow as text color (contrast).
- Keep keyboard flows working: `Popup` `onSubmit` gives Enter-to-submit;
  focusable elements must be real buttons/links (house primitives do this
  for you — another reason not to hand-roll).

## 8. Verification (definition of done for UI work)

Fast feedback loop — do all of these before considering UI work done:

```bash
npm run check-types     # tsc --noEmit
npm run lint            # next lint
npm run test:jest       # unit tests
```

**Never run E2E tests** (`test:e2e*`) during development — they're slow and
run in CI.

**Visual check** — the app has a live component gallery at `/storybook`:

```bash
# The dev script binds to host test-chvalotce.cz; map it first (once):
echo "127.0.0.1 test-chvalotce.cz" >> /etc/hosts
npm run dev   # → http://test-chvalotce.cz:5500
```

Then look at your work (agents: use Playwright with the preinstalled
Chromium to screenshot):
- new/changed primitive → `/storybook` (add/update its story);
- new/changed page → the page itself, at **mobile (~390px)** and desktop
  (~1440px) widths.

Checklist before finishing:
- [ ] No `@mui/material` root imports; house primitives used
- [ ] No new hex colors / raw px spacing / magic z-indexes in TSX
- [ ] No deprecated alias props (`small`, `outlined`, `contained` on Button/IconButton)
- [ ] All strings via `useTranslations`, keys added to all `content/*.json`
- [ ] Typed navigation (`to`/`toParams`), route registered in `routesPaths`
- [ ] Modals via `Popup`; icon buttons have `alt`/`tooltip`; images have `alt`
- [ ] Looks consistent with neighboring screens at mobile + desktop widths
- [ ] Story added/updated if a primitive changed
