'use client'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { SearchBar } from '@/common/ui/SearchBar'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { ReactNode, useEffect, useState } from 'react'

/**
 * The search field on a page: the bar, plus the two things a page needs around
 * it — a pause before the query is run (`useChangeDelayer`) and the smart-search
 * flag. Pass `children` to render your own field and take only the plumbing.
 *
 * It used to carry a third copy of the bar's styles, which nothing rendered:
 * the component returns `SearchBar`, and the copy sat above it going stale.
 */
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
