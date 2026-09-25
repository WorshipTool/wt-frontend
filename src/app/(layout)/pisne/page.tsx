'use client'
import AllSongItem from '@/app/(layout)/pisne/AllSongItem'
import SongSearchResults from '@/app/(layout)/pisne/components/SongSearchResults'
import SongsMobile from '@/app/(layout)/pisne/SongsMobile'
import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import Pager from '@/common/components/Pager/Pager'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { useDownSize } from '@/common/hooks/useDownSize'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { useToolbar } from '@/common/components/Toolbar/hooks/useToolbar'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { NewsHighlightWrapper } from '@/common/providers/News'
import { Box, CircularProgress, Typography } from '@/common/ui'
import { SearchBar } from '@/common/ui/SearchBar/SearchBar'
import { Container } from '@/common/ui/mui'
import { Grid } from '@/common/ui/mui/Grid'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { useApiStateEffect } from '@/tech/ApiState'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApi } from '../../../api/tech-and-hooks/useApi'
import { Gap } from '../../../common/ui/Gap/Gap'
import { useSmartUrlState } from '../../../hooks/urlstate/useUrlState'

/** Widest the search field gets on a desktop, so it stays a field and not a banner. */
const FIELD_MAX_WIDTH = 600
/**
 * Where the field sits once searching takes over the desktop screen: half into
 * the 56px top bar, which is where the home hero's field used to land when the
 * page scrolled. Above the bar's own z-index (10), since it overlaps it.
 */
const FIELD_TOP_SEARCHING = 22
const FIELD_Z = 11
/** Air under the floating field, so results don't start against it. */
const RESULTS_TOP_SPACE = 5
/** How long the title takes to fold away — the phone header's own timing. */
const COLLAPSE_MS = 240
/** An explicit length for the title block, which a transition needs to animate
 * from; the h4 is shorter than this. */
const TITLE_MAX_HEIGHT = 80

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
 * empty, you browse the whole songbook A–Z; typed, the same screen shows
 * results. Search used to be a mode of the home page (`/?hledat=`), which is
 * why the songs list had no search at all and why two phone tabs pointed at
 * the same route.
 */
function SongsPage() {
	const t = useTranslations('songsList')
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

	// …while the *chrome* answers to the field itself, the way the home screen
	// used to: touch the field and the title folds away, carrying the field up to
	// the top — on a phone it becomes the header, on a desktop it comes to rest
	// half in the top bar.
	//
	// The field, not the URL: arriving with `?hledat=` focuses the field (below),
	// which raises the chrome by itself, and the parameter then stays for the
	// whole visit so the Hledat tab keeps its highlight. Reading it here as well
	// would mean an empty field you have clicked away from could never give the
	// title back.
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
				page={page ?? 1}
				onPageChange={setPage}
				count={count ?? 0}
				perPage={countPerPage}
			/>
		)
	}

	return (
		<Box>
			<Container
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					// the gaps close with the title: a folded row still holds the air on
					// both sides of itself, which would leave the results stranded far
					// below the field that floated up
					gap: searchMode ? 0 : 4,
					transition: `gap ${COLLAPSE_MS}ms ease`,
				}}
			>
				<Box
					sx={{
						height: searchMode ? 0 : 24,
						transition: `height ${COLLAPSE_MS}ms ease`,
					}}
				/>

				{/* The title folds away when the field takes over, the way the home
				    hero did — and the field goes with it, up to the top bar. */}
				<Box
					sx={{
						display: 'flex',
						overflow: 'hidden',
						maxHeight: searchMode ? 0 : TITLE_MAX_HEIGHT,
						opacity: searchMode ? 0 : 1,
						transition: `max-height ${COLLAPSE_MS}ms ease, opacity ${
							COLLAPSE_MS / 2
						}ms ease`,
					}}
				>
					<Typography variant="h4" strong>
						{t('title')}
					</Typography>
				</Box>

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
					<Box sx={{ width: '100%', maxWidth: FIELD_MAX_WIDTH }}>{field}</Box>
				</Box>

				{/* air under the floating field, where the flow no longer provides any */}
				<Box
					sx={{
						height: searchMode ? RESULTS_TOP_SPACE * 8 : 0,
						transition: `height ${COLLAPSE_MS}ms ease`,
					}}
				/>

				{searching ? (
					<SongSearchResults query={query} smartSearch={smartSearch} />
				) : (
					<Pager
						data={getPageData}
						allCount={count || 0}
						take={countPerPage}
						startPage={page || 1}
						onPageChange={setPage}
					>
						{(data, loading, startIndex) => {
							return (
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

									<Grid container columns={3} spacing={1} paddingBottom={2}>
										{data.map((s, index) => {
											return (
												<Grid
													item
													xs={3}
													md={1.5}
													lg={1}
													key={s.main.songGuid as any}
												>
													<AllSongItem data={s} index={startIndex + index + 1} />
												</Grid>
											)
										})}
									</Grid>
								</Box>
							)
						}}
					</Pager>
				)}

				<Gap value={2} />
			</Container>
		</Box>
	)
}
