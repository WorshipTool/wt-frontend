/**
 * Broadcast Message System Types
 *
 * Lightweight one-way broadcast system for sending operational messages
 * to all logged-in users. Unlike the news system, broadcast messages:
 * - Have no tutorials or feature flag requirements
 * - Are intended for operational notices (outages, maintenance, apologies)
 * - Are dismissed per-user using localStorage (no API round-trip required)
 * - Support severity levels for visual differentiation
 */

import { ReactNode } from 'react'

/**
 * Unique identifier for a broadcast message.
 * Should be stable across deployments — used as the dismiss key.
 */
export type BroadcastMessageId = string

/**
 * Severity level of a broadcast message.
 * Controls the visual appearance of the banner.
 *
 * - 'info'     → informational/neutral (blue)
 * - 'warning'  → caution/maintenance (amber)
 * - 'critical' → outage/urgent (red)
 */
export type BroadcastSeverity = 'info' | 'warning' | 'critical'

/**
 * Definition of a single broadcast message.
 * Defined statically in broadcast.config.tsx by operators.
 */
export type BroadcastMessage = {
  /** Unique stable ID — never change after deployment */
  id: BroadcastMessageId
  /** Short title displayed prominently */
  title: ReactNode
  /** Detailed message body (string or React element) */
  message: ReactNode
  /** Visual severity — controls banner color and icon */
  severity: BroadcastSeverity
  /** ISO date string — used for ordering (oldest shown first) */
  createdAt: string
  /**
   * Optional ISO date string — message auto-hides after this time.
   * Useful for maintenance windows with known end times.
   */
  expiresAt?: string
  /**
   * Whether the message is active.
   * Set to false to hide without removing the entry.
   * Defaults to true when omitted.
   */
  active?: boolean
}

/**
 * Return type of the useBroadcast() hook.
 */
export type BroadcastContextValue = {
  /** All active (non-expired, non-dismissed) messages for current user */
  activeBroadcasts: BroadcastMessage[]
  /** The message currently shown in the banner, or null if none */
  currentBroadcast: BroadcastMessage | null
  /** Index of currentBroadcast within activeBroadcasts (0-based) */
  currentIndex: number
  /** Total number of active undismissed messages */
  totalCount: number
  /** Whether the broadcast popup is currently open */
  isPopupOpen: boolean
  /** Close the broadcast popup (without dismissing messages) */
  closePopup: () => void
  /** Dismiss a specific message by ID (persisted to localStorage) */
  dismiss: (id: BroadcastMessageId) => void
  /** Dismiss all active messages at once */
  dismissAll: () => void
  /** Navigate to the previous message (wraps around) */
  navigatePrev: () => void
  /** Navigate to the next message (wraps around) */
  navigateNext: () => void
}
