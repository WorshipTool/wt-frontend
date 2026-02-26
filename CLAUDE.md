# CLAUDE.md – WorshipTool Frontend

Developer guide for AI agents working in this repository.

## Project Overview

**WorshipTool** (Chválotce) is a Next.js 14 church worship song management application.
It helps worship teams manage song catalogs, playlists, variants, statistics, and multi-team collaboration.

- **Framework:** Next.js 14.2.3 (App Router) + React 18 + TypeScript
- **UI:** Material UI v5 + Emotion CSS-in-JS
- **Testing:** Jest (unit) + Playwright (E2E)
- **Port (dev):** `5500` on host `test-chvalotce.cz` (add to `/etc/hosts` pointing to 127.0.0.1)
- **Language:** Czech UI, codebase in English/Czech mix

---

## Essential Commands

```bash
# Development
npm run dev          # Start dev server at http://test-chvalotce.cz:5500

# Build & Type Check
npm run build        # Production build
npm run check-types  # TypeScript type check (no emit)
npm run lint         # ESLint

# Testing
npm run test:jest               # Unit tests (Jest)
npm run test:e2e:smoke          # E2E smoke suite
npm run test:e2e:critical       # E2E critical suite
npm run test:e2e:full           # E2E full suite

# API generation
npm run generate-api  # Regenerate OpenAPI clients
```

---

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (layout)/         # Pages with main layout (pisen, playlist, seznam, ...)
│   ├── (nolayout)/       # Pages without layout
│   ├── (subdomains)/     # Subdomain-specific routes
│   ├── (submodules)/     # Team-specific features
│   ├── api/              # Next.js API routes
│   ├── components/       # App-level components & PDF renderer
│   └── providers/        # Global providers (theme, auth, socket, ...)
├── common/               # Shared components, UI library, hooks, utils
│   ├── components/       # Reusable feature components
│   ├── ui/               # Custom MUI-based UI primitives
│   ├── providers/        # Feature flags, permissions, loaders
│   └── utils/            # Utility functions
├── api/                  # API communication layer
│   ├── generated/        # Auto-generated OpenAPI clients (do not edit manually)
│   ├── dtos/             # Data Transfer Objects
│   └── map/              # API response mappers
├── hooks/                # Feature-specific React hooks
├── tech/                 # Technical utilities (auth, color, date, url, permissions, ...)
├── routes/               # Route helpers & subdomain handling
├── types/                # TypeScript type definitions
├── interfaces/           # TypeScript interfaces
└── i18n/                 # Internationalization setup
```

---

## Key Conventions

### Components
- Use **MUI components** as base; custom wrappers live in `src/common/ui/`
- Follow existing file naming: `PascalCase` for components, `camelCase` for utilities
- Co-locate component tests (Jest) next to the component file

### API
- **Never edit files in `src/api/generated/`** — they are auto-generated
- API hooks pattern: `src/hooks/<feature>/use<Feature>.ts`
- DTOs in `src/api/dtos/` define the shape of API responses

### Internationalization
- Translations in `content/` directory
- Use `next-intl` for all user-facing strings
- Language keys in Czech (`cs`) as primary

### Authentication
- Google OAuth via `@react-oauth/google`
- JWT tokens managed in `src/tech/auth/`
- Role-based permissions in `src/tech/permissions/`

### State Management
- No global state library — React hooks + Context
- Providers in `src/app/providers/` and `src/common/providers/`

### Real-time
- Socket.io client in `src/hooks/sockets/`

---

## Testing Guidelines

- **Unit tests (Jest):** Co-locate with source, name `*.test.ts(x)`
- **E2E tests (Playwright):** Live in `tests/` directory
- Test suites tagged: `smoke`, `critical`, `full`
- Always run `npm run test:jest` before committing new logic
- E2E tests require local dev server or preview env

---

## Important Notes

- **Protected paths:** `.github/` must NEVER be modified
- **Temp files:** Create in `/tmp` (system) or `temp/` folder (gitignored)
- **API clients:** Regenerate with `npm run generate-api` after schema changes
- **Subdomains:** Each church team may use a subdomain; see `src/routes/subdomains/`
- **PDF export:** Uses `@react-pdf/renderer` in `src/app/components/`
- **Feature flags:** Managed via Statsig (`src/common/providers/`)

---

## Documentation

Project docs (in Czech) are in `docs/`:
- `docs/Vyhledávání.md` – Search system
- `docs/Schvalování, zveřejňování písní.md` – Publishing workflow
- `docs/Merging/` – Song merging (auto & manual)
- `docs/Testování.md` – Testing guide
- `docs/2. Development/` – Dev management notes & test GUIDs

See also `TESTME.md` for comprehensive manual/E2E test checklist.

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | Server components, streaming, layouts |
| MUI v5 | Rich component library with theming |
| OpenAPI code gen | Type-safe API contracts |
| next-intl | Best-in-class i18n for Next.js App Router |
| Statsig | Feature flags + analytics in one |
| Socket.io | Real-time collaboration & live updates |
