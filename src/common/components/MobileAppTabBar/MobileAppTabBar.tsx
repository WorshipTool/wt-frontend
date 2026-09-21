'use client'

import BrandSheepIcon from '@/assets/icon.svg'
import { MAIN_SEARCH_EVENT_NAME } from '@/app/components/components/MainSearchInput'
import MobileToolsMenu from '@/common/components/MobileAppTabBar/MobileToolsMenu'
import { Box, Typography, useTheme } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import useAuth from '@/hooks/auth/useAuth'
import {
	Apps,
	AppsOutlined,
	LibraryMusicOutlined,
	LibraryMusicRounded,
	LoginRounded,
	PersonOutlineRounded,
	PersonRounded,
	Search,
	SearchOutlined,
} from '@mui/icons-material'
import { useClientPathname } from '@/hooks/pathname/useClientPathname'
import { useMobileSearchOpen } from './mobileSearchState'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
	ABOVE_TABBAR_SLOT_ID,
	MOBILE_NAV_BREAKPOINT,
	MOBILE_NAV_CLEARANCE,
	isMobileTabBarRoute,
	mobileTabForPath,
	pageOwnsBottomClearance,
} from './nav.constants'

/** Icon box size shared by every tab (and by the tab bar's playground story). */
export const TAB_ICON_SIZE = 25

/**
 * The app's mobile bottom navigation — a light (white) tab bar of equally sized
 * tabs: Domů / Písně / Hledat / Nástroje (signed in only) / Účet (or Přihlásit).
 * Every tab reads the same — grey at rest, brand blue when it is the current
 * one, search included. Rendered once, globally, next to the top
 * bar (see AppLayoutInner) and driven by the route: it shows on the app-shell
 * routes (where the top bar hides itself) and renders nothing on marketing
 * pages. Phone-only (CSS-hidden on desktop). Like the top bar, it renders an
 * in-flow spacer so page content clears the fixed bar.
 */
export default function MobileAppTabBar({ force = false }: { force?: boolean } = {}) {
	const theme = useTheme()
	const tNav = useTranslations('navigation')
	const { isLoggedIn } = useAuth()
	const pathname = useClientPathname()
	const searchActive = useMobileSearchOpen()

	const [toolsOpen, setToolsOpen] = useState(false)

	// `force` is for the screens the router cannot classify — the 404, which has
	// no route key to put in nav.constants but is very much somewhere you want a
	// way out of.
	if (!force && !isMobileTabBarRoute(pathname)) return null

	const active = mobileTabForPath(pathname)
	const loggedIn = isLoggedIn()
	const hideOnDesktop = {
		[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { display: 'none' },
	}

	return (
		<>
			{/* in-flow spacer so content can scroll clear of the fixed bar — skipped
			    on pages whose surface already pads for the bar itself */}
			{!pageOwnsBottomClearance(pathname) && (
				<Box sx={{ height: MOBILE_NAV_CLEARANCE, flexShrink: 0, ...hideOnDesktop }} />
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
					<Link to="home" params={{ hledat: undefined }} style={{ flex: 1, minWidth: 0 }}>
					{/* the brand sheep instead of a generic house. It paints with
					    fill="currentColor", so it tints for the active state like the
					    Material icons beside it — but it has only one weight, so
					    active is carried by colour alone (no outlined/filled swap). */}
					<TabItem
						icon={
							<BrandSheepIcon width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} />
						}
						label={tNav('home')}
						active={active === 'home' && !searchActive}
					/>
				</Link>
				<Link to="songsList" params={{ s: undefined }} style={{ flex: 1, minWidth: 0 }}>
					<TabItem
						icon={<LibraryMusicOutlined />}
						activeIcon={<LibraryMusicRounded />}
						label={tNav('songs')}
						active={active === 'songs'}
					/>
				</Link>

				{/* search is a tab like any other — grey at rest, brand blue only
				    while the search layer is open (house Link doesn't forward onClick,
				    so the focus event is dispatched from a wrapper) */}
				<Link to="home" params={{ hledat: '' }} style={{ flex: 1, minWidth: 0 }}>
					<Box
						onClick={() =>
							window.dispatchEvent(new Event(MAIN_SEARCH_EVENT_NAME))
						}
					>
						<TabItem
							icon={<SearchOutlined />}
							activeIcon={<Search />}
							label={tNav('search')}
							active={searchActive}
						/>
					</Box>
				</Link>

				{/* Nástroje opens the signed-in user's own stuff, so there is nothing
				    behind it while signed out — the bar is four tabs then, rather than
				    padded out with a marketing link that isn't navigation. */}
				{loggedIn && (
						<Box
							component="button"
							type="button"
							onClick={() => setToolsOpen(true)}
							sx={{
								flex: 1,
								minWidth: 0,
								border: 'none',
								background: 'transparent',
								padding: 0,
								cursor: 'pointer',
								font: 'inherit',
							}}
						>
							<TabItem
								icon={<AppsOutlined />}
								activeIcon={<Apps />}
								label={tNav('tools')}
								active={toolsOpen || active === 'tools'}
							/>
						</Box>
					)}

					{loggedIn ? (
						<Link to="account" params={{}} style={{ flex: 1, minWidth: 0 }}>
							<TabItem
								icon={<PersonOutlineRounded />}
								activeIcon={<PersonRounded />}
								label={tNav('account')}
								active={active === 'account'}
							/>
						</Link>
					) : (
						<Link
							to="login"
							params={{ previousPage: '', message: '' }}
							style={{ flex: 1, minWidth: 0 }}
						>
							<TabItem
								icon={<LoginRounded />}
								label={tNav('login')}
								active={active === 'account'}
							/>
						</Link>
					)}
				</Box>
			</Box>

			{/* lazy-mounted so its data hooks only run when the sheet is opened */}
			{toolsOpen && <MobileToolsMenu onClose={() => setToolsOpen(false)} />}
		</>
	)
}

type TabItemProps = {
	icon: JSX.Element
	activeIcon?: JSX.Element
	label: string
	active?: boolean
}

// side tab: blue (brand) when active, grey when not; filled icon + bold label when active
export function TabItem({ icon, activeIcon, label, active }: TabItemProps) {
	const iconColor = active ? 'primary.main' : 'grey.500'
	const labelColor = active ? 'primary.main' : 'grey.700'
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 0.6,
				minWidth: 0,
			}}
		>
			<Box
				sx={{
					color: iconColor,
					display: 'flex',
					paddingX: 1.5,
					paddingY: 0.25,
					'& svg': { fontSize: TAB_ICON_SIZE },
				}}
			>
				{active ? activeIcon ?? icon : icon}
			</Box>
			<Typography
				noWrap
				size="0.65rem"
				strong={active ? 700 : 500}
				color={labelColor}
				sx={{ lineHeight: 1.2 }}
			>
				{label}
			</Typography>
		</Box>
	)
}
