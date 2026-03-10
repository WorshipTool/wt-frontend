# Z-Index Layer System

High z-index values (> 100) for overlays, popups, modals, and other stacking-critical UI elements are centralized in a single file:

```
src/common/constants/zIndex.ts
```

Low z-index values (-100 … 100) used for simple layout purposes (e.g. "slightly above sibling", "behind content") remain hardcoded in their respective components — centralizing them adds no value.

## Why

- Single source of truth for overlay / popup / modal stacking
- Easy to see what's above what in the critical z-index range
- Change a value in one place to adjust globally
- Prevents magic numbers for high z-index values scattered across components

## Layer Map

| Layer            | Value   | Purpose                                          |
|------------------|---------|--------------------------------------------------|
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
const Overlay = styled(Box)({
  zIndex: Z_INDEX.OVERLAY,
})

// In inline styles
<div style={{ zIndex: Z_INDEX.LOADING }}>
```

## Low z-index values (not centralized)

Values like `zIndex: 1`, `zIndex: -1`, `zIndex: 10`, etc. are kept as hardcoded numbers directly in the components. These are simple layout values that don't participate in the critical stacking order and don't benefit from centralization.

## Design Decisions

- **CORNER_STACK is below POPUP (200 vs 1360)**: Corner buttons (proposals, ideas) intentionally do not obscure popups. Only the admin FloatingEditButton has a high z-index (FLOATING_EDIT = 10000).
- **Dynamic z-index**: The `SongGroupCard` uses a computed `zIndex: -_i` for card stacking. This is a local relative value and is not centralized.
- **LOADING and FLOATING_EDIT share the same value (10000)**: They do not conflict since loading screens cover the entire page.

## Tests

Tests are located at `src/common/constants/zIndex.test.ts` and verify:
- All layer keys exist
- All values are > 100
- Correct ordering of layers (each layer >= previous)
- CORNER_STACK < POPUP (corner buttons below popups)
- FLOATING_EDIT is the highest or equal-highest layer
