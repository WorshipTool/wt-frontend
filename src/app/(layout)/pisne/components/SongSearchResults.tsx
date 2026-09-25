'use client'

import { VariantPackGuid } from '@/api/dtos'
import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import { SearchFilters } from '@/app/(layout)/pisne/catalog.types'
import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { Box } from '@/common/ui'
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
const PREVIEW_LINES_DESKTOP = 1

type SongSearchResultsProps = {
	/** The query actually being searched (already debounced and trimmed). */
	query: string
	smartSearch: boolean
	filters: SearchFilters
}

/**
 * The app's song search results: one screen-wide list of rows, the match lit up
 * in each title.
 *
 * One data flow — paging, analytics, infinite scroll — shared by both widths.
 * Home used to own one copy of this and the phone another, which is how phone
 * searches went untracked in analytics for a while, and why the same query
 * could page differently depending on which screen you ran it from.
 *
 * "With chords" is the backend's own search parameter, so it narrows the search
 * itself. "Mine" and "favourites" are properties of rows the search already
 * returned, so they narrow what came back — a page can therefore come back
 * thinner than it was fetched.
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

	const packs = useMemo(() => {
		const all = songs.flatMap((s) => s.found)
		return all.filter((pack) => {
			if (filters.mine && pack.createdByGuid !== user?.guid) return false
			if (filters.favourite && !favouriteGuids.has(pack.packGuid)) return false
			return true
		})
	}, [songs, filters.mine, filters.favourite, favouriteGuids, user?.guid])

	if (loading && packs.length === 0)
		return <GroupRowsSkeleton rows={6} withIcon={phone} />

	if (packs.length === 0)
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
			<SongGroup
				songs={packs}
				previewLines={phone ? PREVIEW_LINES_PHONE : PREVIEW_LINES_DESKTOP}
				withIcon={phone}
				highlight={query}
			/>
			<Box ref={loadNextRef} sx={{ height: 1 }} />
		</Box>
	)
}
