'use client'

import { Box } from '@/common/ui/Box'
import { IconButton } from '@/common/ui/IconButton'
import { MOBILE_NAV_BREAKPOINT } from '@/common/components/MobileAppTabBar/nav.constants'
import { TOUCH_TARGET } from '@/common/constants/layout'
import { InputBase, SxProps, Theme } from '@/common/ui/mui'
import { useTheme } from '@/common/ui/tech'
import { isMobile } from '@/tech/device.tech'
import { AutoAwesome, CloseRounded, SearchRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import {
	KeyboardEvent,
	MutableRefObject,
	Ref,
	useCallback,
	useRef,
} from 'react'

/**
 * The app's search field. There is one, and this is it.
 *
 * It used to be four: this bar, a copy of it in the home hero, a second copy in
 * `SongSearchBarBase` that nothing rendered, and a hand-rolled box of `<input>`
 * on the phone's home screen. Home's field and the catalog's are the same field
 * as far as the reader is concerned — the one flies into the other across the
 * navigation (see MOBILE.md, "the field travels; it is never two fields") — so
 * a trip that changed the field's colour, radius and shadow halfway was the
 * clearest sign the copies had drifted.
 *
 * One shape on both widths — hairline, radius, shadow — and one fill each. A
 * phone's field is paper: it stands on the grey app canvas and inside white
 * surfaces alike, and a filled one disappears into the second. A desktop keeps
 * the grey it has always had, which is the fill the hero's gradient frame was
 * drawn around. The hero wears that frame (`highlighted`); nothing else does.
 */

/** Where the fill changes — the width at which the desktop layout appears. */
const DESKTOP = MOBILE_NAV_BREAKPOINT

/** The resting shape: a hairline and just enough shadow to lift it. */
const fieldSx = (theme: Theme) =>
	({
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 1.5,
		bgcolor: 'background.paper',
		[theme.breakpoints.up(DESKTOP)]: { bgcolor: 'grey.100' },
		border: '1px solid',
		borderColor: 'grey.300',
		borderRadius: 2.5,
		paddingX: 2,
		paddingY: 1.5,
		boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
		transition: 'border-color 0.15s ease',
		'&:focus-within': { borderColor: 'grey.400' },
	} as const)

/**
 * A thumb's worth of target for the buttons inside the field, on a phone only —
 * a mouse does the pointing on a desktop, and the field is the same height on
 * both. The extra height is handed straight back with a negative margin, so
 * what grows is the area a thumb can land on, not the field around it.
 */
const inFieldButtonSx = (theme: Theme) =>
	({
		[theme.breakpoints.down(DESKTOP)]: {
			// the house IconButton puts `sx` on the box around the button, so the
			// size is asked for by name and the box hands the extra back
			marginY: '-6px',
			'& .MuiIconButton-root': {
				width: TOUCH_TARGET,
				height: TOUCH_TARGET,
			},
		},
	} as const)

/** The gradient frame the home hero wears, and the padding that reveals it. */
const HIGHLIGHT_PADDING = 2

interface SearchBarProps {
	value?: string
	onChange?: (value: string) => void
	sx?: SxProps
	useSmartSearch?: boolean
	onSmartSearchChange?: (value: boolean) => void
	showSmartSearch?: boolean
	/** Placeholder override; defaults to the long "title or lyrics" hint. */
	placeholder?: string
	/** Focus on mount. Defaults to desktop-only, as this bar always has. */
	autoFocus?: boolean
	/** The field itself, for a screen that focuses the bar on its own (the
	 * catalog does it when navigation asks for search). The bar keeps its own
	 * reference either way, so both get the node. */
	inputRef?: Ref<HTMLInputElement>
	/** The bar's own box, for a screen that has to say where it stood — the
	 * catalog flies its field in from home's (see searchHandoff). */
	containerRef?: Ref<HTMLDivElement>
	/** Shows a clear control while there is something to clear. */
	onClear?: () => void
	/** Enter, i.e. "go now" — for a field that otherwise waits out a pause. */
	onSubmit?: () => void
	onFocus?: () => void
	/** The brand gradient around the field. The home hero, and only it. */
	highlighted?: boolean
	/** Test id put on the input itself (the e2e search journey looks for one). */
	inputTestId?: string
	/** Test id on the bar's box (what the hand-off measures). */
	testId?: string
}

export function SearchBar({
	value,
	onChange,
	sx,
	placeholder,
	autoFocus,
	inputRef: forwardedRef,
	containerRef,
	onClear,
	onSubmit,
	onFocus,
	highlighted,
	inputTestId,
	testId,
	...props
}: SearchBarProps) {
	const t = useTranslations('search')
	const theme = useTheme()
	const inputRef = useRef<HTMLInputElement>()

	const setInputRef = useCallback(
		(node: HTMLInputElement | null) => {
			inputRef.current = node ?? undefined
			if (typeof forwardedRef === 'function') forwardedRef(node)
			else if (forwardedRef)
				(forwardedRef as MutableRefObject<HTMLInputElement | null>).current =
					node
		},
		[forwardedRef]
	)

	const field = (
		<Box sx={fieldSx(theme)}>
			<SearchRounded sx={{ color: 'grey.500' }} />
			<InputBase
				placeholder={placeholder ?? t('searchByTitleOrText')}
				autoFocus={autoFocus ?? !isMobile}
				value={value}
				onChange={(e) => onChange?.(e.target.value)}
				onFocus={onFocus}
				onKeyDown={(e: KeyboardEvent) => {
					if (e.key !== 'Enter' || !onSubmit) return
					e.preventDefault()
					onSubmit()
				}}
				inputRef={setInputRef}
				inputProps={{
					enterKeyHint: 'search',
					...(inputTestId ? { 'data-testid': inputTestId } : {}),
				}}
				sx={{
					flex: 1,
					minWidth: 0,
					fontSize: '1rem',
					color: 'grey.900',
					'& input::placeholder': { color: 'grey.600', opacity: 1 },
				}}
			/>

			{onClear && value !== '' && value !== undefined && (
				<IconButton
					color="grey.500"
					size="small"
					sx={inFieldButtonSx(theme)}
					onClick={() => {
						onClear()
						inputRef.current?.focus()
					}}
				>
					<CloseRounded fontSize="small" />
				</IconButton>
			)}

			{props.showSmartSearch && (
				<IconButton
					color={props.useSmartSearch ? 'primary.main' : 'grey.400'}
					size="small"
					sx={inFieldButtonSx(theme)}
					onClick={() => props.onSmartSearchChange?.(!props.useSmartSearch)}
				>
					<AutoAwesome fontSize="small" />
				</IconButton>
			)}
		</Box>
	)

	// `sx` lands here, on the box the bar stands in: it says where the bar goes —
	// width, flex, margins — and never what it looks like, which is the whole
	// point of there being one of these.
	return (
		<Box
			ref={containerRef}
			data-testid={testId}
			sx={{
				...(highlighted && {
					background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
					borderRadius: 3,
					padding: `${HIGHLIGHT_PADDING}px`,
				}),
				...(sx as object),
			}}
		>
			{field}
		</Box>
	)
}
