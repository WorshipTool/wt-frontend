'use client'
import CatalogPagination from '@/app/(layout)/pisne/components/CatalogPagination'
import ColumnHeading from '@/app/(layout)/pisne/components/ColumnHeading'
import SongSearchResults from '@/app/(layout)/pisne/components/SongSearchResults'
import SongsBrowseDesktop from '@/app/(layout)/pisne/components/SongsBrowseDesktop'
import SongsMobile from '@/app/(layout)/pisne/SongsMobile'
import { consumeSearchFocus } from '@/app/(layout)/pisne/searchHandoff'
import { useBrowseSongs } from '@/app/(layout)/pisne/useBrowseSongs'
import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { useToolbar } from '@/common/components/Toolbar/hooks/useToolbar'
import { useDownSize } from '@/common/hooks/useDownSize'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { NewsHighlightWrapper } from '@/common/providers/News'
import { Box, Button, Typography } from '@/common/ui'
import { GroupRowsSkeleton, ListStateView } from '@/common/ui/GroupList'
import { SearchBar } from '@/common/ui/SearchBar/SearchBar'
import { Container } from '@/common/ui/mui'
import { CloudOffRounded, RefreshRounded } from '@mui/icons-material'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { useApiStateEffect } from '@/tech/ApiState'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApi } from '../../../api/tech-and-hooks/useApi'
import { Gap } from '../../../common/ui/Gap/Gap'
import { useSmartUrlState } from '../../../hooks/urlstate/useUrlState'

/** The centred block the catalog reads in, and nothing at the window's edges.
 * Wide enough that three columns of songs each keep a readable title. */
const BLOCK_WIDTH = 1200
/** The search field once it floats: one control, not a banner. */
const FIELD_WIDTH = 700
/** …and at rest, where it closes the list's heading line: wide enough for a
 * title and the start of a second word, narrow enough that the line still
 * reads as a heading with a control on it. */
const FIELD_WIDTH_RESTING = 340
/**
 * Where the field sits once searching takes over the screen: half into the 56px
 * top bar, which is where the home hero's field used to land when the page
 * scrolled. Above the bar's own z-index (10), since it overlaps it.
 */
const FIELD_TOP_SEARCHING = 22
const FIELD_Z = 11
/** Where the list's first row comes to rest after a page is turned — clear of
 * the top bar, with a little air. */
const LIST_TOP_MARGIN = 72
/** The app's top bar, which the page sits under. */
const TOOLBAR_HEIGHT = 56
/** Air under the floating field, where the flow no longer provides any. The
 * heading line under it is tall (it is the field's own line at rest), so this
 * is less than it looks. */
const RESULTS_TOP_SPACE = 3
/** How long the chrome takes to rearrange — the phone header's own timing. */
const COLLAPSE_MS = 240

/**
 * Writes the query into the URL without touching history, so a search is
 * shareable and survives a reload while typing doesn't stack history entries.
 * Other params (the browse page `?s=`) are left alone — clearing the query
 * returns you to the page you were browsing.
 */
function mirrorQueryInUrl(query: string) {
	const params = new URLSearchParams(window.location.search)
	if (query === '') {
		// Once search has been asked for, the parameter stays — empty while the
		// field is. It is what says this screen is searching rather than browsing,
		// and only navigation (the Písně tab, Back) takes it away again.
		if (!params.has('hledat')) return
		params.set('hledat', '')
	} else params.set('hledat', query)
	const search = params.toString()
	window.history.replaceState(
		{},
		'',
		`${window.location.pathname}${search ? `?${search}` : ''}`
	)
}

export default SmartPage(SongsPage)

/**
 * The song catalog: one screen that both searches and browses.
 *
 * The field is the screen's control rather than a destination of its own —
 * empty, you browse the whole songbook; typed, the same screen shows results.
 * Beside the list is the one panel the screen needs: the order while browsing,
 * the narrowing while searching.
 */
