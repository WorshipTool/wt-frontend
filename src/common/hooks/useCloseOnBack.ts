'use client'

import { useCallback, useEffect, useRef } from 'react'

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
 * the router's bookkeeping is untouched; Back pops it and we close instead.
 *
 * Taking that entry back out is the caller's move, and this returns a `dismiss`
 * for it: the ways of closing that mean "never mind" — the backdrop, the tab
 * that toggles the sheet — close through that, and Back is never a dead press
 * afterwards. Closing because the app navigated must leave the entry alone; it
 * is then a duplicate of the page behind the new one, which is where Back
 * should land anyway.
 *
 * It is deliberately not a cleanup. A cleanup cannot tell the two apart: the
 * router changes the URL *after* the overlay's state has gone, so "pop unless
 * we have moved" read as "we have not moved" every time and popped the
 * navigation that was still in flight — every item in Nástroje did nothing but
 * close the menu.
 */
export function useCloseOnBack(open: boolean, onClose: () => void) {
	const closeRef = useRef(onClose)
	closeRef.current = onClose
	const openedAt = useRef<string>()

	useEffect(() => {
		if (!open || typeof window === 'undefined') return

		openedAt.current = window.location.href
		window.history.pushState(
			{ ...(window.history.state ?? {}), [MARKER]: true },
			''
		)

		const onPop = () => closeRef.current()
		window.addEventListener('popstate', onPop)
		return () => window.removeEventListener('popstate', onPop)
	}, [open])

	/** Close, and take the overlay's history entry back out with it. */
	return useCallback(() => {
		closeRef.current()
		if (typeof window === 'undefined') return
		const ours = (window.history.state as Record<string, unknown> | null)?.[
			MARKER
		]
		if (ours && window.location.href === openedAt.current)
			window.history.back()
	}, [])
}
