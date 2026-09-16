# Component Catalog — what to build UI with

> Audience: AI agents and developers. Rule #1: **never import from
> `@mui/material` directly** (ESLint enforces this). This repo has a house UI
> kit; use it. When it doesn't cover a need, use the sanctioned re-exports in
> `@/common/ui/mui`.

## Import rules

```ts
// ✅ Primitives (preferred — barrel or per-component)
import { Box, Button, Typography, Gap, IconButton } from '@/common/ui'
import { Button } from '@/ui/Button'

// ✅ Raw MUI escape hatch (only when no primitive exists)
import { Menu, MenuItem, Tabs, Switch, styled, alpha } from '@/common/ui/mui'
import { Grid } from '@/common/ui/mui/Grid'
import { Skeleton } from '@/common/ui/mui/Skeleton'
import { grey } from '@/common/ui/mui/colors'

// ✅ Icons — directly from the icons package
import { AutoAwesome } from '@mui/icons-material'
import SearchIcon from '@mui/icons-material/Search'

// ❌ Forbidden (ESLint error)
import { Button } from '@mui/material'
```

If you need a MUI component that `@/common/ui/mui` doesn't re-export yet, add
it to `src/common/ui/mui/index.ts` rather than importing `@mui/material`
elsewhere.

## Decision table

| You need | Use | Never |
|---|---|---|
| Layout container | `Box` (re-exported MUI) + `sx` | raw `<div>` with inline styles |
| Grid layout | `Grid` from `@/common/ui/mui/Grid` | CSS floats, hand-rolled grids |
| Any text | `Typography` (custom) with `strong`/`thin`/`small` | MUI Typography, `<b>`, ad-hoc `fontWeight` |
| Action button | `Button` (custom) | MUI Button/LoadingButton |
| Hero/primary CTA | `Button color="primarygradient"` | hand-written gradient CSS |
| Icon-only button | `IconButton` (custom, needs `alt` or `tooltip`) | MUI IconButton |
| Internal navigation | `Button`/`IconButton` `to`+`toParams`, or `CustomLink` | `<a href>`, raw `next/link`, string URLs |
| Tooltip | `Tooltip` from `@/common/ui` (accepts `label`) | MUI Tooltip directly |
| Modal / dialog | `Popup` from `@/common/components/Popup/Popup` | MUI Dialog, browser `alert/confirm` |
| Text input | `TextInput` (labelled) or `TextField` (bare) | MUI TextField |
| Search field | `SongSearchBarBase` (debounced) or UI `SearchBar` (presentational) | new one-off search inputs |
| Checkbox | `Checkbox` (custom, has `label`) | MUI Checkbox + manual FormControlLabel |
| Vertical/horizontal spacer | flex `gap` in `sx`; `Gap` only to match surrounding code | `<br>`, margin-only spacing hacks |
| Card with header/actions | `Card` (custom) | raw MUI Card composition |
| Standalone centered card (auth-like screens) | `StandaloneCard` | custom one-offs |
| Bordered pill/badge | `CustomChip` | restyled MUI Chip |
| Hoverable interactive surface | `Clickable` (adds hover scale + shadow) | custom `:hover` CSS |
| Song card / song list | `SongVariantCard`, `SongListCard`, `SmartSongListCard` | new song card implementations |
| Image | `Image` from `@/common/ui` (requires `alt`) | `<img>`, raw `next/image` |
| Loading placeholder | `Skeleton` from `@/common/ui/mui/Skeleton`, `CircularProgress`, `LinearProgress` | custom spinners |
| Overlay stacking | `Z_INDEX` from `@/common/constants/zIndex` | magic z-index numbers > 100 |

---

## Primitives (`src/common/ui`, alias `@/ui`)

Everything below is exported from the `@/common/ui` barrel unless noted.
Details worth knowing before using each one:

### Box, Chip, Divider, CircularProgress, LinearProgress
Pure re-exports of MUI — full MUI API available.

### Button
Wraps `@mui/lab` LoadingButton. Defaults: `variant='contained'`,
`color='primary'`, `size='medium'`. Key props:

