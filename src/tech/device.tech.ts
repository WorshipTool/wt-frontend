'use client'

const getUserAgent = () =>
	typeof navigator !== 'undefined' ? navigator.userAgent : ''

const getMaxTouchPoints = () =>
	typeof navigator !== 'undefined' ? navigator.maxTouchPoints ?? 0 : 0

const ua = getUserAgent()

// Modern iPads (iPadOS 13+) report as Macintosh but have multi-touch support.
// Real Macs have maxTouchPoints === 0.
const isModernIPad = /Macintosh/i.test(ua) && getMaxTouchPoints() > 1

export const isTablet =
	typeof navigator !== 'undefined' &&
	(/iPad/i.test(ua) || isModernIPad || /Android(?!.*Mobile)/i.test(ua))

export const isMobile =
	typeof navigator !== 'undefined' &&
	!isTablet &&
	/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

/**
 * Whether the app is running as an installed app rather than in a browser tab.
 *
 * A function, not a module constant like the two above: those read the user
 * agent, which is the same string whenever you ask, while this reads a media
 * query that is false on the server and answered by the window the app ended up
 * in. Asking at the moment of the click is the only way to get a true answer in
 * both.
 *
 * `navigator.standalone` is iOS's own flag; it predates the standard and is
 * still the only signal Safari gives. The display modes are the standard one —
 * all three of them, because the manifest asks for `standalone` but a platform
 * is free to install the app in any of them.
 */
export const isStandalonePwa = () => {
	if (typeof window === 'undefined') return false
	if ((window.navigator as { standalone?: boolean }).standalone === true)
		return true
	return ['standalone', 'minimal-ui', 'fullscreen'].some(
		(mode) => window.matchMedia?.(`(display-mode: ${mode})`).matches
	)
}
