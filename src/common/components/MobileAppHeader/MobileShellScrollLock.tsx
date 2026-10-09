'use client'

import {
	isMobileAppShellRoute,
	MOBILE_NAV_BREAKPOINT,
} from '@/common/components/MobileAppTabBar/nav.constants'
import { useClientPathname } from '@/hooks/pathname/useClientPathname'

/**
 * On an app-shell screen, the phone's document does not scroll. The shell is
 * fixed and carries its own scroller; the document underneath has nothing to
 * move, and being able to drag it is what produced the phantom scroller —
 * a gesture that goes nowhere and leaves the real list ignoring you until it
 * ends.
 *
 * It is a rule rather than a `style.overflow` set on mount, because mounting is
 * too late: the phone layout is chosen by a JS media query, so until hydration
 * the screen is showing the server's desktop layout, which is a screenful
 * taller than the window (a hero, a page of songs). That is the window the
 * phantom lives in — measured at ~2.5s on a dev build, and longer the slower
 * the phone. A stylesheet rendered here is in the first HTML the browser gets,
 * so the document is settled before there is anything to drag.
 *
 * The rule is the width the shell itself appears at, so the two can never
 * disagree about which layout is on screen. Nothing here touches a desktop, and
 * nothing touches the screens that legitimately scroll their document — the
 * marketing pages, the team module, the storybook.
 */
export default function MobileShellScrollLock() {
	const pathname = useClientPathname()
	if (!isMobileAppShellRoute(pathname)) return null

	return (
		<style
			// `:root` rather than `html`, so it outranks the app's own
			// `html { overflow-y: auto }` however the stylesheets end up ordered
			dangerouslySetInnerHTML={{
				__html: `@media (max-width: ${
					MOBILE_NAV_BREAKPOINT - 0.05
				}px){:root{overflow:hidden}}`,
			}}
		/>
	)
}
