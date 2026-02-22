'use client'

/**
 * Broadcast Message Context Provider
 *
 * Manages broadcast message state for the application.
 * Only shows messages to logged-in users.
 * Uses localStorage to track which messages the user has already dismissed.
 */

import useAuth from '@/hooks/auth/useAuth'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { getActiveBroadcastMessages } from './broadcast-message.config'
import { BroadcastMessage } from './broadcast-message.types'
import { useDownSize } from '@/common/hooks/useDownSize'

const STORAGE_KEY = 'broadcast-messages-seen'
const POPUP_AUTO_SHOW_DELAY_MS = 600

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function getSeenIds(): Set<string> {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return new Set()
		return new Set(JSON.parse(raw) as string[])
	} catch {
		return new Set()
	}
}

function markIdAsSeen(id: string): void {
	try {
		const seen = getSeenIds()
		seen.add(id)
		localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(seen)))
	} catch {
		// Silently fail if localStorage is unavailable
	}
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type Rt = ReturnType<typeof useBroadcastMessageProvider>

const BroadcastMessageContext = createContext<Rt>(
	{ uninitialized: true } as any as Rt,
)

const useBroadcastMessageProvider = () => {
	const { isLoggedIn } = useAuth()
	const isSmallDevice = useDownSize('md')

	const [messageToShow, setMessageToShow] =
		useState<BroadcastMessage | null>(null)
	const [isPopupOpen, setIsPopupOpen] = useState(false)
	const alreadyShownRef = useRef(false)

	// Reset when user logs out
	useEffect(() => {
		if (!isLoggedIn()) {
			setMessageToShow(null)
			setIsPopupOpen(false)
			alreadyShownRef.current = false
		}
	}, [isLoggedIn])

	// Determine which message to show when user is logged in
	useEffect(() => {
		if (!isLoggedIn() || isSmallDevice) {
			setMessageToShow(null)
			alreadyShownRef.current = false
			return
		}

		const seenIds = getSeenIds()
		const activeMessages = getActiveBroadcastMessages()
		const unseen = activeMessages.find((msg) => !seenIds.has(msg.id))
		setMessageToShow(unseen ?? null)
	}, [isLoggedIn, isSmallDevice])

	// Auto-open popup for unseen messages
	useEffect(() => {
		if (!isLoggedIn() || messageToShow === null || alreadyShownRef.current) {
			return
		}

		const timer = setTimeout(() => {
			setIsPopupOpen(true)
			alreadyShownRef.current = true
		}, POPUP_AUTO_SHOW_DELAY_MS)

		return () => clearTimeout(timer)
	}, [isLoggedIn, messageToShow])

	const closePopup = useCallback(() => {
		setIsPopupOpen(false)
	}, [])

	const dismissMessage = useCallback(() => {
		if (!messageToShow) return

		markIdAsSeen(messageToShow.id)

		setMessageToShow(null)
		setIsPopupOpen(false)
	}, [messageToShow])

	return {
		messageToShow,
		isPopupOpen,
		closePopup,
		dismissMessage,
	}
}

export function BroadcastMessageProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const data = useBroadcastMessageProvider()
	return (
		<BroadcastMessageContext.Provider value={data}>
			{children}
		</BroadcastMessageContext.Provider>
	)
}

/**
 * Hook for accessing the broadcast message context.
 */
export function useBroadcastMessage() {
	const r = useContext(BroadcastMessageContext)
	if ((r as any).uninitialized) {
		throw new Error(
			'useBroadcastMessage was used outside of a BroadcastMessageProvider',
		)
	}
	return r
}
