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
			}}
		>
			{/* Hero Section */}
			<Box
				sx={{
					paddingTop: `${TOOLBAR_HEIGHT + 16}px`,
					paddingX: 2,
					paddingBottom: 1.5,
					background: isTop
						? `linear-gradient(165deg, rgba(0,133,255,0.06) 0%, rgba(83,46,231,0.04) 50%, transparent 100%)`
						: 'transparent',
					transition: 'background 0.3s ease',
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
							color: 'grey.600',
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
							background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							lineHeight: 1.1,
						}}
					>
						{heroTitle}
					</Typography>
					{useWorshipVersion && (
						<Typography
							strong={300}
							sx={{
								color: 'grey.500',
								lineHeight: 1.3,
							}}
						>
							{heroSubtitleLower}
						</Typography>
					)}
				</Box>
			</Box>

			{/* Sticky Search Bar */}
			<Box
				ref={searchBarRef}
				sx={{
					position: 'sticky',
					top: `${TOOLBAR_HEIGHT}px`,
					zIndex: 100,
					paddingX: 2,
					paddingY: 1,
					backgroundColor: isTop ? 'transparent' : 'rgba(255,255,255,0.95)',
					backdropFilter: isTop ? 'none' : 'blur(12px)',
					transition: 'background-color 0.2s ease, backdrop-filter 0.2s ease',
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
					paddingTop: 1,
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
