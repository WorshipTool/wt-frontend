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
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import SearchedSongsList from './components/SearchedSongsList'
import MobileLastAddedSection from './components/MobileLastAddedSection'
import AllListPanel from './components/AllListPanel/AllListPanel'
import { RESET_HOME_SCREEN_EVENT_NAME } from './HomeDesktop'

const TOOLBAR_HEIGHT = 56

export default function HomeMobile() {
	const theme = useTheme()
	const tHome = useTranslations('home')

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

	const useWorshipVersion = useWorshipCzVersion()

	const heroLead = tHome('hero.lead')
	const heroTitle = tHome('hero.title')
	const heroSubtitleLower = tHome('hero.subtitleLower')

	const searchBarRef = useRef<HTMLDivElement>(null)

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
				width: '100%',
			}}
		>
			{/* Dark Header Zone - Hero + Search */}
			<Box
				data-testid="mobile-header-zone"
				sx={{
					background: `linear-gradient(165deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
					marginTop: `-${TOOLBAR_HEIGHT}px`,
					paddingTop: `${TOOLBAR_HEIGHT * 2 + 16}px`,
					paddingBottom: 2.5,
					position: 'relative',
					'&::after': {
						content: '""',
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background:
							'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
						pointerEvents: 'none',
					},
					'&::before': {
						content: '""',
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: -20,
						height: 20,
						background: `linear-gradient(to bottom, ${theme.palette.primary.dark}22, transparent)`,
						pointerEvents: 'none',
					},
				}}
			>
				{/* Hero Content */}
				<Box
					sx={{
						paddingX: 2.5,
						paddingBottom: 1,
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 0.5,
							marginBottom: 1.5,
						}}
					>
						<Typography
							variant="h5"
							strong={200}
							sx={{
								color: 'rgba(255,255,255,0.65)',
								lineHeight: 1.2,
							}}
						>
							{heroLead}
						</Typography>
						<Typography
							variant="h3"
							strong={900}
							noWrap
							sx={{
								color: 'white',
								lineHeight: 1.1,
							}}
						>
							{heroTitle}
						</Typography>
						{useWorshipVersion && (
							<Typography
								strong={300}
								sx={{
									color: 'rgba(255,255,255,0.5)',
									lineHeight: 1.3,
								}}
							>
								{heroSubtitleLower}
							</Typography>
						)}
					</Box>
				</Box>

				{/* Search Bar inside dark zone */}
				<Box
					ref={searchBarRef}
					sx={{
						paddingX: 2,
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
			</Box>

			{/* Sticky Search Bar - appears when scrolled past header */}
			<Box
				sx={{
					position: 'sticky',
					top: `${TOOLBAR_HEIGHT}px`,
					zIndex: 100,
					paddingX: 2,
					paddingY: 1,
					background: isTop
						? 'transparent'
						: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
					backdropFilter: isTop ? 'none' : 'blur(12px)',
					transition: 'background 0.2s ease, backdrop-filter 0.2s ease',
					opacity: isTop ? 0 : 1,
					pointerEvents: isTop ? 'none' : 'auto',
					transform: isTop ? 'translateY(-8px)' : 'translateY(0)',
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

			{/* Content */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
					paddingTop: 2,
				}}
			>
				{/* Search Results */}
				{searchString && (
					<SearchedSongsList
						searchString={searchString}
						useSmartSearch={smartSearch ?? false}
					/>
				)}

				{/* Last Added Songs - horizontal scroll */}
				<MobileLastAddedSection />

				{/* All Songs Button */}
				<Box sx={{ paddingX: 2 }}>
					<AllListPanel isMobile />
				</Box>

				{/* Recommended Songs */}
				<RecommendedSongsList />

				{/* Admin option (for admins) */}
				<ParseAdminOption />
			</Box>
		</Box>
	)
}
