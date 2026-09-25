'use client'
import {
	NO_FILTERS,
	SearchFilters,
	SongSort,
} from '@/app/(layout)/pisne/catalog.types'
import CatalogSidePanel, {
	ColumnHeading,
} from '@/app/(layout)/pisne/components/CatalogSidePanel'
import SongSearchResults from '@/app/(layout)/pisne/components/SongSearchResults'
import SongsBrowseDesktop from '@/app/(layout)/pisne/components/SongsBrowseDesktop'
import SongsMobile from '@/app/(layout)/pisne/SongsMobile'
import { useNewestSongs } from '@/app/(layout)/pisne/useNewestSongs'
import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import Pager from '@/common/components/Pager/Pager'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { useToolbar } from '@/common/components/Toolbar/hooks/useToolbar'
import { useDownSize } from '@/common/hooks/useDownSize'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { NewsHighlightWrapper } from '@/common/providers/News'
import { Box, CircularProgress, Typography } from '@/common/ui'
import { SongGroup } from '@/common/ui/GroupList'
import { SearchBar } from '@/common/ui/SearchBar/SearchBar'
import { Container } from '@/common/ui/mui'
import useAuth from '@/hooks/auth/useAuth'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { useApiStateEffect } from '@/tech/ApiState'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApi } from '../../../api/tech-and-hooks/useApi'
import { Gap } from '../../../common/ui/Gap/Gap'
import { useSmartUrlState } from '../../../hooks/urlstate/useUrlState'

/** The centred block: the list and the panel beside it, and nothing at the
 * window's edges. */
const BLOCK_WIDTH = 1000
/** The side panel — wide enough for "Naposledy přidané" on one line. */
const PANEL_WIDTH = 260
/** The search field. Narrower than the block on purpose: it is one control, not
 * a banner, and it keeps the same width in both of its positions. */
const FIELD_WIDTH = 700
/**
 * Where the field sits once searching takes over the screen: half into the 56px
 * top bar, which is where the home hero's field used to land when the page
 * scrolled. Above the bar's own z-index (10), since it overlaps it.
 */
