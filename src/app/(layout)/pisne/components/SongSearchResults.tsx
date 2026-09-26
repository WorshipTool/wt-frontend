'use client'

import { BasicVariantPack } from '@/api/dtos'
import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import { Analytics } from '@/app/components/components/analytics/analytics.tech'
import SmartSongListCards from '@/common/components/songLists/SongListCards/SmartSongListCards'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { Box, CircularProgress } from '@/common/ui'
import {
	GroupDivider,
	GroupRowsSkeleton,
	ListStateView,
	SongGroup,
	SongGroupRow,
} from '@/common/ui/GroupList'
import { groupSearchResults } from '@/common/components/songLists/songGroups'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import useSongSearch from '@/hooks/song/useSongSearch'
import usePagination from '@/hooks/usePagination'
import { useIsInViewport } from '@/hooks/useIsInViewport'
import { SearchKey } from '@/types/song/search.types'
import { SearchRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

/** Lyric preview lines on a result row: the phone's row is taller and can
 * carry two, a desktop row stays one line so more results fit the screen. */
const PREVIEW_LINES_PHONE = 2
/** How many cards stand abreast. The catalog's block is the width of the page
 * now, not a column beside a panel, so the results wear the card list's own
 * widths — the ones home's search has always used. */
const CARD_COLUMNS = { xs: 1, md: 2, lg: 4, xl: 5 }
/** Air between a run of songs and the next block on a phone. None: a song with
 * translations is still a line of the same list, so it keeps the list's rhythm
 * — only the pile under it belongs to it, and that carries its own air. */
const PHONE_BLOCK_GAP = 0

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

	// …and the shape the phone reads it in: songs on their own share a surface,
	// a song with translations gets a card of its own to pile under.
	const blocks = useMemo(() => {
		const out: { kind: 'singles' | 'group'; packs: BasicVariantPack[] }[] = []
		for (const entry of entries) {
			if (entry.kind === 'group' && entry.packs.length > 1) {
				out.push({ kind: 'group', packs: entry.packs })
				continue
			}
			const pack = entry.kind === 'group' ? entry.packs[0] : entry.pack
			const last = out[out.length - 1]
			if (last?.kind === 'singles') last.packs.push(pack)
			else out.push({ kind: 'singles', packs: [pack] })
		}
		return out
	}, [entries])

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
				// The phone reads the same grouping the desktop's cards do — one line
				// per song, its translations piled under it — as rows instead of cards.
				// It used to flatten every translation onto a line of its own, which is
				// how a search for a wedding song answered with five rows all called
				// "Svatební".
				//
				// Songs on their own share a surface, the way every list on a phone
				// does. A song with translations stands on a card of its own, because
				// the pile under it needs an edge to peek out from.
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: PHONE_BLOCK_GAP,
					}}
				>
					{blocks.map((block, i) => {
						const isGroup = block.kind === 'group'
						// One list, whatever it is made of: a block rounds off only where
						// the list itself ends, and a group's bottom, which is a card's own
						// edge with a pile under it. Everywhere else the corners are square
						// and the blocks meet on an ordinary divider.
						// …and a block that follows a pile starts a fresh card, because the
						// pile ended the one before it
						const opensCard = i === 0 || blocks[i - 1].kind === 'group'
						const closesCard = i === blocks.length - 1 || isGroup
						const corners = {
							...(!opensCard && {
								borderTopLeftRadius: 0,
								borderTopRightRadius: 0,
							}),
							...(!closesCard && {
								borderBottomLeftRadius: 0,
								borderBottomRightRadius: 0,
							}),
						}
						return (
							<Fragment
								key={`${block.kind}-${String(block.packs[0].packGuid)}`}
							>
								{/* …and a pile is a divider of its own, so none after one. The
								    white behind it is the surface it would have been drawn on
								    had these rows shared one, so its inset reads the same as
								    every other divider's. */}
								{i > 0 && blocks[i - 1].kind !== 'group' && (
									<Box sx={{ bgcolor: 'background.paper' }}>
										<GroupDivider inset="icon" />
									</Box>
								)}
								{isGroup ? (
									<SongGroupRow
										packs={block.packs}
										previewLines={PREVIEW_LINES_PHONE}
										highlight={query}
										sx={corners}
									/>
								) : (
									<SongGroup
										songs={block.packs}
										previewLines={PREVIEW_LINES_PHONE}
										withIcon
										highlight={query}
										sx={corners}
									/>
								)}
							</Fragment>
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
