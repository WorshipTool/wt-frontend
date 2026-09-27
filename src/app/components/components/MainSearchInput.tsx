import { SearchBar } from '@/common/ui/SearchBar'
import { useTranslations } from 'next-intl'
import { Ref, useEffect, useRef } from 'react'

type MainSearchInputProps = {
	gradientBorder: boolean
	value: string
	onChange: (value: string) => void
	/** Enter, i.e. "go now" — the field does not wait out its pause then. */
	onSubmit?: () => void
	autoFocus?: boolean
	/** The bar itself, for the screen that has to say where it stood: the catalog
	 * flies its own field in from here (see searchHandoff). */
	containerRef?: Ref<HTMLDivElement>
}

/**
 * The home hero's search field — the app's front door, and a door is all it is:
 * what you type here opens the catalog, which is the one screen that shows
 * results (see /pisne). Home used to answer searches itself, which is why the
 * songs list had none and why the page needed a whole second mode.
 *
 * The field is the app's one `SearchBar`; this adds only what is the hero's
 * own — the gradient frame and the focus-on-arrival. It used to carry a copy of
 * the bar's styles instead, which is how home and the catalog came to look
 * different while flying into one another.
 */
export default function MainSearchInput(props: MainSearchInputProps) {
	const t = useTranslations('search')
	const inputRef = useRef<HTMLInputElement>(null)

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
		<SearchBar
			value={props.value}
			onChange={props.onChange}
			onSubmit={props.onSubmit}
			placeholder={t('searchByTitleOrText')}
			highlighted={props.gradientBorder}
			autoFocus={false}
			inputRef={inputRef}
			containerRef={props.containerRef}
			testId="main-search-container"
			inputTestId="main-search-input"
			sx={{ width: '100%' }}
		/>
	)
}
