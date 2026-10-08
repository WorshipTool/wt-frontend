'use client'

import { MOBILE_NAV_BREAKPOINT } from '@/common/components/MobileAppTabBar/nav.constants'
import { useTheme } from '@/common/ui'
import { useMediaQuery } from '@/common/ui/mui'

/**
 * True on phone-sized viewports — the one switch the mobile app shell uses.
 *
 * Every screen that renders a phone layout must ask this, rather than spelling
 * out `useMediaQuery(theme.breakpoints.down(...))` itself: several pages had
 * drifted to a hardcoded `700`, so changing the breakpoint would have moved the
 * tab bar without moving the page bodies that sit inside it.
 *
 * Note this is a JS media query, so it is `false` during SSR and the first
 * hydration render. Prefer CSS (`theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)`)
 * where a component can simply hide itself — that avoids the desktop-layout
 * flash. Use this hook when the two layouts are genuinely different trees.
 */
export function useIsPhone(): boolean {
	const theme = useTheme()
	return useMediaQuery(theme.breakpoints.down(MOBILE_NAV_BREAKPOINT))
}
