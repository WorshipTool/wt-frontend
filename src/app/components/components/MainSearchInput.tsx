import { Box, useTheme } from '@/common/ui'
import { InputBase } from '@/common/ui/mui'
import SearchIcon from '@mui/icons-material/Search'
import { styled } from '@mui/system'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'

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
	/** Enter, i.e. "go now" — the field does not wait out its pause then. */
	onSubmit?: () => void
	autoFocus?: boolean
}

/**
 * The home hero's search field — the app's front door, and a door is all it is:
 * what you type here opens the catalog, which is the one screen that shows
 * results (see /pisne). Home used to answer searches itself, which is why the
 * songs list had none and why the page needed a whole second mode.
 */
export default function MainSearchInput(props: MainSearchInputProps) {
	const theme = useTheme()
	const t = useTranslations('search')
	const inputRef = useRef<HTMLInputElement>()

	// Focus via effect instead of the DOM autofocus attribute: the first
	// hydration render always mounts the desktop layout, so on phones the
	// attribute would briefly grab focus (and pop the keyboard) before the
	// phone layout replaces it. 700px = the phone breakpoint in HomeDesktop.
	useEffect(() => {
		if (!(props.autoFocus ?? true)) return
		if (!window.matchMedia('(min-width: 700px)').matches) return
		inputRef.current?.focus()
	}, [])

	return (
		<div
			data-testid="main-search-container"
			style={{
				background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
				boxShadow: `0px 3px 4px ${theme.palette.grey[500]}`,
				width: '100%',
				borderRadius: '0.6rem',
				padding: props.gradientBorder ? 2 : 0,
				transition: 'all 0.3s ease',
				pointerEvents: 'auto',
			}}
		>
			<SearchContainer>
				<SearchIcon />
				<SearchInput
					placeholder={t('searchByTitleOrText')}
					onChange={(e) => props.onChange(e.target.value)}
					onKeyDown={(e: React.KeyboardEvent) => {
						if (e.key !== 'Enter') return
						e.preventDefault()
						props.onSubmit?.()
					}}
					value={props.value}
					inputRef={inputRef}
					inputProps={{ 'data-testid': 'main-search-input' }}
				></SearchInput>
			</SearchContainer>
		</div>
	)
}
