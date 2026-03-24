import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { NewsHighlightWrapper } from '@/common/providers/News'
import { Box, IconButton, useTheme } from '@/common/ui'
import { InputBase } from '@/common/ui/mui'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { AutoAwesome } from '@mui/icons-material'
import SearchIcon from '@mui/icons-material/Search'
import { styled } from '@mui/system'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

const SearchContainer = styled(Box)(({ theme }) => ({
	backgroundColor: 'rgba(255, 255, 255, 0.95)',
	backdropFilter: 'blur(12px)',
	padding: '0.65rem 1rem',
	borderRadius: '16px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	transition: 'box-shadow 0.3s ease, background-color 0.3s ease',
	'&:focus-within': {
		backgroundColor: 'rgba(255, 255, 255, 1)',
		boxShadow: '0 4px 24px rgba(0, 133, 255, 0.12)',
	},
}))

const SearchInput = styled(InputBase)(({ theme }) => ({
	flex: 1,
	marginLeft: '0.6em',
	zIndex: 100,
	fontSize: '1.05rem',
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
			data-testid="main-search-container"
			style={{
				background: props.gradientBorder
					? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
					: 'transparent',
				boxShadow: props.gradientBorder
					? '0 4px 24px rgba(0, 133, 255, 0.15)'
					: '0 2px 16px rgba(0, 0, 0, 0.08)',
				width: '100%',
				borderRadius: '18px',
				padding: props.gradientBorder ? 2.5 : 0,
				transform: earlyFocused ? 'scale(1.03)' : '',
				transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				pointerEvents: 'auto',
			}}
		>
			<SearchContainer>
				<SearchIcon
					sx={{
						color: theme.palette.grey[400],
						fontSize: '1.4rem',
					}}
				/>
				<SearchInput
					placeholder={t('searchByTitleOrText')}
					onChange={(e) => props.onChange(e.target.value)}
					autoFocus
					value={props.value}
					inputRef={inputRef}
					inputProps={{ 'data-testid': 'main-search-input' }}
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
							sx={{
								transition: 'all 0.2s ease',
								'&:hover': {
									backgroundColor: 'rgba(0, 133, 255, 0.08)',
								},
							}}
						>
							<AutoAwesome fontSize="small" />
						</IconButton>
					</NewsHighlightWrapper>
				)}
			</SearchContainer>
		</div>
	)
}
