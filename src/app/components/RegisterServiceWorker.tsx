'use client'

import { FRONTEND_URL } from '@/api/constants'
import { deriveBasePath } from '@/tech/url/basePath'
import { useEffect } from 'react'

/**
 * Registers the minimal service worker (public/sw.js) so the browser treats the
 * site as an installable PWA — this is what lets Android/Chrome offer its native
 * "Install app" prompt on its own. The worker does no caching / offline; version
 * updates are handled by AppUpdater. No custom install UI is shown.
 */
export default function RegisterServiceWorker() {
	useEffect(() => {
		if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
			return
		}
		const url = `${deriveBasePath(FRONTEND_URL)}/sw.js`
		navigator.serviceWorker.register(url).catch(() => {
			// registration failures are non-critical (unsupported browser, etc.)
		})
	}, [])

	return null
}
