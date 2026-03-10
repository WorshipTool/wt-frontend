# Broadcast Messages

Operational broadcast system for sending real-time notices to all logged-in users.

## Purpose

Allows operators to display a dismissible banner to every logged-in user without a deployment of backend code or database changes. Typical use cases:

- Active service outages
- Scheduled maintenance windows
- Post-incident apologies
- Urgent platform-wide announcements

## How it works

1. Operator edits `src/common/providers/Broadcast/broadcast.config.tsx`
2. A new `BroadcastMessage` object is added to `getBroadcastMessages()`
3. After deployment the message appears in a modal popup (auto-opens once per session) for all logged-in users
4. Each user can dismiss messages; dismissals are stored in their browser's `localStorage`
5. If `expiresAt` is set, the message auto-hides after that time without any manual removal

## Display modes

- **Popup (default)** — Modal with animated gradient background, rendered in `AppClientProviders`
- **Banner (optional)** — Fixed-position bar at the top of the viewport, available for custom layouts

## Severity levels

| Level | Colour | Use for |
|---|---|---|
| `info` | Blue | Informational, no action needed |
| `warning` | Amber | Maintenance, partial degradation |
| `critical` | Red | Active outage, data issues |

## Quick reference for operators

```ts
// broadcast.config.tsx — add inside getBroadcastMessages()
{
  id: 'outage-2026-03',          // Unique, never change post-deploy
  title: 'Service disruption',
  message: 'Search is currently unavailable. We are working on a fix.',
  severity: 'critical',
  createdAt: '2026-03-06T10:00:00Z',
  active: true,
}
```

## Technical details

See `src/common/providers/Broadcast/README.md` for the full developer reference including the hook API, dismissal storage mechanism, and extension points.
