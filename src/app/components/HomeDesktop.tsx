'use client'

import ParseAdminOption from '@/app/(layout)/vytvorit/components/ParseAdminOption'
import { useFooter } from '@/common/components/Footer/hooks/useFooter'
import { useToolbar } from '@/common/components/Toolbar/hooks/useToolbar'
import { Box, useTheme } from '@/common/ui'
import { useMediaQuery } from '@/common/ui/mui'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { useUrlState } from '@/hooks/urlstate/useUrlState'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import FloatingAddButton from './components/FloatingAddButton'
import HeroSection from './home/HeroSection'
import HomeSearchResults from './home/HomeSearchResults'
import RecentlyAddedSection from './home/RecentlyAddedSection'
import SongIdeasSection from './home/SongIdeasSection'

export const RESET_HOME_SCREEN_EVENT_NAME = 'reset_home_screen_jh1a94'

export default function HomeDesktop() {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down(700))

	// Search state with URL sync
	const [searchString, setSearchString] = useUrlState('hledat')
	const [searchInputValue, setSearchInputValue] = useState(searchString || '')

	const onSearchValueChange = useCallback(
		(value: string) => {
			setSearchInputValue(value)
			if (searchString === null) setSearchString('')
		},
		[searchString]
	)

	useChangeDelayer(
		searchInputValue,
		(value) => {
			if (value !== '') {
				setSearchString(value)
			} else {
				setSearchString(null)
			}
		},
		[]
	)

	useEffect(() => {
		const handler = () => {
			setSearchInputValue('')
			setSearchString(null)
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

	// Toolbar & footer configuration
	const toolbar = useToolbar()
	const footer = useFooter()

	useEffect(() => {
		toolbar.setTransparent(true)
		toolbar.setShowTitle(false)
	}, [toolbar])

	useEffect(() => {
		footer.setShow(false)
	}, [footer])

	const isSearching = !!searchString && searchString.length > 0

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
			}}
		>
			{/* Hero with search */}
			<HeroSection
				searchValue={searchInputValue}
				onSearchChange={onSearchValueChange}
				smartSearch={smartSearch ?? false}
				onSmartSearchChange={setSmartSearch}
			/>

			{/* Content area: search results OR browse sections */}
			<AnimatePresence mode="wait">
				{isSearching ? (
					<motion.div
						key="search-results"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<HomeSearchResults
							searchString={searchString}
							useSmartSearch={smartSearch ?? false}
						/>
					</motion.div>
				) : (
					<motion.div
						key="browse-content"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						{/* Song ideas - horizontal scroll */}
						<SongIdeasSection />

						{/* Recently added songs - grid */}
						<RecentlyAddedSection />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Floating action button */}
			{!isMobile ? (
				<FloatingAddButton extended={isSearching} />
			) : (
				<ParseAdminOption />
			)}
		</Box>
	)
}
