'use client'

import { useEffect, useRef } from 'react'

/** Marks the history entry an open overlay stands on. */
const MARKER = '__overlayBack'

/**
 * Back closes this overlay instead of leaving the screen it stands on.
 *
 * A sheet is state, not a route, so the phone's Back — which people reach for
 * to dismiss things long before they use it to travel — took the whole page
 * with it: Nástroje open on the catalog, one Back, and you were on the home
 * screen with no sheet and no catalog.
 *
 * Opening pushes one entry at the same URL, carrying the router's own state so
 * its bookkeeping is untouched; Back pops it and we close instead. Closing any
 * other way takes the entry back out, so it never outlives what it stands for
 * and Back is never a dead press. Closing because the app navigated leaves it
 * alone: the entry is then a duplicate of the page behind the new one, which is
 * exactly where Back should land anyway.
 */
export function useCloseOnBack(open: boolean, onClose: () => void) {
	const closeRef = useRef(onClose)
	closeRef.current = onClose

	useEffect(() => {
		if (!open || typeof window === 'undefined') return

		const here = window.location.href
		window.history.pushState(
			{ ...(window.history.state ?? {}), [MARKER]: true },
			''
		)

		let byBack = false
		const onPop = () => {
			byBack = true
			closeRef.current()
		}
		window.addEventListener('popstate', onPop)

		return () => {
			window.removeEventListener('popstate', onPop)
			const stillHere = window.location.href === here
			const ours = (window.history.state as Record<string, unknown> | null)?.[
				MARKER
			]
			if (!byBack && stillHere && ours) window.history.back()
		}
	}, [open])
}
