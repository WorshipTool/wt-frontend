'use client'

import { Box, useTheme } from '@/common/ui'
import { ReactNode } from 'react'
import {
	ABOVE_TABBAR_SLOT_ID,
	MOBILE_NAV_BREAKPOINT,
	MOBILE_NAV_CLEARANCE,
} from './nav.constants'

type Props = {
	/** The bar's items — the app's tabs, or a module's own sections. */
	children: ReactNode
	/**
	 * In-flow spacer so page content can scroll clear of the fixed dock. Turned
	 * off for pages that already pad their own bottom by the same amount.
	 */
	spacer?: boolean
}

/**
 * The phone's bottom dock: one fixed strip at the bottom of the screen, with a
 * slot directly above it that pages portal their own docked content into (see
 * `PageAction`).
 *
 * Exactly one dock is mounted at a time — the app's tab bar on app routes, or a
 * module's own bar where it takes over (inside a team, whose sections replace
 * the app's tabs instead of stacking a second bar on top of them). Everything
 * the two must agree on — the slot's id, the z-index, the strip's own chrome,
 * where it stops applying — is stated here once rather than in each bar.
 */
export default function MobileBottomDock({ children, spacer = true }: Props) {
	const theme = useTheme()
	const hideOnDesktop = {
		[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { display: 'none' },
	}

	return (
		<>
			{spacer && (
				<Box
					sx={{ height: MOBILE_NAV_CLEARANCE, flexShrink: 0, ...hideOnDesktop }}
				/>
			)}
			<Box
				sx={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					display: 'flex',
					flexDirection: 'column',
					zIndex: 10,
					...hideOnDesktop,
				}}
			>
				{/* pages portal their bottom-docked content here; it stacks directly
				    on top of the bar via layout (no hard-coded bar height) */}
				<Box
					id={ABOVE_TABBAR_SLOT_ID}
					sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
				/>

				<Box
					sx={{
						bgcolor: 'background.paper',
						borderTop: '1px solid',
						borderColor: 'grey.200',
						display: 'flex',
						alignItems: 'flex-start',
						paddingTop: 1.5,
						paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
						width: '100%',
					}}
				>
					{children}
				</Box>
			</Box>
		</>
	)
}
