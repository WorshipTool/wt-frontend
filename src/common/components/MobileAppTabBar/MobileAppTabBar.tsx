'use client'

import { takeSearchKeyboard } from '@/app/(layout)/pisne/searchHandoff'
import BrandSheepIcon from '@/assets/icon.svg'
import MobileBottomDock from '@/common/components/MobileAppTabBar/MobileBottomDock'
import MobileToolsMenu from '@/common/components/MobileAppTabBar/MobileToolsMenu'
import { TAB_ICON_SIZE, TabItem } from '@/common/components/MobileAppTabBar/TabItem'
import { Box } from '@/common/ui'
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
import { useSmartParams } from '@/routes/useSmartParams'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
	hasContextualBottomBar,
	isMobileTabBarRoute,
	mobileTabForPath,
	pageOwnsBottomClearance,
} from './nav.constants'

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
	const tNav = useTranslations('navigation')
	const { isLoggedIn } = useAuth()
	const pathname = useClientPathname()
	// Písně and Hledat are two doors into the one catalog, so which of them is
	// lit comes from the catalog's own parameter: present means this screen was
	// opened to search. Typing writes it with replaceState, which this hook does
	// not observe — the lit tab is the door you came through, and stays put while
	// you type.
	const { hledat } = useSmartParams('songsList')

	const [toolsOpen, setToolsOpen] = useState(false)

	// `force` is for the screens the router cannot classify — the 404, which has
	// no route key to put in nav.constants but is very much somewhere you want a
	// way out of.
	if (!force && !isMobileTabBarRoute(pathname)) return null

	// inside a team the team's own sections are the bar, and they carry the way
	// out themselves — see hasContextualBottomBar
	if (!force && hasContextualBottomBar(pathname)) return null

	const active = mobileTabForPath(pathname)
	const searchActive = active === 'songs' && hledat !== undefined
	const loggedIn = isLoggedIn()

	return (
		<>
			<MobileBottomDock spacer={!pageOwnsBottomClearance(pathname)}>
				<Link to="home" params={{ hledat: undefined }} style={{ flex: 1, minWidth: 0 }}>
					{/* the brand sheep instead of a generic house. It paints with
					    fill="currentColor", so it tints for the active state like the
					    Material icons beside it — but it has only one weight, so
					    active is carried by colour alone (no outlined/filled swap). */}
					<TabItem
						icon={<BrandSheepIcon width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} />}
						label={tNav('home')}
						active={active === 'home'}
					/>
				</Link>
				<Link
					to="songsList"
					params={{ s: undefined, hledat: undefined }}
					style={{ flex: 1, minWidth: 0 }}
				>
					<TabItem
						icon={<LibraryMusicOutlined />}
						activeIcon={<LibraryMusicRounded />}
						label={tNav('songs')}
						active={active === 'songs' && !searchActive}
					/>
				</Link>

				{/* Hledat is the catalog with its field asking for the caret — the
				    same screen Písně opens, which is why the two share a tab's worth
				    of highlighting between them. Searching used to be a layer over
				    home, so this tab went to a different screen than Písně did. */}
				<Link
					to="songsList"
					params={{ hledat: '', s: undefined }}
					style={{ flex: 1, minWidth: 0 }}
				>
					{/* The keyboard belongs to the tap: a phone opens it for a field
					    focused inside the gesture and for nothing else, and the
					    catalog's field is focused a navigation later. So the tap takes
					    a field of its own — see searchHandoff. */}
					<Box onClick={takeSearchKeyboard}>
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
			</MobileBottomDock>

			{/* lazy-mounted so its data hooks only run when the sheet is opened */}
			{toolsOpen && <MobileToolsMenu onClose={() => setToolsOpen(false)} />}
		</>
	)
}
