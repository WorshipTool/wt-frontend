'use client'

import ParseAdminOption from '@/app/(layout)/vytvorit/components/ParseAdminOption'
import SearchedSongsList from '@/app/components/components/SearchedSongsList'
import FloatingAddButton from '@/app/components/components/FloatingAddButton'
import { useFooter } from '@/common/components/Footer/hooks/useFooter'
import { useToolbar } from '@/common/components/Toolbar/hooks/useToolbar'
import { useTheme } from '@/common/ui'
import { useMediaQuery } from '@/common/ui/mui'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { useUrlState } from '@/hooks/urlstate/useUrlState'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import HomeSearchBar from './HomeSearchBar'
import QuickSearchTags from './QuickSearchTags'
import SongIdeasSection from './SongIdeasSection'
import RecentlyAddedSection from './RecentlyAddedSection'
import BrowseAllBanner from './BrowseAllBanner'
import styles from './HomeDesktop.module.css'

export const RESET_HOME_SCREEN_EVENT_NAME = 'reset_home_screen_jh1a94'

export default function HomeDesktopNew() {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down(700))
	const tHome = useTranslations('home')

	// Search state
	const [searchString, setSearchString] = useUrlState('hledat')
	const [searchInputValue, setSearchInputValue] = useState(searchString || '')

	const onSearchValueChange = useCallback(
		(value: string) => {
			setSearchInputValue(value)
			if (searchString === null) setSearchString('')
		},
		[searchString, setSearchString]
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

	// Reset handler
	useEffect(() => {
		const handler = () => {
			setSearchInputValue('')
		}
		window.addEventListener(RESET_HOME_SCREEN_EVENT_NAME, handler)
		return () => {
			window.removeEventListener(RESET_HOME_SCREEN_EVENT_NAME, handler)
		}
	}, [])

	// Smart search
	const [smartSearch, setSmartSearch] = useUrlState('smartSearch', false, {
		parse: (value) => value === 'true',
		stringify: (value) => (value ? 'true' : 'false'),
	})

	// Toolbar & footer
	const toolbar = useToolbar()
	const footer = useFooter()

	useEffect(() => {
		toolbar.setTransparent(true)
		toolbar.setHideMiddleNavigation(false)
		toolbar.setShowTitle(true)
	}, [toolbar])

	useEffect(() => {
		footer.setShow(false)
	}, [footer])

	// Quick tag click pre-fills search
	const handleTagClick = useCallback(
		(tag: string) => {
			setSearchInputValue(tag)
			setSearchString(tag)
		},
		[setSearchString]
	)

	const isSearching = !!searchString && searchString.length > 0

	return (
		<>
			{/* Hero Section */}
			<motion.div
				className={styles.hero}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<div className={styles.heroContent}>
					<motion.p
						className={styles.heroLead}
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1, duration: 0.4 }}
					>
						{tHome('hero.lead')}
					</motion.p>

					<motion.h1
						className={styles.heroTitle}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
					>
						{tHome('hero.title')}
					</motion.h1>

					<motion.p
						className={styles.heroSubtitle}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.25, duration: 0.4 }}
					>
						{tHome('hero.subtitle')}
					</motion.p>

					<motion.div
						style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.4 }}
					>
						<HomeSearchBar
							value={searchInputValue}
							onChange={onSearchValueChange}
							smartSearch={smartSearch ?? false}
							onSmartSearchChange={setSmartSearch}
						/>
					</motion.div>

					<QuickSearchTags onTagClick={handleTagClick} />
				</div>
			</motion.div>

			{/* Search Results (shown when searching) */}
			{isSearching && (
				<div className={styles.searchResults}>
					<div className={styles.searchResultsInner}>
						<SearchedSongsList
							searchString={searchString}
							useSmartSearch={smartSearch ?? false}
						/>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className={styles.content}>
				<div className={styles.contentInner}>
					<SongIdeasSection />
					<RecentlyAddedSection />
					<BrowseAllBanner />
				</div>
			</div>

			{/* Floating Add Button */}
			{!isMobile ? (
				<FloatingAddButton extended />
			) : (
				<ParseAdminOption />
			)}
		</>
	)
}
