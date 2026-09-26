'use client'

import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import SmartSongListCards from '@/common/components/songLists/SongListCards/SmartSongListCards'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { Box, CircularProgress } from '@/common/ui'
import {
	GroupCard,
	GroupRowsSkeleton,
	ListStateView,
	SongGroupRow,
	SongRow,
} from '@/common/ui/GroupList'
import { groupSearchResults } from '@/common/components/songLists/songGroups'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
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
/** How many cards stand abreast. The catalog's block is the width of the page
 * now, not a column beside a panel, so the results wear the card list's own
 * widths — the ones home's search has always used. */
const CARD_COLUMNS = { xs: 1, md: 2, lg: 4, xl: 5 }
/** Air between two results on a phone. Every song stands on a card of its own
 * here, rather than sharing one surface the way the app's other lists do: a
 * song with translations has to, because the pile under it needs an edge to
 * peek out from, and a list where only that one song is a card reads as though
 * it had been singled out. So they all are, and the gap is the same for all of
 * them. */
const PHONE_RESULT_GAP = 1

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

	// The same rule the desktop's cards follow, so the two can never disagree
	// about which songs belong together — including the flag that turns grouping
	// on at all.
	const grouped = useFlag('group_translations')
	const entries = useMemo(
		() => groupSearchResults(songs, grouped),
		[songs, grouped]
	)

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
				// The phone reads the same grouping the desktop's cards do — one result
				// per song, its translations piled under it — as rows instead of cards.
				// It used to flatten every translation onto a line of its own, which is
				// how a search for a wedding song answered with five rows all called
				// "Svatební".
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: PHONE_RESULT_GAP,
					}}
				>
					{entries.map((entry) => {
						if (entry.kind === 'group' && entry.packs.length > 1)
							return (
								<SongGroupRow
									key={String(entry.packs[0].packGuid)}
									packs={entry.packs}
									previewLines={PREVIEW_LINES_PHONE}
									highlight={query}
								/>
							)
						// a group of one is a song like any other: nothing to pile
						const song = entry.kind === 'group' ? entry.packs[0] : entry.pack
						return (
							<GroupCard key={String(song.packGuid)}>
								<SongRow
									song={song}
									previewLines={PREVIEW_LINES_PHONE}
									highlight={query}
								/>
							</GroupCard>
						)
					})}
				</Box>
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
