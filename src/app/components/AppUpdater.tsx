'use client'

import { FRONTEND_URL } from '@/api/constants'
import {
	isAppReloadBlocked,
	subscribeAppReloadBlocked,
} from '@/app/components/appReloadGuard'
import { deriveBasePath } from '@/tech/url/basePath'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useRef } from 'react'

// Baked into the client bundle at build time; the server's /api/build-id returns
// the currently-deployed build's hash. A mismatch means a newer version shipped.
const INITIAL_HASH = process.env.NEXT_PUBLIC_BUILD_HASH
const POLL_INTERVAL_MS = 60_000

/**
 * App-wide auto-updater (no service worker). Polls the deployed build hash and,
 * when a newer version is live, reloads at the next *safe* moment.
 *
 * Safe means the tab is visible (so the reload isn't a surprise the user comes
 * back to) and no screen has declared unsaved work through `useBlockAppReload`.
 * Once an update is pending it is applied as soon as those hold — on a route
 * change, on tab refocus, or the moment the last blocker clears.
 */
export default function AppUpdater() {
	const pathname = usePathname()
	const { enqueueSnackbar } = useSnackbar()
	const t = useTranslations('common')

	const pendingRef = useRef(false)
	const reloadingRef = useRef(false)

	const reload = useCallback(() => {
		if (reloadingRef.current) return
		reloadingRef.current = true
		enqueueSnackbar(t('updatingVersion'), {
			variant: 'info',
			autoHideDuration: 2500,
		})
		// small delay so the toast is visible before the reload
		setTimeout(() => window.location.reload(), 800)
	}, [enqueueSnackbar, t])

	/** Apply a pending update, but only when nothing would be lost by it. */
	const applyIfSafe = useCallback(() => {
		if (!pendingRef.current) return
		if (isAppReloadBlocked()) return
		if (document.visibilityState !== 'visible') return
		reload()
	}, [reload])

	// detect a newer deployed build
	useEffect(() => {
		if (!INITIAL_HASH) return

		const url = `${deriveBasePath(FRONTEND_URL)}/api/build-id`

		const check = async () => {
			if (pendingRef.current) return
			try {
				const res = await fetch(url, { cache: 'no-store' })
				const { hash } = await res.json()
				if (hash && hash !== INITIAL_HASH) {
					pendingRef.current = true
					applyIfSafe()
				}
			} catch {
				// network hiccups are non-critical — retry next interval
			}
		}

		const onVisible = () => {
			if (document.visibilityState !== 'visible') return
			if (pendingRef.current) applyIfSafe()
			else check()
		}

		const interval = setInterval(check, POLL_INTERVAL_MS)
		document.addEventListener('visibilitychange', onVisible)
		window.addEventListener('focus', onVisible)
		check()

		return () => {
			clearInterval(interval)
			document.removeEventListener('visibilitychange', onVisible)
			window.removeEventListener('focus', onVisible)
		}
	}, [applyIfSafe])

	// a pending update becomes safe the moment the last blocker clears
	useEffect(() => subscribeAppReloadBlocked(applyIfSafe), [applyIfSafe])

	// …or when the user navigates away from whatever they were doing
	useEffect(() => {
		applyIfSafe()
	}, [pathname, applyIfSafe])

	return null
}
