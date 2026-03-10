'use client'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { Box } from '@/common/ui'
import { InputBase } from '@/common/ui/mui'
import { SearchBar } from '@/common/ui/SearchBar/SearchBar'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { styled } from '@mui/system'
import { ReactNode, useEffect, useState } from 'react'

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
	children?: (
		value: string,
		onValueChange: (v: string) => void,
		aiEnabled: boolean
	) => ReactNode
	onSearchStringChange?: (value: string) => void
	onSmartSearchChange?: (value: boolean) => void
	startSearchString?: string
}

export default function SongSearchBarBase(props: MainSearchInputProps) {
	const [searchString, setSearchString] = useState(
		props.startSearchString || ''
	)
	const [inputValue, setInputValue] = useState(searchString)

	useChangeDelayer(
		inputValue,
		(value) => {
			if (value !== '') {
				props.onSearchStringChange?.(value)
			}
		},
		[]
	)

	const showSmartSearch = useFlag('enable_smart_search')
	const [useSmartSearch, setUseSmartSearch] = useState(false)
	useEffect(() => {
		props.onSmartSearchChange?.(useSmartSearch)
	}, [useSmartSearch, props.onSmartSearchChange])

	return (
		props.children?.(inputValue, setInputValue, showSmartSearch) || (
			<SearchBar
				value={inputValue}
				onChange={setInputValue}
				showSmartSearch={showSmartSearch}
				useSmartSearch={useSmartSearch}
				onSmartSearchChange={setUseSmartSearch}
			/>
		)
	)
}
