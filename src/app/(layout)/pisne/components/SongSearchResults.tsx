'use client'

import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import SmartSongListCards from '@/common/components/songLists/SongListCards/SmartSongListCards'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { Box, Button, Typography } from '@/common/ui'
import {
	GroupRowsSkeleton,
	ListStateView,
	SongGroup,
} from '@/common/ui/GroupList'
import useSongSearch from '@/hooks/song/useSongSearch'
import usePagination from '@/hooks/usePagination'
import { useIsInViewport } from '@/hooks/useIsInViewport'
import { SearchKey } from '@/types/song/search.types'
import { SearchRounded, Sync } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

/** Lyric preview lines on a phone row — the density the other song lists use. */
const PREVIEW_LINES = 2

type SongSearchResultsProps = {
	/** The query actually being searched (already debounced and trimmed). */
	query: string
	smartSearch: boolean
}

/**
 * The app's song search results.
 *
 * One data flow — paging, analytics, infinite scroll — with the width deciding
 * only what a result looks like: grouped rows on a phone, cards on a desktop.
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
	const [nextLoading, setNextLoading] = useState(false)
	const [enableLoadNext, setEnableLoadNext] = useState(false)

	const func = useCallback(
		(page: number, resolve: (a: SearchSongDto[]) => void) => {
			searchSongs(query as SearchKey, { page, useSmartSearch: smartSearch })
				.then((data) => {
					setLoading(false)
					setNextLoading(false)
					resolve(data)
				})
				.catch(() => {
					setLoading(false)
					setNextLoading(false)
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

	const packs = songs.flatMap((s) => s.found)

	if (loading && packs.length === 0)
		return <GroupRowsSkeleton rows={6} withIcon />

	if (packs.length === 0)
		return (
			<ListStateView
				icon={<SearchRounded fontSize="inherit" />}
				message={t('noResults')}
			/>
		)

	return (
		// full width on purpose: the desktop page centres its children, and the
		// card grid would otherwise shrink to a single squashed column
		<Box
			sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}
		>
			<Typography small strong uppercase color="grey.700" sx={{ paddingX: 0.5 }}>
				{t('results')}
			</Typography>

			{phone ? (
				<SongGroup songs={packs} previewLines={PREVIEW_LINES} />
			) : (
				<SmartSongListCards
					data={songs}
					properties={['SHOW_ADDED_BY_LOADER', 'SHOW_PRIVATE_LABEL']}
				/>
			)}

			{/* the phone scrolls itself full; a desktop mouse gets the button too,
			    which is also the only way on smart search, whose pager cannot say
			    whether another page exists */}
			{!phone && (nextExists || smartSearch) && (
				<Box sx={{ display: 'flex', justifyContent: 'center' }}>
					<Button
						loading={nextLoading}
						loadingPosition="start"
						onClick={() => {
							setNextLoading(true)
							loadNext()
						}}
						variant="text"
						startIcon={<Sync />}
					>
						{t('loadMore')}
					</Button>
				</Box>
			)}

			<Box ref={loadNextRef} sx={{ height: 1 }} />
		</Box>
	)
}
