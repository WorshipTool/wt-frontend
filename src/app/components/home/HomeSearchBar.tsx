'use client'

import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { NewsHighlightWrapper } from '@/common/providers/News'
import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import SearchIcon from '@mui/icons-material/Search'
import { AutoAwesome } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import styles from './HomeDesktop.module.css'

export const MAIN_SEARCH_HOME_EVENT = 'search_event_home_focus'

type HomeSearchBarProps = {
	value: string
	onChange: (value: string) => void
	smartSearch?: boolean
	onSmartSearchChange?: (value: boolean) => void
}

export default function HomeSearchBar({
	value,
	onChange,
	smartSearch,
	onSmartSearchChange,
}: HomeSearchBarProps) {
	const t = useTranslations('search')
	const inputRef = useRef<HTMLInputElement>(null)
	const showSmartSearch = useFlag('enable_smart_search')

	const [earlyFocused, setEarlyFocused] = useState(false)
	useChangeDelayer(
		earlyFocused,
		() => {
			setEarlyFocused(false)
		},
		[],
		1500
	)

	useEffect(() => {
		const handler = () => {
			setTimeout(() => {
				inputRef.current?.focus()
				setEarlyFocused(true)
			}, 200)
		}
		window.addEventListener(MAIN_SEARCH_HOME_EVENT, handler)
		return () => {
			window.removeEventListener(MAIN_SEARCH_HOME_EVENT, handler)
		}
	}, [])

	return (
		<div className={styles.searchWrapper}>
			<div className={styles.searchContainer} data-testid="home-search-container">
				<SearchIcon className={styles.searchIcon} fontSize="small" />
				<input
					ref={inputRef}
					className={styles.searchInput}
					placeholder={t('searchByTitleOrText')}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					autoFocus
					data-testid="home-search-input"
				/>
				{showSmartSearch && (
					<NewsHighlightWrapper
						targetComponent="smart-search-toggle"
						tooltipPlacement="right"
					>
						<button
							className={`${styles.smartSearchBtn} ${
								smartSearch
									? styles.smartSearchActive
									: styles.smartSearchInactive
							}`}
							onClick={() => {
								const newValue = !smartSearch
								onSmartSearchChange?.(newValue)
								Analytics.track('SMART_SEARCH_TOGGLE', {
									enabled: newValue,
								})
							}}
							type="button"
							aria-label="Smart search"
						>
							<AutoAwesome fontSize="small" />
						</button>
					</NewsHighlightWrapper>
				)}
			</div>
		</div>
	)
}
