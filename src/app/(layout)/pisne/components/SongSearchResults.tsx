'use client'

import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import SmartSongListCards from '@/common/components/songLists/SongListCards/SmartSongListCards'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { Box, CircularProgress } from '@/common/ui'
import {
	GroupRowsSkeleton,
	ListStateView,
	SongGroup,
} from '@/common/ui/GroupList'
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
}

/**
 * The app's song search results: the song cards on a desktop, the phone's own
 * rows on a phone.
 *
 * One data flow — paging, analytics, infinite scroll — shared by both widths.
 * Home used to own one copy of this and the phone another, which is how phone
 * searches went untracked in analytics for a while, and why the same query
 * could page differently depending on which screen you ran it from.
 */
export default function SongSearchResults({
	query,
	smartSearch,
}: SongSearchResultsProps) {
	const t = useTranslations('songsList')
	const phone = useIsPhone()

	const searchSongs = useSongSearch()
	const loadNextRef = useRef<HTMLDivElement>(null)
	const [loading, setLoading] = useState(true)
	const [enableLoadNext, setEnableLoadNext] = useState(false)

	const func = useCallback(
		(page: number, resolve: (a: SearchSongDto[]) => void) => {
			searchSongs(query as SearchKey, {
				page,
				useSmartSearch: smartSearch,
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
		[query, smartSearch, searchSongs]
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
	}, [query, smartSearch])

	useIsInViewport(loadNextRef, '200px', (intersecting) => {
		if (!enableLoadNext || !intersecting) return
		if (songs.length > 0 && nextExists) loadNext()
	})

	const empty = songs.length === 0

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
					songs={songs.flatMap((song) => song.found)}
					previewLines={PREVIEW_LINES_PHONE}
					withIcon
					highlight={query}
				/>
			) : (
				<SmartSongListCards
					data={songs}
					columns={CARD_COLUMNS}
					highlight={query}
					properties={['SHOW_ADDED_BY_LOADER', 'SHOW_PRIVATE_LABEL']}
				/>
			)}
			<Box ref={loadNextRef} sx={{ height: 1 }} />
		</Box>
	)
}
