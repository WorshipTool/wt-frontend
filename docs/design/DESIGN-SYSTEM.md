# Design System — Tokens & Visual Language

> Audience: AI agents and developers doing **any** UI work in this repo.
> Read this together with [COMPONENTS.md](./COMPONENTS.md) (what to build with)
> and [PATTERNS.md](./PATTERNS.md) (how to build it).

WorshipTool (chvalotce.cz) is a light, friendly, blue-accented app for church
worship teams. The visual language is: **white surfaces, rounded corners,
Roboto, blue primary with a violet gradient for hero CTAs, generous spacing,
subtle hover micro-interactions** (scale + drop shadow via `Clickable`).

---

## 1. Where tokens live (source of truth)

Design tokens currently exist in **three places**. They MUST stay in sync —
if you change a token, change it everywhere:

| Location | Contains | Used by |
|---|---|---|
| `src/common/constants/theme.ts` + `src/app/theme.tsx` | **Canonical source.** MUI palette + typography scale | Everything rendered through MUI (`sx`, `color` props, `useTheme`) |
| `src/app/globals.css` (`:root`) | Mirror of palette as CSS vars + grey scale + spacing vars | Plain CSS files (e.g. `InfoButton.styles.css`) |
| `src/tech/theme/theme.tech.ts` | `getColorHex()` resolver, `breakpoints` helper for non-MUI contexts (styled, plain CSS-in-JS) | Components that need a raw hex or a media query string outside `sx` |

**Rule for new code:** reference tokens through the MUI theme (`sx` with
palette paths like `'primary.main'`, `theme.spacing(n)`), never hardcode hex
values or raw pixel spacing. CSS vars are a fallback for `.css` files only.

## 2. Color palette

| Token | Value | Usage |
|---|---|---|
| `primary.main` | `#0085FF` | Main brand blue — buttons, links, active states |
| `primary.dark` | `#532EE7` | ⚠️ **Violet, not a darker blue.** Exists as the end-stop of the brand gradient. Avoid relying on MUI auto-darkening (hover of `contained` buttons resolves to this violet). |
| `secondary.main` | `#EBBC1E` | Yellow accent. Never use as text/foreground on white (contrast fails) — backgrounds, chips, highlights only. |
| `success.main` | `#43a047` | Success states |
| `error`, `warning`, `info` | MUI defaults | Not customized — use MUI defaults via palette names |
| `grey.100`–`grey.900` | MUI default grey scale (`#f5f5f5` … `#212121`) | Surfaces, borders, secondary text. Mirrored as `--color-grey-100..900` in globals.css |

**Brand gradient** (hero CTAs, decorative accents):
`linear-gradient(115deg, primary.main, primary.dark)` — available as
`color="primarygradient"` on the `Button` primitive. Don't hand-roll gradient
CSS; use that prop.

**Rules:**
- In `sx`/props use palette paths: `color: 'primary.main'`, `bgcolor: 'grey.100'`.
- No new hardcoded hex values or `rgb()/rgba()` in TSX. (Legacy code has some — don't copy that pattern; reduce it when touching those files.)
- Outside MUI context, resolve hexes with `getColorHex('primary.main')` from `@/tech/theme/theme.tech`.
- There is **no dark mode** at theme level. Don't invent one locally; the team sidebar has a legacy local `darkMode` boolean — do not extend that pattern.

## 3. Typography

Font: **Roboto**, loaded via `next/font` (`--font-roboto` CSS var, set in the
MUI theme as `fontFamily`). The theme is wrapped in `responsiveFontSizes()`,
so headings scale down automatically on smaller screens.

Scale (defined in `src/app/theme.tsx`):

| Variant | Size | Weight | Notes |
|---|---|---|---|
| `h1` | 5rem | 400 | Hero only |
| `h2` | 3rem | 300 | Page titles |
| `h3` | 2rem | 400 | Section titles |
| `h4` | 1.5rem | 400 | |
| `h5` | 1.25rem | 400 | Card titles |
| `h6` | 1.125rem | 400 | |
| `normal` | 1rem (MUI `body1`) | 400 | Default of the custom `Typography` |

**Always use the custom `Typography` from `@/ui`** (see COMPONENTS.md) — it
adds `strong` (bold or numeric weight), `thin`, `small`, `italic`,
`uppercase`. Emphasis is done with `strong` / `strong={500}`, not with `<b>`
or ad-hoc `fontWeight` in `sx`.

## 4. Spacing

- MUI spacing unit: **1 = 8px** (`theme.spacing(1)`), used by numeric values
  in `sx` (`padding: 2` → 16px, `gap: 1` → 8px).
- Prefer `sx` numeric spacing and flex `gap` for layout rhythm.
- `--spacing-1..6` CSS vars (8/16/24/32/40/48px) exist for `.css` files only.
- ⚠️ The `Gap` primitive uses its **own unit: `value × 10px`** (default 10px),
  not theme spacing. Prefer flex/`gap` in new layouts; use `Gap` mainly to
  match surrounding code that already uses it.

## 5. Breakpoints & responsiveness

Standard MUI breakpoints (not customized):

| Key | Min width |
|---|---|
| `xs` | 0 |
| `sm` | 600 |
| `md` | 900 |
| `lg` | 1200 |
| `xl` | 1536 |

- Inside `sx`: responsive objects — `sx={{ flexDirection: { xs: 'column', md: 'row' } }}`.
- Inside `styled()` or places without theme access: `breakpoints.up/down/between('sm')`
  from `@/tech/theme/theme.tech` (returns a `@media` string).
- For picking a **value** (not CSS) per breakpoint in JS: `useResponsiveValue({ xs: 1, md: 3 })`
  from `@/common/ui/tech/useResponsiveValue`.
- Mobile-first mindset: the app is heavily used on phones; every new UI must
  work at 360px width.

## 6. Z-index

Use the centralized layer system `Z_INDEX` from `src/common/constants/zIndex.ts`
for anything that overlays (values > 100). Never invent big magic numbers.

| Layer | Value |
|---|---|
| `CORNER_STACK` | 200 |
| `OVERLAY` | 1300 |
| `POPUP` | 1360 |
| `TOOLTIP` | 1500 |
| `DIALOG` | 2000 |
| `CONTEXT_MENU` | 9999 |
| `LOADING` / `FLOATING_EDIT` | 10000 |

Low values (−100…100) for local "above the sibling" tweaks stay inline.

## 7. Shape & elevation

- Buttons: `borderRadius: 2` (theme units → 16px) — baked into the `Button`
  primitive, don't restyle it.
- Cards/pills: rounded (`0.5rem`+); `CustomChip` is the bordered-pill idiom.
- Elevation is used sparingly — prefer borders (`1px solid` + `grey.300`-ish)
  and the `Clickable` hover drop-shadow over heavy MUI shadows.

## 8. Motion

- Micro-interactions come from the `Clickable` primitive (hover scale 102% +
  drop shadow, active scale 98%). Wrap interactive custom surfaces in it
  instead of writing your own hover CSS.
- `framer-motion` exists in the bundle (Toolbar/Popup); don't add it to new
  leaf components without a strong reason — CSS transitions first.

## 9. Known token debt (do not "fix" casually)

`docs/DESIGN-REVIEW.md` documents the debt: triple token source, violet
`primary.dark`, missing `theme.components` overrides. If a task is about
consolidating tokens, that review is the roadmap. For any other task: follow
the rules above and **do not** introduce a fourth pattern.
