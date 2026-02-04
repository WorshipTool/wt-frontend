import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { NewsHighlightWrapper } from '@/common/providers/News'
import { Box, IconButton, useTheme } from '@/common/ui'
import { InputBase, Paper, List, ListItem, ListItemText } from '@/common/ui/mui'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import useSongSearch from '@/hooks/song/useSongSearch'
import { SearchKey } from '@/types/song/search.types'
import { AutoAwesome } from '@mui/icons-material'
import SearchIcon from '@mui/icons-material/Search'
import { styled } from '@mui/system'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

const SearchContainer = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.grey[100],
	padding: '0.5rem',
	paddingLeft: '0.8rem',
	paddingRight: '0.8rem',
	borderRadius: '0.5rem',
	display: 'flex',

	justifyContent: 'center',
	alignItems: 'center',
}))
const SearchInput = styled(InputBase)(({ theme }) => ({
	flex: 1,
	marginLeft: '0.5em',
	zIndex: 100,
}))

type MainSearchInputProps = {
	gradientBorder: boolean
	value: string
	onChange: (value: string) => void
	smartSearch?: boolean
	onSmartSearchChange?: (value: boolean) => void
}

export const MAIN_SEARCH_EVENT_NAME = 'search_event_5jh14'

export default function MainSearchInput(props: MainSearchInputProps) {
	const theme = useTheme()
	const t = useTranslations('search')
	const inputRef = useRef<HTMLInputElement>()
	const containerRef = useRef<HTMLDivElement>(null)

	const [earlyFocused, setEarlyFocused] = useState(false)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [suggestions, setSuggestions] = useState<Array<{ title: string; hex: string }>>([])
	const [loadingSuggestions, setLoadingSuggestions] = useState(false)

	const searchSongs = useSongSearch()

	useChangeDelayer(
		earlyFocused,
		() => {
			setEarlyFocused(false)
		},
		[],
		1500
	)

	// Fetch autocomplete suggestions
	useChangeDelayer(
		props.value,
		async (searchValue) => {
			if (!searchValue || searchValue.length < 2) {
				setSuggestions([])
				setShowSuggestions(false)
				return
			}

			setLoadingSuggestions(true)
			try {
				const results = await searchSongs(searchValue as SearchKey, {
					page: 0,
					useSmartSearch: props.smartSearch,
				})

				const topSuggestions = results.slice(0, 5).map((song) => ({
					title: song.name || 'Untitled',
					hex: song.hex || '',
				}))

				setSuggestions(topSuggestions)
				setShowSuggestions(topSuggestions.length > 0)
			} catch (error) {
				console.error('Error fetching suggestions:', error)
				setSuggestions([])
			} finally {
				setLoadingSuggestions(false)
			}
		},
		[searchSongs, props.smartSearch],
		400
	)

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setShowSuggestions(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	useEffect(() => {
		// This function is called only if its called from home page
		const handler = () => {
			setTimeout(() => {
				window.scrollTo({
					top: 90,
					behavior: 'smooth',
				})
				inputRef.current?.focus()
				setEarlyFocused(true)
			}, 200)
		}
		window.addEventListener(MAIN_SEARCH_EVENT_NAME, handler)
		return () => {
			window.removeEventListener(MAIN_SEARCH_EVENT_NAME, handler)
		}
	}, [])

	const showSmartSearch = useFlag('enable_smart_search')

	return (
		<div
			ref={containerRef}
			data-testid="main-search-container"
			style={{
				background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
				boxShadow: `0px 3px 4px ${theme.palette.grey[500]}`,
				width: '100%',
				borderRadius: '0.6rem',
				padding: props.gradientBorder ? 2 : 0,
				transform: earlyFocused ? 'scale(107%)' : '',
				transition: 'all 0.3s ease',
				pointerEvents: 'auto',
				position: 'relative',
			}}
		>
			<SearchContainer>
				<SearchIcon />
				<SearchInput
					placeholder={t('searchByTitleOrText')}
					onChange={(e) => props.onChange(e.target.value)}
					autoFocus
					value={props.value}
					inputRef={inputRef}
					inputProps={{ 'data-testid': 'main-search-input' }}
					onFocus={() => {
						if (suggestions.length > 0) {
							setShowSuggestions(true)
						}
					}}
				></SearchInput>

				{showSmartSearch && (
					<NewsHighlightWrapper
						targetComponent="smart-search-toggle"
						tooltipPlacement="right"
					>
						<IconButton
							color={props.smartSearch ? 'primary.main' : 'grey.400'}
							size="small"
							onClick={() => {
								const newValue = !props.smartSearch
								props.onSmartSearchChange?.(newValue)
								Analytics.track('SMART_SEARCH_TOGGLE', {
									enabled: newValue,
								})
							}}
						>
							<AutoAwesome fontSize="small" />
						</IconButton>
					</NewsHighlightWrapper>
				)}
			</SearchContainer>

			{showSuggestions && suggestions.length > 0 && (
				<Paper
					elevation={3}
					sx={{
						position: 'absolute',
						top: '100%',
						left: props.gradientBorder ? 2 : 0,
						right: props.gradientBorder ? 2 : 0,
						marginTop: '4px',
						zIndex: 1000,
						maxHeight: '300px',
						overflowY: 'auto',
					}}
				>
					<List dense>
						{suggestions.map((suggestion, index) => (
							<ListItem
								key={`${suggestion.hex}-${index}`}
								button
								onClick={() => {
									props.onChange(suggestion.title)
									setShowSuggestions(false)
								}}
								sx={{
									'&:hover': {
										backgroundColor: theme.palette.grey[200],
									},
								}}
							>
								<ListItemText
									primary={suggestion.title}
									primaryTypographyProps={{
										style: { fontSize: '0.9rem' },
									}}
								/>
							</ListItem>
						))}
					</List>
				</Paper>
			)}
		</div>
	)
}
