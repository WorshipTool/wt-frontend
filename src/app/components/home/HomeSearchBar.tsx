'use client'

import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { NewsHighlightWrapper } from '@/common/providers/News'
import { Box, IconButton } from '@/common/ui'
import { InputBase } from '@/common/ui/mui'
import { AutoAwesome } from '@mui/icons-material'
import SearchIcon from '@mui/icons-material/Search'
import { styled } from '@mui/system'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

export const HOME_SEARCH_EVENT_NAME = 'home_search_focus_event'

const SearchWrapper = styled(Box)({
	position: 'relative',
	width: '100%',
	maxWidth: 640,
})

const SearchInputContainer = styled(Box)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	backgroundColor: 'rgba(255, 255, 255, 0.95)',
	backdropFilter: 'blur(12px)',
	borderRadius: '16px',
	padding: '6px 8px 6px 20px',
	boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
	border: '1px solid rgba(0, 0, 0, 0.06)',
	transition: 'box-shadow 0.3s ease, border-color 0.3s ease, transform 0.2s ease',
	'&:focus-within': {
		boxShadow: `0 4px 32px rgba(0, 133, 255, 0.15), 0 1px 2px rgba(0, 0, 0, 0.04)`,
		borderColor: 'rgba(0, 133, 255, 0.3)',
		transform: 'translateY(-1px)',
	},
}))

const StyledInput = styled(InputBase)({
	flex: 1,
	fontSize: '1.05rem',
	fontWeight: 400,
	letterSpacing: '-0.01em',
	'& .MuiInputBase-input': {
		padding: '10px 0',
	},
	'& .MuiInputBase-input::placeholder': {
		opacity: 0.5,
	},
})

const SearchButton = styled(Box)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: theme.palette.primary.main,
	borderRadius: '12px',
	padding: '10px 16px',
	cursor: 'pointer',
	transition: 'background-color 0.2s ease, transform 0.15s ease',
	'&:hover': {
		backgroundColor: theme.palette.primary.dark,
		transform: 'scale(1.03)',
	},
}))

type HomeSearchBarProps = {
	value: string
	onChange: (value: string) => void
	smartSearch?: boolean
	onSmartSearchChange?: (value: boolean) => void
	variant?: 'hero' | 'compact'
}

export default function HomeSearchBar({
	value,
	onChange,
	smartSearch,
	onSmartSearchChange,
	variant = 'hero',
}: HomeSearchBarProps) {
	const t = useTranslations('search')
	const inputRef = useRef<HTMLInputElement>(null)
	const [isFocused, setIsFocused] = useState(false)

	useEffect(() => {
		const handler = () => {
			setTimeout(() => {
				inputRef.current?.focus()
				setIsFocused(true)
			}, 200)
		}
		window.addEventListener(HOME_SEARCH_EVENT_NAME, handler)
		return () => {
			window.removeEventListener(HOME_SEARCH_EVENT_NAME, handler)
		}
	}, [])

	const showSmartSearch = useFlag('enable_smart_search')

	return (
		<SearchWrapper data-testid="home-search-container">
			<SearchInputContainer>
				<StyledInput
					placeholder={t('searchByTitleOrText')}
					onChange={(e) => onChange(e.target.value)}
					autoFocus={variant === 'hero'}
					value={value}
					inputRef={inputRef}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					inputProps={{ 'data-testid': 'home-search-input' }}
				/>

				{showSmartSearch && (
					<NewsHighlightWrapper
						targetComponent="smart-search-toggle"
						tooltipPlacement="right"
					>
						<IconButton
							color={smartSearch ? 'primary.main' : 'grey.400'}
							size="small"
							onClick={() => {
								const newValue = !smartSearch
								onSmartSearchChange?.(newValue)
								Analytics.track('SMART_SEARCH_TOGGLE', {
									enabled: newValue,
								})
							}}
							sx={{ mr: 0.5 }}
						>
							<AutoAwesome fontSize="small" />
						</IconButton>
					</NewsHighlightWrapper>
				)}

				<SearchButton>
					<SearchIcon sx={{ color: '#fff', fontSize: '1.3rem' }} />
				</SearchButton>
			</SearchInputContainer>
		</SearchWrapper>
	)
}
