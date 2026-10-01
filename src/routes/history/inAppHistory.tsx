'use client'

import { useClientPathname } from '@/hooks/pathname/useClientPathname'
import { useEffect } from 'react'

/**
 * Whether this tab has navigated inside the app since it loaded.
 *
 * A back arrow has two right answers and has to tell them apart: go back where
 * you came from, or — if you arrived from outside, on a shared link — go up to
 * the screen this one belongs to. Both places used to ask
 * `window.history.state.idx`, which is a Pages Router field. The App Router
 * writes `__NA` and its own tree and no `idx` at all, so the playlist read the
 * missing value as 0 and went up to Účet every single time, however you got
 * there; the app header fell back to `history.length > 1`, which counts the
 * pages of other sites this tab visited and would happily walk you out of the
 * app.
 *
 * The app knows the answer without asking the browser: it has navigated if its
 * own pathname has changed since the first paint. Kept as module state on
 * purpose — a full load is exactly the case where the answer is "no".
 */
const seen: string[] = []

/** True once at least one in-app navigation has happened in this tab. */
export function hasInAppHistory(): boolean {
	return seen.length > 1
}

/**
 * Counts the app's own navigations, once, app-wide. Renders nothing; mounted in
 * `AppClientProviders`. Repeats are ignored so a double-invoked effect (React
 * in development) cannot make a fresh page look navigated-to.
 */
export default function InAppHistoryTracker() {
	const pathname = useClientPathname()

	useEffect(() => {
		const path = pathname ?? ''
		if (seen[seen.length - 1] !== path) seen.push(path)
	}, [pathname])

	return null
}
