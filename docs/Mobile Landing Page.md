# Mobile Landing Page

## Architecture

The landing page uses separate components for mobile and desktop views to maintain clean, readable code and avoid deeply nested conditional logic.

### Component Structure

```
HomeDesktop.tsx (entry point)
├── isMobile? → HomeMobile.tsx (phone layout)
└── !isMobile? → Desktop layout (existing)
```

### Mobile Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `HomeMobile` | `src/app/components/HomeMobile.tsx` | Main mobile landing page layout |
| `MobileLastAddedSection` | `src/app/components/components/MobileLastAddedSection.tsx` | Horizontal scrollable last-added songs |
| `AllListPanel` (mobile variant) | `src/app/components/components/AllListPanel/AllListPanel.tsx` | Gradient CTA button for browsing all songs |

### Mobile Breakpoint

The mobile/desktop split happens at **700px** viewport width, using MUI's `useMediaQuery(theme.breakpoints.down(700))`.

## Mobile Layout Flow (top to bottom)

1. **Hero section** — Compact title with gradient text, normal document flow (not `position: fixed`)
2. **Sticky search bar** — Becomes sticky at toolbar height (56px) when scrolled
3. **Last Added Songs** — Horizontal scrollable card row with snap scrolling
4. **All Songs CTA** — Full-width gradient button linking to the song list
5. **Recommended Songs** — Single-column song card grid
6. **Admin options** — ParseAdminOption for admin users

## Key Design Decisions

- **Normal document flow** instead of `position: fixed` for the hero on mobile — prevents layout issues and janky scroll behavior
- **Sticky search** — Search bar sticks below toolbar on scroll with glassmorphism effect (blur + semi-transparent background)
- **Horizontal scroll for last added** — Better use of mobile screen real estate vs vertical stacking
- **Gradient All Songs button** — More prominent than the desktop text-only variant
- **Hero gradient text** — Title uses `background-clip: text` for a subtle primary-to-dark gradient

## Tests

- `HomeMobile.test.tsx` — Tests rendering of hero, search, sections, and conditional search results
- `MobileLastAddedSection.test.tsx` — Tests feature flag gating, loading skeletons, song cards, and date chips
- `AllListPanel.test.tsx` — Tests both desktop and mobile variants