const FIELD_TOP_SEARCHING = 22
const FIELD_Z = 11
/** Air under the floating field, where the flow no longer provides any. */
const RESULTS_TOP_SPACE = 5
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
	const tSearch = useTranslations('search')
	const phone = useIsPhone()
	const { isLoggedIn } = useAuth()

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
	// which wants to show its results rather than cover them with a keyboard.
	useEffect(() => {
		if (urlQuery === '') fieldRef.current?.focus()
	}, [urlQuery])

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

	const [fieldFocused, setFieldFocused] = useState(false)
	const [sort, setSort] = useState<SongSort>('abc')
	const [filters, setFilters] = useState<SearchFilters>(NO_FILTERS)

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
	const countPerPage = phone ? 12 : isSmall ? 8 : isMiddle ? 16 : 21
	const getPageData = async (page: number) => {
		const r = await songGettingApi.getList(page, countPerPage + 1)

		return r.slice(0, countPerPage)
	}

	// Searching is what the field says, not what the URL says: a tap on Hledat
	// opens the field with the browse list still under it, so you can type or
	// keep browsing.
	const searching = query.length > 0
	const newest = !searching && sort === 'newest'
	const newestSongs = useNewestSongs(newest)

	// …while the *chrome* answers to the field itself, the way the home screen
	// used to: touch the field and the field rides up to the top — on a phone it
	// becomes the header, on a desktop it comes to rest half in the top bar.
	//
	// The field, not the URL: arriving with `?hledat=` focuses the field (above),
	// which raises the chrome by itself, and the parameter then stays for the
	// whole visit so the Hledat tab keeps its highlight. Reading it here as well
	// would mean an empty field you have clicked away from could never give the
	// screen back.
	const searchMode = searching || fieldFocused

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
			<Box
				data-testid="main-search-container"
				// focus bubbles (React's onFocus is focusin), so the field itself
				// needs no handler of its own
				onFocus={() => setFieldFocused(true)}
				onBlur={() => setFieldFocused(false)}
			>
				<SearchBar
					value={value}
					onChange={setValue}
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
				sort={sort}
				onSortChange={setSort}
				filters={filters}
				onFiltersChange={setFilters}
				loggedIn={isLoggedIn()}
				newestSongs={newestSongs.songs}
				newestLoading={newestSongs.loading}
				page={page ?? 1}
				onPageChange={setPage}
				count={count ?? 0}
				perPage={countPerPage}
			/>
		)
	}

	const browseCount = newest ? newestSongs.songs.length : count ?? 0

	const browseBody = newest ? (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
			<SongGroup songs={newestSongs.songs} previewLines={1} withIcon={false} />
			<Typography small color="grey.600">
				{t('newestNote')}
			</Typography>
		</Box>
	) : (
		<Pager
			data={getPageData}
			allCount={count || 0}
			take={countPerPage}
			startPage={page || 1}
			onPageChange={setPage}
		>
			{(data, loading) => (
				<Box
					display={'flex'}
					flexDirection={'column'}
					gap={2}
					position={'relative'}
				>
					<Box
						sx={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							bgcolor: loading ? 'grey.300' : 'transparent',
							opacity: 0.5,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							pointerEvents: loading ? undefined : 'none',
							transition: 'all 0.3s',
						}}
					>
						{loading && <CircularProgress />}
					</Box>

					<SongsBrowseDesktop items={data} />
				</Box>
			)}
		</Pager>
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
						gap: searchMode ? 0 : 3,
						transition: `gap ${COLLAPSE_MS}ms ease`,
					}}
				>
					<Gap value={3} />

					{/* One wrapper that moves, never two that swap: a swap would rebuild
					    the input and drop the caret the moment you touched it. Searching
					    lifts it out of the flow to rest half in the top bar, whose own
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
										'@keyframes fieldToTop': {
											from: { transform: 'translateY(12px)', opacity: 0.4 },
											to: { transform: 'translateY(0)', opacity: 1 },
										},
										animation: `fieldToTop ${COLLAPSE_MS}ms ease`,
								  }
								: { width: '100%', display: 'flex', justifyContent: 'center' }
						}
					>
						<Box sx={{ width: '100%', maxWidth: FIELD_WIDTH }}>{field}</Box>
					</Box>

					{/* air under the floating field, where the flow no longer provides any */}
					<Box
						sx={{
							height: searchMode ? RESULTS_TOP_SPACE * 8 : 0,
							transition: `height ${COLLAPSE_MS}ms ease`,
						}}
					/>

					<Box sx={{ display: 'flex', gap: 4.5, alignItems: 'flex-start' }}>
						<Box
							sx={{
								flexGrow: 1,
								minWidth: 0,
								display: 'flex',
								flexDirection: 'column',
								gap: 1.5,
							}}
						>
							<ColumnHeading label={searching ? t('results') : t('allSongs')}>
								{!searching && (
									<Typography small color="grey.600">
										{t('songCount', {
											count: browseCount,
											// the reader's own thousands separator: the app pins
											// next-intl to one locale for all three brands, so ICU's
											// own number format would write 2,057 to a Czech reader
											formatted: browseCount.toLocaleString(),
										})}
									</Typography>
								)}
							</ColumnHeading>

							{searching ? (
								<SongSearchResults
									query={query}
									smartSearch={smartSearch}
									filters={filters}
								/>
							) : (
								browseBody
							)}
						</Box>

						<Box sx={{ width: PANEL_WIDTH, flexShrink: 0 }}>
							<CatalogSidePanel
								searching={searching}
								sort={sort}
								onSortChange={setSort}
								filters={filters}
								onFiltersChange={setFilters}
								loggedIn={isLoggedIn()}
							/>
						</Box>
					</Box>

					<Gap value={2} />
				</Box>
			</Container>
		</Box>
	)
}
