'use client'
import { RIGHT_SIDE_BAR_CLASSNAME } from '@/common/components/app/SmartPage/SmartPageInner'
import { MobileShellScrollLock } from '@/common/components/MobileAppHeader'
import MobileAppTabBar from '@/common/components/MobileAppTabBar/MobileAppTabBar'
import {
	isMobileTabBarRoute,
	MOBILE_NAV_BREAKPOINT,
} from '@/common/components/MobileAppTabBar/nav.constants'
import { Toolbar } from '@/common/components/Toolbar'
import { Box, useTheme } from '@/common/ui'
import { useClientPathname } from '@/hooks/pathname/useClientPathname'
import React from 'react'
import { useSmartMatch } from '../../../../routes/useSmartMatch'
import Footer from '../../Footer/Footer'
import './applayout.styles.css'

interface AppContainerProps {
	children?: React.ReactNode
}

export default function Inner({ children }: AppContainerProps) {
	const hidden = useSmartMatch('playlistCards')
	const theme = useTheme()
	// on the app-shell routes the tab bar replaces the marketing footer on phones
	const appRoute = isMobileTabBarRoute(useClientPathname())

	return hidden ? (
		children
	) : (
		<Box display={'flex'} flexDirection={'column'} minHeight={'100vh'}>
			{/* on a phone, an app-shell screen scrolls inside its own shell and the
			    document underneath stays put — from the first paint, not from
			    hydration */}
			<MobileShellScrollLock />
			<Toolbar />
			<Box className={'app-body-container'}>
				{children}
				<Box className={RIGHT_SIDE_BAR_CLASSNAME}></Box>
			</Box>
			{/* tab bar (with its in-flow bottom spacer) before the flex fill, so a
			    short page doesn't get extra empty scroll below the fold */}
			<MobileAppTabBar />
			<Box flex={1} />
			<Box sx={appRoute ? { [theme.breakpoints.down(MOBILE_NAV_BREAKPOINT)]: { display: 'none' } } : undefined}>
				<Footer />
			</Box>
		</Box>
	)
}
