# Dark Mode

## Overview

The application supports light and dark mode toggling, persisted in `localStorage` and respecting the user's OS preference on first visit.

## Architecture

### ThemeModeContext

**Location:** `src/common/providers/ThemeMode/ThemeModeContext.tsx`

A React context provider that manages the active theme mode.

- **`ThemeModeProvider`** – Wraps the app and provides `mode`, `toggleMode`, and `setMode`.
- **`useThemeMode()`** – Hook for consuming the context in any client component.
- **Storage key:** `wt-theme-mode` in `localStorage`.
- **Fallback:** Reads `prefers-color-scheme` on first visit if no stored preference exists.

### MUI Theme Factory

**Location:** `src/app/theme.tsx`

Exports `createMuiTheme(mode: 'light' | 'dark')` that builds the MUI theme for the given mode.

| Token | Light | Dark |
|---|---|---|
| `primary.main` | `#0085FF` | `#4DABFF` |
| `primary.dark` | `#532EE7` | `#7B5CE0` |
| `background.default` | `#fff` (MUI default) | `#121212` |
| `background.paper` | `#fff` (MUI default) | `#1E1E1E` |

### ThemeProvider

**Location:** `src/app/providers/ThemeProvider.tsx`

A client component that:
1. Wraps children with `ThemeModeProvider`
2. Reads `mode` from context via `MuiThemeConsumer`
3. Creates the MUI theme on each mode change and passes it to MUI's `ThemeProvider`

### DarkModeToggle

**Location:** `src/common/components/Toolbar/components/RightAccountPanel/DarkModeToggle.tsx`

An icon button rendered in the navbar's `RightAccountPanel`. Uses `DarkMode`/`LightMode` icons from `@mui/icons-material`. Calls `toggleMode()` on click.

## Hydration

`suppressHydrationWarning` is added to both `<html>` and `<body>` in `src/app/layout.tsx` to prevent hydration mismatches caused by client-side theme detection.

## Testing

| Test file | Coverage |
|---|---|
| `src/common/providers/ThemeMode/__tests__/ThemeModeContext.test.tsx` | Context defaults, localStorage read/write, toggle, setMode, data-theme attribute |
| `src/common/components/Toolbar/components/RightAccountPanel/__tests__/DarkModeToggle.test.tsx` | Button render, aria-labels, toggle behavior, localStorage persistence |
