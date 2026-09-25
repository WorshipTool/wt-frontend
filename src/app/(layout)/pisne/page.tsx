'use client'
import AllSongItem from '@/app/(layout)/pisne/AllSongItem'
import SongSearchResults from '@/app/(layout)/pisne/components/SongSearchResults'
import SongsMobile from '@/app/(layout)/pisne/SongsMobile'
import Pager from '@/common/components/Pager/Pager'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { useDownSize } from '@/common/hooks/useDownSize'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
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

	const field = (
		<SearchBar
			value={value}
			onChange={setValue}
			placeholder={tSearch('searchSongs')}
			// the field takes focus when navigation asks for search, not on every
			// visit to the catalog
			autoFocus={false}
			inputRef={fieldRef}
			onClear={clear}
			showSmartSearch={showSmartSearch}
			useSmartSearch={smartSearch}
			onSmartSearchChange={setSmartSearch}
		/>
	)

	if (phone) {
		return (
			<SongsMobile
				field={field}
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
					gap: 4,
				}}
			>
				<Gap value={3} />
				<Box display={'flex'}>
					<Typography variant="h4" strong>
						{t('title')}
					</Typography>
				</Box>

				<Box sx={{ width: '100%', maxWidth: FIELD_MAX_WIDTH }}>{field}</Box>

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