function SongsPage() {
	const t = useTranslations('songsList')
	const tCommon = useTranslations('common')
	const tSearch = useTranslations('search')
	const phone = useIsPhone()

	const [page, setPage] = useSmartUrlState('songsList', 's', {
		parse: (v) => parseInt(v),
		stringify: (v) => (v as number).toString(),
	})

	// `?hledat=` as navigation left it: the Hledat tab, the toolbar, a shared
	// link. Typing mirrors itself in with replaceState, which this hook does not
	// see — deliberately, or every keystroke would re-render the whole shell.
	const searchParams = useSearchParams()
	const urlQuery = searchParams.get('hledat')

	const [value, setValue] = useState(urlQuery ?? '')
	const [query, setQuery] = useState((urlQuery ?? '').trim())

	const fieldRef = useRef<HTMLInputElement>(null)

	// Navigation — a tab, the toolbar, Back — is what moves the screen between
	// browsing and searching. Typing is not navigation, and its replaceState is
	// invisible to the hook above, so this cannot fight the field.
	const lastUrlQuery = useRef(urlQuery)
	useEffect(() => {
		if (urlQuery === lastUrlQuery.current) return
		lastUrlQuery.current = urlQuery
		setValue(urlQuery ?? '')
		setQuery((urlQuery ?? '').trim())
	}, [urlQuery])

	// An empty `?hledat=` is someone asking to search (Hledat, in the tab bar or
	// the toolbar) — so the caret goes in the field, on arrival and on a tap from
	// another tab alike. One that carries a query is a shared or reloaded link,
	// which wants to show its results rather than cover them with a keyboard —
	// unless home is handing the caret over mid-word (see searchHandoff), in
	// which case the field takes it and the caret waits at the end of what was
	// typed, so the next letter lands where the last one did.
	// …in two steps, because the field this focuses may not exist yet. The phone
	// layout is a different tree, and `useIsPhone` is false for the first client
	// render — so on a phone the desktop field mounts, takes the caret, and is
	// then thrown away with it. The intent is recorded here and acted on again
	// when the layout settles.
	const wantsFocusRef = useRef(false)
	useEffect(() => {
		if (urlQuery === null) return
		const handedOver = consumeSearchFocus()
		if (urlQuery === '' || handedOver) wantsFocusRef.current = true
	}, [urlQuery])

	useEffect(() => {
		if (!wantsFocusRef.current) return
		const field = fieldRef.current
		if (!field) return
		wantsFocusRef.current = false
		field.focus()
		const end = field.value.length
		field.setSelectionRange(end, end)
	}, [urlQuery, phone])

	useChangeDelayer(
		value,
		(v) => {
			const next = v.trim()
			setQuery(next)
			mirrorQueryInUrl(next)
		},
		[]
	)

	const clear = useCallback(() => setValue(''), [])

	const showSmartSearch = useFlag('enable_smart_search')
	const [smartSearch, setSmartSearch] = useState(false)

	const { songGettingApi } = useApi()

	const [{ data: count }] = useApiStateEffect(async () =>
		songGettingApi.getListSongCount()
	)

	const isSmall = useDownSize('md')
	const isMiddle = useDownSize('lg')
	// One source of truth for the page size across every width, phones included —
	// the phone list used to carry its own constant while sharing the same `?s=`
	// URL key, so the two disagreed about which songs a given page number meant.
	const countPerPage = phone ? 12 : isSmall ? 8 : isMiddle ? 18 : 30
	// …and the columns they are read in: one page, filled, at every width
	const browseColumns = isSmall ? 1 : isMiddle ? 2 : 3

	// Searching is what the field says, not what the URL says: a tap on Hledat
	// opens the field with the browse list still under it, so you can type or
	// keep browsing.
	const searching = query.length > 0
	// the desktop list; the phone runs the same hook inside its own shell
	const browse = useBrowseSongs(page ?? 1, countPerPage, !phone && !searching)
	const pagesCount = Math.max(1, Math.ceil((count ?? 0) / countPerPage))

	// A page turned from the floating bar is read from its first song, not from
	// wherever in the last page you happened to be standing.
	const listRef = useRef<HTMLDivElement>(null)
	const goToPage = useCallback(
		(next: number) => {
			setPage(next)
			const top = listRef.current?.getBoundingClientRect().top ?? 0
			window.scrollBy({ top: top - LIST_TOP_MARGIN, behavior: 'smooth' })
		},
		[setPage]
	)

	// …while the *chrome* — the field riding up to the top, the phone's title
	// folding away — answers to the URL rather than to the caret. `?hledat` is
	// what says this screen is searching: the Hledat tab and the toolbar set it,
	// and typing mirrors itself into it. Clicking the field and writing nothing
	// is not searching, so the page stays where it is.
	//
	// The typed query counts too, because typing mirrors itself in with
	// replaceState, which `useSearchParams` deliberately does not see.
	const searchMode = searching || urlQuery !== null

	// The top bar's own links sit exactly where the field lands, so they stand
	// down while it is there — as they did on home, which is where this field
	// used to live.
	const { setHideMiddleNavigation } = useToolbar()
	useEffect(() => {
		setHideMiddleNavigation(searchMode)
		return () => setHideMiddleNavigation(false)
	}, [searchMode, setHideMiddleNavigation])

	const field = (
		// the news tutorial for smart search points here — at the field that
		// carries the toggle, which is this screen's now that home has stopped
		// searching (see news.config)
		<NewsHighlightWrapper targetComponent="smart-search-toggle">
			<Box data-testid="main-search-container">
				<SearchBar
					value={value}
					onChange={setValue}
					// White on a desktop, where it sits on the grey canvas and the
					// shadow is what lifts it. The phone keeps the bar's own grey: its
					// header is white already, and a white field on it would vanish.
					sx={phone ? undefined : { bgcolor: 'background.paper' }}
					placeholder={tSearch('searchSongs')}
					// the field takes focus when navigation asks for search, not on
					// every visit to the catalog
					autoFocus={false}
					inputRef={fieldRef}
					inputTestId="main-search-input"
					onClear={clear}
					showSmartSearch={showSmartSearch}
					useSmartSearch={smartSearch}
					onSmartSearchChange={(next) => {
						setSmartSearch(next)
						Analytics.track('SMART_SEARCH_TOGGLE', { enabled: next })
					}}
				/>
			</Box>
		</NewsHighlightWrapper>
	)

	if (phone) {
		return (
			<SongsMobile
				field={field}
				collapseTitle={searchMode}
				query={query}
				smartSearch={smartSearch}
				page={page ?? 1}
				onPageChange={setPage}
				count={count ?? 0}
				perPage={countPerPage}
			/>
		)
	}

	const browseCount = count ?? 0

	const browseBody = browse.error ? (
		<ListStateView
			icon={<CloudOffRounded fontSize="inherit" />}
			message={t('error')}
			action={
				<Button
					variant="outlined"
					onClick={browse.reload}
					startIcon={<RefreshRounded />}
					disableUppercase
				>
					{tCommon('tryAgain')}
				</Button>
			}
		/>
	) : browse.loading && browse.items.length === 0 ? (
		<GroupRowsSkeleton rows={8} withIcon={false} />
	) : (
		// the page you came from stays legible while the next one loads, rather
		// than the list emptying under you
		<Box
			sx={{
				opacity: browse.loading ? 0.45 : 1,
				transition: 'opacity 0.2s ease',
			}}
		>
			<SongsBrowseDesktop items={browse.items} columns={browseColumns} />
		</Box>
	)

	return (
		<Box>
			<Container>
				<Box
					sx={{
						width: '100%',
						maxWidth: BLOCK_WIDTH,
						marginX: 'auto',
						display: 'flex',
						flexDirection: 'column',
						// A screen tall at least, so the floating paginator — which is
						// sticky, and so cannot leave the block it lives in — reaches the
						// bottom of the window even on a page short enough not to scroll.
						// Past the block is the footer, which is where the bar stops: it
						// holds the bottom edge while there is page under it and comes to
						// rest above the footer, without anything measuring the scroll.
						minHeight: `calc(100dvh - ${TOOLBAR_HEIGHT}px)`,
					}}
				>
					<Gap value={4} />

					{/* air under the floating field, where the flow no longer provides any */}
					<Box
						sx={{
							height: searchMode ? RESULTS_TOP_SPACE * 8 : 0,
							transition: `height ${COLLAPSE_MS}ms ease`,
						}}
					/>

					<Box
						ref={listRef}
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 1.5,
							minWidth: 0,
						}}
					>
						<ColumnHeading
							label={searching ? t('results') : t('allSongs')}
							meta={
								!searching && (
									<Typography small color="grey.600">
										{t('songCount', {
											count: browseCount,
											// the reader's own thousands separator: the app pins
											// next-intl to one locale for all three brands, so ICU's
											// own number format would write 2,057 to a Czech reader
											formatted: browseCount.toLocaleString(),
										})}
									</Typography>
								)
							}
						>
							{/* One wrapper that moves, never two that swap, and never a
								    different parent: rebuilding the input would drop the caret
								    the moment you touched it. At rest the field closes the
								    list's own heading line, over the rows it searches. Searching
								    takes it out of the flow, to rest half in the top bar whose
								    links have stood down for it. */}
							<Box
								sx={
									searchMode
										? {
												position: 'fixed',
												top: FIELD_TOP_SEARCHING,
												left: 0,
												right: 0,
												zIndex: FIELD_Z,
												display: 'flex',
												justifyContent: 'center',
												paddingX: 2,
												// the strip is as wide as the window, the field is not, and
												// the top bar is under the rest of it — its logo and account
												// button have to stay clickable
												pointerEvents: 'none',
												'@keyframes fieldToTop': {
													from: { transform: 'translateY(12px)', opacity: 0.4 },
													to: { transform: 'translateY(0)', opacity: 1 },
												},
												animation: `fieldToTop ${COLLAPSE_MS}ms ease`,
											}
										: { width: FIELD_WIDTH_RESTING, flexShrink: 0 }
								}
							>
								<Box
									sx={{
										width: '100%',
										maxWidth: searchMode ? FIELD_WIDTH : undefined,
										// …and the field takes them back
										pointerEvents: 'auto',
									}}
								>
									{field}
								</Box>
							</Box>
						</ColumnHeading>

						{searching ? (
							<SongSearchResults query={query} smartSearch={smartSearch} />
						) : (
							browseBody
						)}
					</Box>

					{/* Where you are in the songbook, floating over the bottom of the
					    window, so the next page is a click away however far down you
					    have read. Results scroll themselves, so searching has no page
					    to be on. */}
					{!searching && (
						<CatalogPagination
							page={page ?? 1}
							pagesCount={pagesCount}
							onChange={goToPage}
						/>
					)}

					<Gap value={2} />
				</Box>
			</Container>
		</Box>
	)
}