- `to` + `toParams` — **typed internal routing** (route keys from
  `src/routes/routes.ts`, e.g. `to="variant" toParams={{ hex, alias }}`);
  `href` for external URLs.
- `color` — theme name, `'primarygradient'` (brand gradient), or any CSS
  color string.
- `tooltip` (+ `tooltipPlacement`), `alt` — one of these should be present
  when the label alone is not descriptive; becomes `aria-label`.
- `loading`, `startIcon`/`endIcon`, `title`/`subtitle` (stacked two-line
  label), `disableUppercase`.
- `borderRadius: 2` is baked in — don't override.
- ⚠️ Deprecated alias props `small`, `outlined`, `contained` exist for legacy
  code. **In new code always use `size=` and `variant=`.**

### IconButton
Custom wrapper (Clickable + Tooltip + Link + MUI IconButton). Default
`variant='text'`; also `outlined`/`contained`, `squared`, `size`. `color`
accepts palette paths (`"grey.400"`, `"primary.main"`) resolved via
`getColorHex`. **Always pass `alt` or `tooltip`** (→ `aria-label`), children
is the icon. Supports `to`/`toParams`. ⚠️ `small` is a deprecated alias — use
`size="small"`.

### Typography
Custom wrapper. `variant`: `h1–h6 | 'normal' (default) | 'subtitle1'`.
Sugar props: `strong` (true→700 or a number weight), `thin` (300), `small`,
`size` (fontSize), `uppercase`, `italic`, `noWrap`, `align`, `color`
(ColorType). Use these instead of `sx` font tweaks.

### CustomLink (component `Link`, file `src/common/ui/Link`)
Typed internal links: `<CustomLink to="team" params={{ alias }}>`; external:
`<CustomLink href="https://…" external>`. Handles subdomain URL rewriting,
modifier-key new-tab, and the outside-link-blocker popup. Inherits color and
removes underline by default.

### Tooltip (file `CustomTooltip`)
`<Tooltip label="…">{child}</Tooltip>` — accepts `label` or `title`,
`disabled` to bypass, safe with disabled children (wraps in a span-like Box).

### TextField / TextInput
`TextField` is a **bare `InputBase`** (no border/label from MUI): props
`value/startValue/onChange(string)/placeholder/type/multiline/required/autoFocus`.
`onChange` emits the **string**, not the event. `TextInput` = `TextField`
plus a bold label above (`title`/`label`). For forms inside `Popup`, use
`TextInput` and submit via Popup's `onSubmit`.

### Checkbox
`checked`, `onChange(event, value)`, `label` (auto FormControlLabel),
`color`, `disabled`.

### Card / StandaloneCard / CustomChip
- `Card`: MUI Card + optional `title`/`subtitle`/`icon` header, `actions`
  footer (with divider). Accepts all MUI Card props.
- `StandaloneCard`: fixed 480px centered card (login/registration-style
  screens); `variant='default' | 'secondary'`.
- `CustomChip`: bordered pill, `icon`/`label`/`color`/`borderColor`
  (defaults to primary). Import directly: `import { CustomChip } from '@/common/ui/CustomChip/CustomChip'`.

### Clickable
Wrap any custom interactive surface to get the house hover effect (scale
102% + drop shadow, active 98%) and optional `tooltip`. Renders plain
children when `disabled`.

### Gap
Spacer div. ⚠️ Unit is `value × 10px` (default 10px), **not** theme spacing.
`horizontal` for row layouts. Prefer flex `gap` in new code.

### Image
Wraps `next/image`; `alt` is **required**, `defaultSrc` provides blur
placeholder (`/assets/default_image.webp`), supports `fill` or
width/height (default 100×100).

### SearchBar (primitive) vs SongSearchBarBase (container)
- `@/common/ui` `SearchBar` — presentational, controlled `value/onChange`,
  optional smart-search toggle, i18n placeholder.
- `@/common/components/SearchBar/SongSearchBarBase` — adds debounce
  (`useChangeDelayer`) and the `enable_smart_search` feature flag. Use this
  one on pages.

