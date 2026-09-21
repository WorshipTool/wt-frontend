'use client'

import { Box, Typography, useTheme } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { alpha } from '@/common/ui/mui'
import useAuth from '@/hooks/auth/useAuth'
import {
	HomeOutlined,
	HomeRounded,
	LibraryMusicOutlined,
	LibraryMusicRounded,
	PersonOutlineRounded,
	PersonRounded,
} from '@mui/icons-material'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

const PAGE_MAX_WIDTH = 480
/** Width below which the mobile tab bar shows (and the top bar hides). */
export const MOBILE_NAV_BREAKPOINT = 700
/** Bottom clearance pages need so their content isn't hidden by the fixed bar. */
export const MOBILE_NAV_CLEARANCE = 'calc(env(safe-area-inset-bottom) + 72px)'

type ActiveTab = 'home' | 'songs' | 'account' | null

function activeTabFor(pathname: string | null): ActiveTab {
	if (!pathname) return null
	if (pathname === '/') return 'home'
	if (pathname.startsWith('/seznam') || pathname.startsWith('/pisen')) return 'songs'
	// Signing in and up are reached from the Account tab (it points at login while
	// logged out), so they belong to it — otherwise the bar goes blank exactly
	// where the user most needs to know where they are.
	if (
		pathname.startsWith('/ucet') ||
		pathname.startsWith('/prihlaseni') ||
		pathname.startsWith('/registrace')
	)
		return 'account'
	return null
}

/**
 * The app's mobile bottom navigation — a blue (primary-gradient) tab bar with
 * Home / Songs / Account. Shown only on phones (CSS-hidden on desktop) and only
 * on "app" pages that opt in (via the SmartPage `mobileTabBar` option, or by
 * rendering it directly like the mobile home). Marketing pages keep the top bar.
 */
export default function MobileAppTabBar() {
	const theme = useTheme()
	const tNav = useTranslations('navigation')
	const { isLoggedIn } = useAuth()
	const active = activeTabFor(usePathname())
	const loggedIn = isLoggedIn()

	return (
		<Box
			sx={{
				position: 'fixed',
				bottom: 0,
				left: '50%',
				transform: 'translateX(-50%)',
				width: '100%',
				maxWidth: PAGE_MAX_WIDTH,
				background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
				display: 'flex',
				paddingBottom: 'env(safe-area-inset-bottom)',
				zIndex: 10,
				[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { display: 'none' },
			}}
		>
			<Link to="home" params={{ hledat: undefined }} style={{ flex: 1 }}>
				<TabItem icon={<HomeOutlined />} activeIcon={<HomeRounded />} label={tNav('home')} active={active === 'home'} />
			</Link>
			<Link to="songsList" params={{ s: undefined }} style={{ flex: 1 }}>
				<TabItem icon={<LibraryMusicOutlined />} activeIcon={<LibraryMusicRounded />} label={tNav('songs')} active={active === 'songs'} />
			</Link>
			<Link to={loggedIn ? 'account' : 'login'} params={loggedIn ? {} : { previousPage: '', message: '' }} style={{ flex: 1 }}>
				<TabItem icon={<PersonOutlineRounded />} activeIcon={<PersonRounded />} label={tNav('account')} active={active === 'account'} />
			</Link>
		</Box>
	)
}

type TabItemProps = {
	icon: JSX.Element
	activeIcon?: JSX.Element
	label: string
	active?: boolean
}

// White icon/label on the blue bar, dimmed when inactive.
function TabItem({ icon, activeIcon, label, active }: TabItemProps) {
	const theme = useTheme()
	const color = active ? theme.palette.common.white : alpha(theme.palette.common.white, 0.72)
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25, paddingY: 1, color }}>
			{active ? activeIcon ?? icon : icon}
			<Typography small strong={active ? 700 : 400}>
				{label}
			</Typography>
		</Box>
	)
}
