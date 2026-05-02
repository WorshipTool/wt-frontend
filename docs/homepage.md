# Homepage Architecture

## Overview

The homepage (`/`) provides a landing experience with song search, recommendations, and recently added songs. It was redesigned to use a modular, section-based layout.

## Component Structure

```
page.tsx (SmartPage wrapper)
└── HomeDesktop.tsx (orchestrator)
    ├── HeroSection
    │   ├── Animated gradient background (radial gradients + floating orbs)
    │   ├── Title & subtitle (from i18n 'home' namespace)
    │   └── HomeSearchBar (glassmorphism search input)
    ├── Content (AnimatePresence - switches between search/browse)
    │   ├── [Search mode] HomeSearchResults
    │   │   └── SearchedSongsList (existing component)
    │   └── [Browse mode]
    │       ├── SongIdeasSection (horizontal scroll of recommended songs)
    │       └── RecentlyAddedSection (grid of latest songs)
    └── FloatingAddButton / ParseAdminOption
```

## Data Flow

- **Search state**: Managed via `useUrlState('hledat')` with debounced input
- **Smart search toggle**: Via `useUrlState('smartSearch')`
- **Recommended songs**: `useRecommendedSongs()` hook → `songGettingApi.getRecommendedSongs()`
- **Recently added songs**: `useLastAddedSongs()` hook → `songGettingApi.getLastAdded()`

## Design Decisions

- **Modular sections**: Each section is an independent component for maintainability
- **AnimatePresence**: Smooth transitions between search results and browse content
- **Horizontal scroll**: Song ideas use horizontal scrolling with snap points for discovery UX
- **Staggered animations**: Cards appear with staggered delays using Framer Motion
- **Glassmorphism search**: Semi-transparent search bar with backdrop blur and subtle shadow

## Files

| File | Purpose |
|------|---------|
| `src/app/(layout)/page.tsx` | Route entry point |
| `src/app/components/HomeDesktop.tsx` | Main orchestrator |
| `src/app/components/home/HeroSection.tsx` | Hero with search |
| `src/app/components/home/HomeSearchBar.tsx` | Search input component |
| `src/app/components/home/SongIdeasSection.tsx` | Recommended songs carousel |
| `src/app/components/home/RecentlyAddedSection.tsx` | Recently added grid |
| `src/app/components/home/HomeSearchResults.tsx` | Search results wrapper |
| `src/app/components/home/SongCardSkeleton.tsx` | Loading skeleton |
| `src/app/components/home/__tests__/` | Unit tests |
