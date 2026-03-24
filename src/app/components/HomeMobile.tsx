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
const CONTENT_PADDING_X = 2.5

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
				backgroundColor: theme.palette.grey[50],
			}}
		>
			{/* Dark Header Zone - Hero + Search with smooth bottom curve */}
			<Box
				data-testid="mobile-header-zone"
				sx={{
					background: `linear-gradient(165deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
					marginTop: `-${TOOLBAR_HEIGHT}px`,
					paddingTop: `${TOOLBAR_HEIGHT * 2 + 16}px`,
					paddingBottom: 4,
					position: 'relative',
					borderRadius: '0 0 24px 24px',
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
						borderRadius: 'inherit',
					},
				}}
			>
				{/* Hero Content */}
				<Box
					sx={{
						paddingX: CONTENT_PADDING_X,
						paddingBottom: 2,
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 0.5,
							marginBottom: 2,
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
						paddingX: CONTENT_PADDING_X,
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
					paddingX: CONTENT_PADDING_X,
					paddingY: 1,
					background: isTop
						? 'transparent'
						: `linear-gradient(135deg, ${theme.palette.primary.main}F0, ${theme.palette.primary.dark}F0)`,
					backdropFilter: isTop ? 'none' : 'blur(16px)',
					transition:
						'background 0.25s ease, backdrop-filter 0.25s ease, opacity 0.25s ease, transform 0.25s ease',
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

			{/* Content sections with unified spacing */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
					paddingTop: 3,
					paddingBottom: 4,
				}}
			>
				{/* Search Results */}
				{searchString && (
					<Box sx={{ paddingX: CONTENT_PADDING_X }}>
						<SearchedSongsList
							searchString={searchString}
							useSmartSearch={smartSearch ?? false}
						/>
					</Box>
				)}

				{/* Last Added Songs - horizontal scroll */}
				<MobileLastAddedSection />

				{/* All Songs CTA */}
				<Box sx={{ paddingX: CONTENT_PADDING_X }}>
					<AllListPanel isMobile />
				</Box>

				{/* Recommended Songs */}
				<Box sx={{ paddingX: CONTENT_PADDING_X }}>
					<RecommendedSongsList />
				</Box>

				{/* Admin option (for admins) */}
				<Box sx={{ paddingX: CONTENT_PADDING_X }}>
					<ParseAdminOption />
				</Box>
			</Box>
		</Box>
	)
}
