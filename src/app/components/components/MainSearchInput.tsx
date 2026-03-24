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

const SearchContainer = styled(Box)(() => ({
	backgroundColor: 'rgba(10, 10, 15, 0.9)',
	backdropFilter: 'blur(20px)',
	padding: '0.8rem 1.2rem',
	borderRadius: '4px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	border: '1px solid rgba(0, 229, 255, 0.2)',
	transition: 'all 0.35s ease',
	position: 'relative' as const,
	overflow: 'hidden',
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: '-30%',
		width: '20%',
		height: '100%',
		background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.15), transparent)',
		animation: 'scanner-line 3s ease-in-out infinite',
	},
	'&:focus-within': {
		borderColor: 'rgba(0, 229, 255, 0.6)',
		boxShadow: '0 0 20px rgba(0, 229, 255, 0.2), 0 0 40px rgba(123, 47, 255, 0.1), inset 0 0 20px rgba(0, 229, 255, 0.05)',
	},
}))

const SearchInput = styled(InputBase)(() => ({
	flex: 1,
	marginLeft: '0.6em',
	zIndex: 100,
	fontSize: '1.1rem',
	fontWeight: 400,
	letterSpacing: '0.05em',
	fontFamily: 'var(--font-jetbrains), monospace',
	color: '#e8e8ff',
	'& .MuiInputBase-input::placeholder': {
		color: '#4a4a6a',
		opacity: 1,
	},
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
					? 'linear-gradient(135deg, #00e5ff, #7b2fff, #ff00e5, #00e5ff)'
					: 'transparent',
				backgroundSize: '300% 300%',
				animation: props.gradientBorder ? 'border-dance 4s ease infinite' : 'none',
				boxShadow: props.gradientBorder
					? '0 0 30px rgba(0, 229, 255, 0.25), 0 0 60px rgba(123, 47, 255, 0.15)'
					: '0 4px 20px rgba(0, 0, 0, 0.3)',
				width: '100%',
				borderRadius: '6px',
				padding: props.gradientBorder ? 2 : 0,
				transform: earlyFocused ? 'scale(1.03)' : '',
				transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
				pointerEvents: 'auto',
			}}
		>
			<SearchContainer>
				<SearchIcon
					sx={{
						color: '#00e5ff',
						fontSize: '1.4rem',
						filter: 'drop-shadow(0 0 4px rgba(0, 229, 255, 0.5))',
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
								color: props.smartSearch ? '#00e5ff' : '#4a4a6a',
								'&:hover': {
									backgroundColor: 'rgba(0, 229, 255, 0.1)',
									boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)',
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
