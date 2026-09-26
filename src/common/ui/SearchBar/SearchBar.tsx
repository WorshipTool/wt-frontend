'use client'

import { IconButton } from '@/common/ui/IconButton'
import { AutoAwesome, CloseRounded } from '@mui/icons-material'
import SearchIcon from '@mui/icons-material/Search'
import { Box, InputBase, SxProps, styled } from '@mui/material'
import { useTranslations } from 'next-intl'
import { MutableRefObject, Ref, useCallback, useRef } from 'react'
import { isMobile } from '@/tech/device.tech'

const SearchContainer = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.grey[100],
	padding: '0.5rem',
	paddingLeft: '0.8rem',
	paddingRight: '0.8rem',
	borderRadius: '0.5rem',
	display: 'flex',

	justifyContent: 'center',
	alignItems: 'center',
	boxShadow: '1px 4px 4px #00000022',
	transition: 'all ease 0.2s',
}))
const SearchInput = styled(InputBase)(({ theme }) => ({
	flex: 1,
	marginLeft: '0.5em',
}))

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
	/** Shows a clear control while there is something to clear. */
	onClear?: () => void
	/** Test id put on the input itself (the e2e search journey looks for one). */
	inputTestId?: string
}

export function SearchBar({
	value,
	onChange,
	sx,
	placeholder,
	autoFocus,
	inputRef: forwardedRef,
	onClear,
	inputTestId,
	...props
}: SearchBarProps) {
	const t = useTranslations('search')
	const inputRef = useRef<HTMLInputElement>()

	const setInputRef = useCallback(
		(node: HTMLInputElement | null) => {
			inputRef.current = node ?? undefined
			if (typeof forwardedRef === 'function') forwardedRef(node)
			else if (forwardedRef)
				(forwardedRef as MutableRefObject<HTMLInputElement | null>).current = node
		},
		[forwardedRef]
	)

	const onChangeHandler = (e: any) => {
		onChange?.(e.target.value)
	}

	// A `searchBarFocus` window event used to focus and flash this bar. Nothing
	// has dispatched it since search stopped being a layer over the home screen;
	// a screen that wants the caret here passes `inputRef` and asks for it.
	return (
		<SearchContainer sx={sx}>
			<SearchIcon />
			<SearchInput
				placeholder={placeholder ?? t('searchByTitleOrText')}
				autoFocus={autoFocus ?? !isMobile}
				value={value}
				onChange={onChangeHandler}
				inputRef={setInputRef}
				inputProps={inputTestId ? { 'data-testid': inputTestId } : undefined}
				sx={{}}
			></SearchInput>

			{onClear && value !== '' && value !== undefined && (
				<IconButton
					color="grey.500"
					size="small"
					onClick={() => {
						onClear()
						inputRef.current?.focus()
					}}
				>
					<CloseRounded fontSize="small" />
				</IconButton>
			)}

			{props.showSmartSearch && (
				<>
					<IconButton
						color={props.useSmartSearch ? 'primary.main' : 'grey.400'}
						size="small"
						onClick={() => {
							props.onSmartSearchChange?.(!props.useSmartSearch)
						}}
					>
						<AutoAwesome fontSize="small" />
					</IconButton>
				</>
			)}
		</SearchContainer>
	)
}
