'use client'

/**
 * Broadcast Context Provider
 *
 * Manages the state of operational broadcast messages for all logged-in users.
 * Dismissed messages are stored in localStorage keyed per user — no API required.
 *
 * Key differences from the News system:
 * - No tutorials, spotlights, or feature flag filtering
 * - Intended for operational notices (outages, maintenance, apologies)
 * - Shown to ALL logged-in users, not feature-gated
 * - Lightweight: dismissal persists in localStorage, not via API
 */

import useAuth from '@/hooks/auth/useAuth'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getActiveBroadcasts } from './broadcast.config'
import {
  BroadcastContextValue,
  BroadcastMessage,
  BroadcastMessageId,
} from './broadcast.types'

/** Delay before the popup auto-appears (ms) — matches news system */
const POPUP_AUTO_SHOW_DELAY_MS = 500

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_KEY_PREFIX = 'broadcast-dismissed'

function getDismissedIds(
  userId: string,
  knownIds?: BroadcastMessageId[],
): BroadcastMessageId[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${LS_KEY_PREFIX}-${userId}`)
    const ids = raw ? (JSON.parse(raw) as BroadcastMessageId[]) : []
    // Clean stale IDs that no longer correspond to any configured message
    if (knownIds) {
      const knownSet = new Set(knownIds)
      const cleaned = ids.filter((id) => knownSet.has(id))
      if (cleaned.length !== ids.length) {
        saveDismissedIds(userId, cleaned)
      }
      return cleaned
    }
    return ids
  } catch {
    return []
  }
}

function saveDismissedIds(userId: string, ids: BroadcastMessageId[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${LS_KEY_PREFIX}-${userId}`, JSON.stringify(ids))
  } catch {
    // Silently ignore storage errors (e.g. private browsing quota)
  }
}

// ─── Context setup ────────────────────────────────────────────────────────────

type Rt = BroadcastContextValue

const BroadcastContext = createContext<Rt>({ uninitialized: true } as any as Rt)

// ─── Provider logic ───────────────────────────────────────────────────────────

function useBroadcastProvider(): BroadcastContextValue {
  const { isLoggedIn, user } = useAuth()

  /** All configured + non-expired messages */
  const configuredMessages = useMemo(() => getActiveBroadcasts(), [])

  /** Per-user set of dismissed message IDs */
  const [dismissedIds, setDismissedIds] = useState<BroadcastMessageId[]>([])

  /** Index of the message currently shown in the popup */
  const [currentIndex, setCurrentIndex] = useState(0)

  /** Popup open/closed state */
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  /** Guard: popup auto-shown at most once per session */
  const alreadyShownRef = useRef(false)

  // Hydrate dismissed IDs from localStorage once the user is known
  // Stale IDs (from removed messages) are cleaned up automatically
  useEffect(() => {
    if (!isLoggedIn() || !user) {
      setDismissedIds([])
      setIsPopupOpen(false)
      alreadyShownRef.current = false
      return
    }
    const knownIds = configuredMessages.map((m) => m.id)
    setDismissedIds(getDismissedIds(user.guid as string, knownIds))
  }, [isLoggedIn, user, configuredMessages])

  // Reset index when the active list changes (e.g. on dismiss)
  const activeBroadcasts: BroadcastMessage[] = useMemo(() => {
    if (!isLoggedIn()) return []
    return configuredMessages.filter((msg) => !dismissedIds.includes(msg.id))
  }, [configuredMessages, dismissedIds, isLoggedIn])

  // Keep currentIndex within bounds
  useEffect(() => {
    setCurrentIndex((prev) => {
      if (activeBroadcasts.length === 0) return 0
      return Math.min(prev, activeBroadcasts.length - 1)
    })
  }, [activeBroadcasts.length])

  // Auto-close popup when all messages are dismissed
  useEffect(() => {
    if (activeBroadcasts.length === 0) {
      setIsPopupOpen(false)
    }
  }, [activeBroadcasts.length])

  // Auto-open popup once per session when active broadcasts appear
  useEffect(() => {
    if (
      !alreadyShownRef.current &&
      isLoggedIn() &&
      activeBroadcasts.length > 0
    ) {
      alreadyShownRef.current = true
      const timer = setTimeout(() => {
        setIsPopupOpen(true)
      }, POPUP_AUTO_SHOW_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [activeBroadcasts.length, isLoggedIn])

  const currentBroadcast: BroadcastMessage | null =
    activeBroadcasts[currentIndex] ?? null

  const totalCount = activeBroadcasts.length

  const dismiss = useCallback(
    (id: BroadcastMessageId) => {
      if (!user) return
      const updated = Array.from(new Set([...dismissedIds, id]))
      setDismissedIds(updated)
      saveDismissedIds(user.guid as string, updated)
    },
    [dismissedIds, user],
  )

  const dismissAll = useCallback(() => {
    if (!user) return
    const allIds = activeBroadcasts.map((m) => m.id)
    const updated = Array.from(new Set([...dismissedIds, ...allIds]))
    setDismissedIds(updated)
    saveDismissedIds(user.guid as string, updated)
  }, [activeBroadcasts, dismissedIds, user])

  const navigateNext = useCallback(() => {
    setCurrentIndex((prev) =>
      totalCount > 0 ? (prev + 1) % totalCount : 0,
    )
  }, [totalCount])

  const navigatePrev = useCallback(() => {
    setCurrentIndex((prev) =>
      totalCount > 0 ? (prev - 1 + totalCount) % totalCount : 0,
    )
  }, [totalCount])

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
  }, [])

  return {
    activeBroadcasts,
    currentBroadcast,
    currentIndex,
    totalCount,
    isPopupOpen,
    closePopup,
    dismiss,
    dismissAll,
    navigateNext,
    navigatePrev,
  }
}

// ─── Exported provider ────────────────────────────────────────────────────────

export function BroadcastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const data = useBroadcastProvider()
  return (
    <BroadcastContext.Provider value={data}>
      {children}
    </BroadcastContext.Provider>
  )
}

// ─── Exported hooks ───────────────────────────────────────────────────────────

/**
 * Access the broadcast context.
 * Must be used inside a BroadcastProvider.
 */
export function useBroadcast(): BroadcastContextValue {
  const ctx = useContext(BroadcastContext)
  if ((ctx as any).uninitialized) {
    throw new Error('useBroadcast must be used inside a BroadcastProvider')
  }
  return ctx
}