### SongVariantCard / SongGroupCard
Domain cards for `BasicVariantPack`. Use `properties` flags
(`SHOW_PRIVATE_LABEL`, …), `toLinkProps` for navigation, selection props for
pickers. Don't build new song-card UIs.

### Masonry
⚠️ Not exported from the barrel (`import { Masonry } from '@/common/ui/Masonry'`).
Responsive `columns` object. Usually you want `SongListCard`
`variant='masonrygrid'` instead.

### Export-alias gotchas
- `Link` is exported as **`CustomLink`**; `CustomTooltip` is exported as
  **`Tooltip`**; `SongCard` dir exports only **`SongVariantCard`**.
- `useTheme` is re-exported from the barrel (`import { useTheme } from '@/common/ui'`).

---

## Composites (`src/common/components`)

### SmartPage — every page's wrapper
Pages don't export components directly; they export
`SmartPage(Component, options)`:

```tsx
export default SmartPage(PlaylistScreen, ['fullWidth', 'hideFooter'])
// or object form:
export default SmartPage(Home, { hideTitle: true, transparentToolbar: null })
```

Options (all nullable booleans; `null` = leave global state untouched):
`transparentToolbar, darkToolbar, whiteToolbarVersion, hideMiddleNavigation,
hideTitle, hideFooter, hideToolbar, fullWidth, hidePadding, middleWidth
(900px cap), topPadding, containLayout`. Default content width is
`min(100% − padding, 1320px)`. Team pages use the parallel `SmartTeamPage`.

Toolbar appearance is controlled **only** through these options — never call
`useToolbar()` setters from a page.

### Popup — the only modal system
`src/common/components/Popup/Popup.tsx`, rendered through a portal
(`PopupProvider` is mounted in root layout, `Z_INDEX.POPUP`).

```tsx
<Popup
  open={open}
  onClose={() => setOpen(false)}
  title={t('joinPopup.title')}
  subtitle={t('joinPopup.subtitle')}
  onSubmit={handleSubmit}                    // makes content a <form>
  actions={<Button type="submit" loading={apiState.loading}>{t('join')}</Button>}
>
  <TextInput value={code} onChange={setCode} autoFocus />
</Popup>
```

Caller owns `open` state. Esc-close, scroll lock, blur backdrop and fade
animation are built in. **Never** use MUI `Dialog` or browser
`alert/confirm/prompt`. (Two legacy MUI Dialog call sites exist —
`PlaylistItemRow`, `MySongItem` — don't copy them.)

### Others
- **Toolbar** (`common/components/Toolbar`) — the app bar; configured via
  SmartPage options, don't render or restyle it yourself.
- **ContainerGrid** (`common/components/ContainerGrid.tsx`) — 1320px 12-col
  grid used on content pages (song page).
- **SongListCard / SmartSongListCard** (`common/components/songLists`) —
  lists of song cards; `variant='list' | 'masonrygrid' | 'row'`, responsive
  columns `{xs:1, md:2, lg:4, xl:5}`.

---

## Adding a new UI primitive

1. Create `src/common/ui/<Name>/<Name>.tsx` (+ `index.ts` re-export). Follow
   the house style: props type above the component, `sx` passthrough,
   `ColorType` for colors, wrap MUI rather than fork it.
2. Export it from `src/common/ui/index.ts`.
3. **Add a story** `src/common/ui/<Name>/<Name>.story.tsx`:
   ```tsx
   import { Name } from '@/ui/Name'
   import { createStory } from '../../../app/(layout)/storybook/createStory'

   const NameStory = () => (
     <div>{/* render 2–4 representative states */}</div>
   )
   createStory(Name, NameStory)
   ```
4. Register it in `src/common/ui/index.story.tsx`
   (`export * from './Name/Name.story'`).
5. Check it visually on the `/storybook` route (see PATTERNS.md →
   Verification).

Before creating a new primitive, check this catalog and `/storybook` — most
needs are already covered. New primitives should be rare.
