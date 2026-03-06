/**
 * Broadcast Message System
 *
 * Lightweight one-way broadcast system for sending operational messages
 * to all logged-in users (outages, maintenance notices, apologies).
 *
 * ## Setup (already done in AppClientProviders)
 *
 * 1. Wrap your app with `BroadcastProvider`
 * 2. Render `<BroadcastBanner />` inside the provider
 *
 * ## Adding a message
 *
 * Edit `broadcast.config.tsx` — add an entry to `getBroadcastMessages()`:
 *
 * ```ts
 * {
 *   id: 'outage-2026-03',
 *   title: 'Service disruption',
 *   message: 'Search is temporarily unavailable. We are working on a fix.',
 *   severity: 'critical',
 *   createdAt: '2026-03-06T10:00:00Z',
 *   active: true,
 * }
 * ```
 *
 * ## Accessing state in components
 *
 * ```tsx
 * import { useBroadcast } from '@/common/providers/Broadcast'
 *
 * const { currentBroadcast, dismiss } = useBroadcast()
 * ```
 */

// Types
export type {
  BroadcastContextValue,
  BroadcastMessage,
  BroadcastMessageId,
  BroadcastSeverity,
} from './broadcast.types'

// Config
export { getActiveBroadcasts, getBroadcastMessages } from './broadcast.config'

// Context & hooks
export { BroadcastProvider, useBroadcast } from './BroadcastContext'

// UI
export { BroadcastBanner } from './BroadcastBanner'
