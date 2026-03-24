'use client'

import ParseAdminOption from '@/app/(layout)/vytvorit/components/ParseAdminOption'
import MainSearchInput from '@/app/components/components/MainSearchInput'
import RecommendedSongsList from '@/app/components/components/RecommendedSongsList/RecommendedSongsList'
import { useFooter } from '@/common/components/Footer/hooks/useFooter'
import { useToolbar } from '@/common/components/Toolbar/hooks/useToolbar'
import { useScrollHandler } from '@/common/providers/OnScrollComponent/useScrollHandler'
import { Box, Typography, useTheme } from '@/common/ui'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { useUrlState } from '@/hooks/urlstate/useUrlState'
import useWorshipCzVersion from '@/hooks/worshipcz/useWorshipCzVersion'
import MusicNoteRounded from '@mui/icons-material/MusicNoteRounded'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import SearchedSongsList from './components/SearchedSongsList'
import MobileLastAddedSection from './components/MobileLastAddedSection'
import AllListPanel from './components/AllListPanel/AllListPanel'
import { RESET_HOME_SCREEN_EVENT_NAME } from './HomeDesktop'

const TOOLBAR_HEIGHT = 56
const PAGE_PX = 2.5

export default function HomeMobile() {
	const theme = useTheme()
	const tHome = useTranslations('home')

	// --- Search state ---
	const [searchString, setSearchString] = useUrlState('hledat')
	const [searchInputValue, setSearchInputValue] = useState(searchString || '')

	const onSearchValueChange = useCallback(
		(e: string) => {
			setSearchInputValue(e)
			if (searchString === null) setSearchString('')
		},
		[searchString]
	)

	useChangeDelayer(
		searchInputValue,
		(value) => {
			if (value !== '') {
				setSearchString(value)
			}
		},
		[]
	)

	useEffect(() => {
		const handler = () => {
			setSearchInputValue('')
		}
		window.addEventListener(RESET_HOME_SCREEN_EVENT_NAME, handler)
		return () => {
			window.removeEventListener(RESET_HOME_SCREEN_EVENT_NAME, handler)
		}
	}, [])

	const [smartSearch, setSmartSearch] = useUrlState('smartSearch', false, {
		parse: (value) => value === 'true',
		stringify: (value) => (value ? 'true' : 'false'),
	})

	// --- Scroll & toolbar ---
	const { isTop } = useScrollHandler({ topThreshold: 20 })
	const toolbar = useToolbar()
	const footer = useFooter()

	useEffect(() => {
		toolbar.setTransparent(isTop)
		toolbar.setHideMiddleNavigation(!isTop)
		toolbar.setShowTitle(!isTop)
	}, [isTop, toolbar])

	useEffect(() => {
		footer.setShow(false)
	}, [footer])

	useEffect(() => {
		if (searchString === null) return
		window.scroll({ top: 90, behavior: 'smooth' })
	}, [searchString])

	// --- Data ---
	const useWorshipVersion = useWorshipCzVersion()
	const heroLead = tHome('hero.lead')
	const heroTitle = tHome('hero.title')
	const heroSubtitleLower = tHome('hero.subtitleLower')
	const searchBarRef = useRef<HTMLDivElement>(null)

	return (
		<Box
			data-testid="mobile-root"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
				width: '100%',
				background: `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, #fff 100%)`,
			}}
		>
			{/* ===== HERO SECTION ===== */}
			<Box
				data-testid="mobile-hero-section"
				sx={{
					marginTop: `-${TOOLBAR_HEIGHT}px`,
					paddingTop: `${TOOLBAR_HEIGHT + 24}px`,
					paddingX: PAGE_PX,
					paddingBottom: 2.5,
				}}
			>
				{/* Brand badge */}
				<Box
					sx={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 0.75,
						marginBottom: 1.5,
						padding: '4px 10px 4px 6px',
						borderRadius: '20px',
						background: `${theme.palette.primary.main}12`,
					}}
				>
					<MusicNoteRounded
						sx={{
							fontSize: '0.95rem',
							color: theme.palette.primary.main,
						}}
					/>
					<Typography
						sx={{
							fontSize: '0.75rem',
							fontWeight: 600,
							color: theme.palette.primary.main,
							letterSpacing: '0.04em',
							textTransform: 'uppercase',
						}}
					>
						{heroLead}
					</Typography>
				</Box>

				{/* Main heading */}
				<Typography
					variant="h4"
					strong={800}
					noWrap
					sx={{
						color: theme.palette.grey[900],
						lineHeight: 1.15,
						marginBottom: 0.5,
					}}
				>
					{heroTitle}
				</Typography>

				{useWorshipVersion && (
					<Typography
						sx={{
							color: theme.palette.grey[500],
							fontSize: '0.85rem',
							fontWeight: 400,
							lineHeight: 1.4,
						}}
					>
						{heroSubtitleLower}
					</Typography>
				)}
			</Box>

			{/* ===== SEARCH BAR ===== */}
			<Box
				ref={searchBarRef}
				data-testid="mobile-search-section"
				sx={{
					paddingX: PAGE_PX,
					paddingBottom: 2,
				}}
			>
				<MainSearchInput
					gradientBorder={false}
					value={searchInputValue}
					onChange={onSearchValueChange}
					smartSearch={smartSearch ?? false}
					onSmartSearchChange={setSmartSearch}
				/>
			</Box>

			{/* ===== STICKY SEARCH (on scroll) ===== */}
			<Box
				data-testid="mobile-sticky-search"
				sx={{
					position: 'sticky',
					top: `${TOOLBAR_HEIGHT}px`,
					zIndex: 100,
					paddingX: PAGE_PX,
					paddingY: 1,
					background: isTop
						? 'transparent'
						: 'rgba(255, 255, 255, 0.85)',
					backdropFilter: isTop ? 'none' : 'blur(20px) saturate(180%)',
					borderBottom: isTop
						? 'none'
						: `1px solid ${theme.palette.grey[200]}`,
					transition:
						'background 0.2s ease, backdrop-filter 0.2s ease, opacity 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
					opacity: isTop ? 0 : 1,
					pointerEvents: isTop ? 'none' : 'auto',
					transform: isTop ? 'translateY(-4px)' : 'translateY(0)',
				}}
			>
				<MainSearchInput
					gradientBorder={false}
					value={searchInputValue}
					onChange={onSearchValueChange}
					smartSearch={smartSearch ?? false}
					onSmartSearchChange={setSmartSearch}
				/>
			</Box>

			{/* ===== CONTENT ===== */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
					paddingTop: 1,
					paddingBottom: 5,
				}}
			>
				{/* Search results */}
				{searchString && (
					<Box sx={{ paddingX: PAGE_PX }}>
						<SearchedSongsList
							searchString={searchString}
							useSmartSearch={smartSearch ?? false}
						/>
					</Box>
				)}

				{/* Last added songs */}
				<MobileLastAddedSection />

				{/* Browse all songs CTA */}
				<Box sx={{ paddingX: PAGE_PX }}>
					<AllListPanel isMobile />
				</Box>

				{/* Recommended songs */}
				<Box sx={{ paddingX: PAGE_PX }}>
					<RecommendedSongsList />
				</Box>

				{/* Admin option */}
				<Box sx={{ paddingX: PAGE_PX }}>
					<ParseAdminOption />
				</Box>
			</Box>
		</Box>
	)
}
