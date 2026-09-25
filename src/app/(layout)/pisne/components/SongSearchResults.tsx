'use client'

import { VariantPackGuid } from '@/api/dtos'
import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import { SearchFilters } from '@/app/(layout)/pisne/catalog.types'
import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import SmartSongListCards from '@/common/components/songLists/SongListCards/SmartSongListCards'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { Box, CircularProgress } from '@/common/ui'
import {
	GroupRowsSkeleton,
	ListStateView,
	SongGroup,
} from '@/common/ui/GroupList'
import useAuth from '@/hooks/auth/useAuth'
import { useFavourites } from '@/hooks/favourites/useFavourites'
import useSongSearch from '@/hooks/song/useSongSearch'
import usePagination from '@/hooks/usePagination'
import { useIsInViewport } from '@/hooks/useIsInViewport'
import { SearchKey } from '@/types/song/search.types'
import { SearchRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** Lyric preview lines on a result row: the phone's row is taller and can
 * carry two, a desktop row stays one line so more results fit the screen. */
const PREVIEW_LINES_PHONE = 2
/** Cards, two abreast, in the catalog's list column. */
const CARD_COLUMNS = { xs: 1, md: 2 }

type SongSearchResultsProps = {
	/** The query actually being searched (already debounced and trimmed). */
	query: string
	smartSearch: boolean
	filters: SearchFilters
}

/**
 * The app's song search results: the song cards on a desktop, the phone's own
 * rows on a phone.
 *
 * One data flow — paging, analytics, infinite scroll — shared by both widths.
 * Home used to own one copy of this and the phone another, which is how phone
 * searches went untracked in analytics for a while, and why the same query
 * could page differently depending on which screen you ran it from.
 *
 * "With chords" is the backend's own search parameter, so it narrows the search
 * itself. "Mine" and "favourites" are properties of packs the search already
 * returned, so they narrow what came back — a song whose every pack is filtered
 * out drops from the results, and a page can come back thinner than it was
 * fetched.
 */
export default function SongSearchResults({
	query,
	smartSearch,
	filters,
}: SongSearchResultsProps) {
	const t = useTranslations('songsList')
	const phone = useIsPhone()
	const { user } = useAuth()
	const { items: favourites } = useFavourites()

	const searchSongs = useSongSearch()
	const loadNextRef = useRef<HTMLDivElement>(null)
	const [loading, setLoading] = useState(true)
	const [enableLoadNext, setEnableLoadNext] = useState(false)

	const func = useCallback(
		(page: number, resolve: (a: SearchSongDto[]) => void) => {
			searchSongs(query as SearchKey, {
				page,
				useSmartSearch: smartSearch,
				onlyWithChords: filters.chords,
			})
				.then((data) => {
					setLoading(false)
					resolve(data)
				})
				.catch(() => {
					setLoading(false)
					resolve([])
				})
		},
		[query, smartSearch, filters.chords, searchSongs]
	)

	const {
		nextPage: loadNext,
		loadPage,
		data: songs,
		nextExists,
	} = usePagination<SearchSongDto>(func)

	// one event per query, not per page of it
	const lastTrackedRef = useRef<string | null>(null)

	useEffect(() => {
		setEnableLoadNext(false)
		setLoading(true)
		if (query !== lastTrackedRef.current) {
			lastTrackedRef.current = query
			Analytics.track('SEARCH', { query, smartSearch: Boolean(smartSearch) })
		}
		loadPage(0, true).finally(() => setEnableLoadNext(true))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, smartSearch, filters.chords])

	useIsInViewport(loadNextRef, '200px', (intersecting) => {
		if (!enableLoadNext || !intersecting) return
		if (songs.length > 0 && nextExists) loadNext()
	})

	const favouriteGuids = useMemo(
		() => new Set((favourites ?? []).map((f) => f.packGuid as VariantPackGuid)),
		[favourites]
	)

	/** The search's own results, narrowed song by song: a song stays as long as
	 * one of its packs passes, and keeps only the packs that did — so a card
	 * never offers a version the filter excluded. */
	const results = useMemo(() => {
		return songs
			.map((song) => ({
				...song,
				found: song.found.filter((pack) => {
					if (filters.mine && pack.createdByGuid !== user?.guid) return false
					if (filters.favourite && !favouriteGuids.has(pack.packGuid))
						return false
					return true
				}),
			}))
			.filter((song) => song.found.length > 0)
	}, [songs, filters.mine, filters.favourite, favouriteGuids, user?.guid])

	const empty = results.length === 0

	if (loading && empty)
		return phone ? (
			<GroupRowsSkeleton rows={6} withIcon />
		) : (
			<Box sx={{ display: 'flex', justifyContent: 'center', paddingY: 6 }}>
				<CircularProgress />
			</Box>
		)

	if (empty)
		return (
			<ListStateView
				icon={<SearchRounded fontSize="inherit" />}
				message={t('noResults')}
			/>
		)

	return (
		<Box
			sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}
		>
			{phone ? (
				<SongGroup
					songs={results.flatMap((song) => song.found)}
					previewLines={PREVIEW_LINES_PHONE}
					withIcon
					highlight={query}
				/>
			) : (
				<SmartSongListCards
					data={results}
					columns={CARD_COLUMNS}
					highlight={query}
					properties={['SHOW_ADDED_BY_LOADER', 'SHOW_PRIVATE_LABEL']}
				/>
			)}
			<Box ref={loadNextRef} sx={{ height: 1 }} />
		</Box>
	)
}
