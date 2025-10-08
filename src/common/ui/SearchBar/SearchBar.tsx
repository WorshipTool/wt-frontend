'use client'

import { IconButton } from '@/common/ui/IconButton'
import { AutoAwesome } from '@mui/icons-material'
import SearchIcon from '@mui/icons-material/Search'
import { Box, InputBase, SxProps, styled } from '@mui/material'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import OnChangeDelayer from '../../providers/ChangeDelayer/ChangeDelayer'

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
}

export function SearchBar({ value, onChange, sx, ...props }: SearchBarProps) {
	const t = useTranslations('search')
	const inputRef = useRef()

	const onChangeHandler = (e: any) => {
		onChange?.(e.target.value)
		setEarlyFocused(false)
	}

	const onChangeCallback = () => {
		setEarlyFocused(false)
	}

	const [earlyFocused, setEarlyFocused] = useState(false)

	useEffect(() => {
		const onSearchBarFocus = () => {
			// wait for animation to finish
			setEarlyFocused(true)
			setTimeout(() => {
				// @ts-ignore
				inputRef.current?.focus()
			}, 200)
		}
		window?.addEventListener('searchBarFocus', onSearchBarFocus)
		return () => {
			window?.removeEventListener('searchBarFocus', onSearchBarFocus)
		}
	}, [])
	return (
		<SearchContainer
			sx={{
				...(earlyFocused
					? {
							boxShadow: `0px 2px 8px #00000055`,
							transform: 'scale(107%)',
					  }
					: {}),
				...sx,
			}}
		>
			<OnChangeDelayer
				value={earlyFocused}
				onChange={onChangeCallback}
				delay={1500}
			/>
			<SearchIcon />
			<SearchInput
				placeholder={t('searchByTitleOrText')}
				autoFocus={!isMobile}
				value={value}
				onChange={onChangeHandler}
				inputRef={inputRef}
				sx={{}}
			></SearchInput>

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
