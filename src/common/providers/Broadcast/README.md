# Broadcast Message System

Lightweight one-way broadcast system for sending operational messages to **all logged-in users**.

Intended for operational notices such as:
- Active service outages
- Scheduled maintenance windows
- Post-incident apologies
- Urgent operational announcements

## How it differs from the News system

| Aspect | Broadcast | News |
|---|---|---|
| Audience | All logged-in users | Users with specific feature flags |
| Purpose | Operational notices | Feature announcements & tutorials |
| Tutorial/spotlight | No | Yes |
| Feature flag filtering | No | Yes |
| Dismissal storage | localStorage (per user) | Backend API |
| Display | Fixed top banner | Popup modal |

---

## Architecture

```
broadcast.types.ts        — Types: BroadcastMessage, BroadcastSeverity, …
broadcast.config.tsx      — Operator-editable message definitions
BroadcastContext.tsx      — React context + useBroadcast() hook
BroadcastBanner.tsx       — Fixed-top dismissible UI banner
index.ts                  — Barrel exports
```

---

## Operator Guide: Adding a message

1. Open `broadcast.config.tsx`
2. Add an entry to the array inside `getBroadcastMessages()`:

```ts
{
  id: 'outage-2026-03',          // Stable unique ID — never change after deploy
  title: 'Service Disruption',
  message: 'Search is temporarily unavailable. Our team is investigating.',
  severity: 'critical',          // 'info' | 'warning' | 'critical'
  createdAt: '2026-03-06T10:00:00Z',
  active: true,
}
```

3. Deploy — the banner appears immediately for all logged-in users.

### Optional expiry

For messages that auto-hide after a known end time:

```ts
{
  id: 'maintenance-2026-04',
  title: 'Scheduled Maintenance',
  message: 'The service will be down Sunday 6 Apr 02:00–04:00 UTC.',
  severity: 'warning',
  createdAt: '2026-04-01T00:00:00Z',
  expiresAt: '2026-04-06T04:00:00Z',   // Banner auto-hides after this
  active: true,
}
```

### Disabling without deleting

Set `active: false` or omit the `active` field and it defaults to visible.
To hide a message without removing its history, set `active: false`.

### ID conventions

```
{type}-{YYYY-MM}[-{sequence}]

Examples:
  outage-2026-03
  maintenance-2026-04-01
  apology-2026-03-02
```

IDs are stored in `localStorage` as dismiss keys — **never change them after deployment**.

---

## Severity guide

| Severity | Colour | When to use |
|---|---|---|
| `info` | Blue | Informational; no user action needed |
| `warning` | Amber | Caution: upcoming maintenance, partial degradation |
| `critical` | Red | Active outage or data-integrity issue |

---

## Developer API

### Hook

```tsx
import { useBroadcast } from '@/common/providers/Broadcast'

const {
  activeBroadcasts,   // BroadcastMessage[] — undismissed messages for current user
  currentBroadcast,   // BroadcastMessage | null — message shown in banner
  currentIndex,       // number — 0-based index within activeBroadcasts
  totalCount,         // number — length of activeBroadcasts
  dismiss,            // (id: string) => void
  dismissAll,         // () => void
  navigateNext,       // () => void — cycle forward
  navigatePrev,       // () => void — cycle backward
} = useBroadcast()
```

### Components

```tsx
import { BroadcastBanner } from '@/common/providers/Broadcast'

// Already rendered inside AppClientProviders — no need to add manually
<BroadcastBanner />
```

### Provider

```tsx
import { BroadcastProvider } from '@/common/providers/Broadcast'

// Already included in AppClientProviders — no need to add manually
<BroadcastProvider>
  {children}
</BroadcastProvider>
```

---

## Dismissal storage

Each dismissed message ID is stored in `localStorage` under the key:

```
broadcast-dismissed-{user.guid}
```

This means:
- Dismissals are per-user and per-browser
- Dismissals persist across sessions
- Dismissals are not synced across devices

For cross-device persistence, the context can be extended to use a backend API in the future.
