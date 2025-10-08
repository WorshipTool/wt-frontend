import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { Box, IconButton, useTheme } from '@/common/ui'
import { InputBase } from '@/common/ui/mui'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
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
			style={{
				background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
				boxShadow: `0px 3px 4px ${theme.palette.grey[500]}`,
				width: '100%',
				borderRadius: '0.6rem',
				padding: props.gradientBorder ? 2 : 0,
				transform: earlyFocused ? 'scale(107%)' : '',
				transition: 'all 0.3s ease',
				pointerEvents: 'auto',
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
				></SearchInput>

				{showSmartSearch && (
					<>
						<IconButton
							color={props.smartSearch ? 'primary.main' : 'grey.400'}
							size="small"
							onClick={() => {
								props.onSmartSearchChange?.(!props.smartSearch)
							}}
						>
							<AutoAwesome fontSize="small" />
						</IconButton>
					</>
				)}
			</SearchContainer>
		</div>
	)
}
