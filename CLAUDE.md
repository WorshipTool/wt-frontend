# wt-frontend — AI Instructions

## UI Component Priority

**Always prefer `@/common/ui` over direct MUI imports.**

The project has a custom UI layer at `src/common/ui/` that wraps and extends MUI components. Use these custom components instead of importing directly from `@mui/material`.

```ts
// ✅ Correct
import { Box, Typography, Button } from '@/common/ui'

// ❌ Avoid
import { Box, Typography, Button } from '@mui/material'
```

### Available custom components in `@/common/ui`:
- `Box`, `Typography`, `Button`, `ButtonGroup`
- `Card`, `StandaloneCard`
- `Checkbox`, `Chip`, `CustomChip`
- `CircularProgress`, `LinearProgress`
- `Clickable`, `Divider`, `Gap`
- `IconButton`, `Image`, `InfoButton`
- `Link`, `SearchBar`, `TextField`, `TextInput`
- `CustomTooltip` (via `@/common/ui/CustomTooltip/Tooltip`)
- `SongCard` (SongVariantCard, SongGroupCard)

### MUI items not yet wrapped (use `@/common/ui/mui` or MUI directly):
- `Grid` → `@/common/ui/mui/Grid`
- `Skeleton` → `@/common/ui/mui`
- `SxProps`, `Theme` types → `@/common/ui/mui`
- Icons → still from `@mui/icons-material`

### Why this rule exists:
The custom layer allows the team to maintain consistent styling, enforce design tokens, and change the underlying library without touching all consumers.
