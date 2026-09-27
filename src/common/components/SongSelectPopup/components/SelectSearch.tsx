import { SearchBar } from '@/common/ui/SearchBar'
import { useTranslations } from 'next-intl'

type SelectSearchProps = {
	value?: string
	onChange?: (value: string) => void
}

/**
 * The song picker's search, in the popup's heading row beside its title.
 *
 * It used to be a `TextField` with its own stylesheet, right-aligned text and
 * the magnifier trailing the field instead of leading it — the one search in
 * the app that read backwards. It is the app's `SearchBar` now; only the width
 * is this screen's own, so the heading keeps room for its title.
 */
export const SelectSearch = (props: SelectSearchProps) => {
	const t = useTranslations('search')

	return (
		<SearchBar
			value={props.value}
			onChange={props.onChange}
			placeholder={t('searchSong')}
			autoFocus
			sx={{ flex: 1, maxWidth: 320 }}
		/>
	)
}
