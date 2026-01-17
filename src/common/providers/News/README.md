# News Provider System

This directory implements a complete system for displaying feature news and onboarding highlights to users in a React/Next.js application. The system is modular, context-driven, and supports both popup news and interactive component highlights.

## Features
- **Popup news**: Show new features and announcements to users in a modal dialog.
- **Component highlights**: Visually highlight UI elements to guide users to new or important features.
- **Step-by-step onboarding**: Multi-step highlight flows for complex features.
- **User state tracking**: Remembers which news the user has seen or tried.
- **Config-driven**: All news items are defined in a single config file.

## Main Components & Files
- `NewsContext.tsx`: Provides the main context, state management, and hooks for the news system. Handles loading, updating, and persisting user news state.
- `news.config.tsx`: Central configuration for all news items. Add new features/news here. Each item can define highlight steps, target components, and more.
- `news.types.ts`: TypeScript types for news items, user state, highlight steps, and context.
- `NewsHighlight.tsx`: Components for wrapping and highlighting UI elements, showing tooltips, and managing highlight flows.
- `NewsPopup.tsx`: The popup/modal component that displays unseen news to the user.
- `SpotlightOverlay.tsx`: Renders a dark overlay with a "hole" around the highlighted element, used for onboarding/tutorial effects.
- `news.storage.ts`: Handles loading and saving user news state (e.g., to localStorage or backend).
- `index.ts`: Barrel file exporting all public API from this module.

## Usage

### 1. Add the Provider
Wrap your app with `NewsProvider` (already included in `AppClientProviders`):

```tsx
import { NewsProvider } from '@/common/providers/News'

<NewsProvider>
  {/* your app */}
</NewsProvider>
```

### 2. Define News Items
Edit `news.config.tsx` to add, remove, or update news items. Each item can specify:
- `id`: Unique identifier
- `title`, `description`, `icon`
- `createdAt`: ISO date string
- `targetComponent`: (optional) component to highlight
- `highlightSteps`: (optional) onboarding steps for the highlight
- `active`: whether the news is currently shown

### 3. Highlight Components
Wrap any component you want to highlight with `NewsHighlightWrapper`:

```tsx
import { NewsHighlightWrapper } from '@/common/providers/News'

<NewsHighlightWrapper targetComponent="smart-search-toggle">
  <IconButton>...</IconButton>
</NewsHighlightWrapper>
```

### 4. Access News State
Use the `useNews` hook to access news state and actions:

```tsx
import { useNews } from '@/common/providers/News'

const { unseenNews, openPopup } = useNews()
```

### 5. Advanced: Multi-step Highlights
Define `highlightSteps` in a news item for step-by-step onboarding. Use `useNewsHighlight` to control the flow in your component.

## API Overview

### Context & Hooks
- `NewsProvider`: Context provider for the news system
- `useNews()`: Access news state and actions
- `useNewsHighlight(componentId)`: Get highlight state and handlers for a specific component

### Components
- `NewsHighlightWrapper`: Wraps and highlights a component
- `NewsPopup`: Popup/modal for news
- `SpotlightOverlay`: Overlay with a hole for onboarding

### Utilities
- `clearNewsState()`: Clear all news state (for testing/debugging)

## Extending
- Add new news items in `news.config.tsx`
- Add new target components in `news.types.ts` under `NewsTargetComponent`
- Customize highlight appearance in `NewsHighlight.tsx` and `SpotlightOverlay.tsx`

---

For more details, see inline comments in each file.
