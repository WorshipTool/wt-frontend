# Z-Index Layer System

All z-index values in the application are centralized in a single file:

```
src/common/constants/zIndex.ts
```

## Why

- Single source of truth for all stacking layers
- Easy to see what's above what
- Change a value in one place to adjust globally
- Prevents magic numbers scattered across components

## Layer Map

| Layer            | Value   | Purpose                                          |
|------------------|---------|--------------------------------------------------|
| `DEEP_BACKGROUND`| -100    | Background decorations (snow, gradients)          |
| `BEHIND`         | -1      | Elements behind main content                      |
| `BASE`           | 0       | Default / reset level                             |
| `RAISED`         | 1       | Slightly above siblings (cards, panels)           |
| `ELEVATED`       | 2       | Above RAISED (presentation, secondary panels)     |
| `STICKY`         | 10      | Sticky/fixed UI (toolbar, navigation)             |
| `SEARCH`         | 100     | Search bars and inputs                            |
| `CORNER_STACK`   | 200     | Corner buttons (proposals, ideas) - below popups  |
| `OVERLAY`        | 1300    | Overlays (preview banner, spotlight)              |
| `POPUP`          | 1360    | Popup containers                                  |
| `TOOLTIP`        | 1500    | Floating tooltips                                 |
| `DIALOG`         | 2000    | Modal dialogs                                     |
| `CONTEXT_MENU`   | 9999    | Context menus, critical overlays                  |
| `LOADING`        | 10000   | Full-screen loading screens                       |
| `FLOATING_EDIT`  | 10000   | Admin floating edit button (always on top)         |

## Usage

```tsx
import { Z_INDEX } from '@/common/constants/zIndex'

// In sx props
<Box sx={{ zIndex: Z_INDEX.POPUP }}>

// In styled components
const TopBar = styled(Box)({
  zIndex: Z_INDEX.STICKY,
})

// In inline styles
<div style={{ zIndex: Z_INDEX.LOADING }}>
```

## Design Decisions

- **CORNER_STACK is below POPUP (200 vs 1360)**: Corner buttons (proposals, ideas) intentionally do not obscure popups. Only the admin FloatingEditButton has a high z-index (FLOATING_EDIT = 10000).
- **Dynamic z-index**: The `SongGroupCard` uses a computed `zIndex: -_i` for card stacking. This is a local relative value and is not centralized.
- **LOADING and FLOATING_EDIT share the same value (10000)**: They do not conflict since loading screens cover the entire page.

## Tests

Tests are located at `src/common/constants/zIndex.test.ts` and verify:
- All layer keys exist
- Correct ordering of layers (each layer >= previous)
- CORNER_STACK < POPUP (corner buttons below popups)
- FLOATING_EDIT is the highest or equal-highest layer
