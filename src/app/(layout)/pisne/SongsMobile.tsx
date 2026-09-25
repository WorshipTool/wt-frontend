'use client'

import { BasicVariantPack } from '@/api/dtos'
import { mapBasicVariantPackApiToDto } from '@/api/dtos/song/song.map'
import { GetListSongData } from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { SearchFilters, SongSort } from '@/app/(layout)/pisne/catalog.types'
import { groupByFirstLetter } from '@/app/(layout)/pisne/letterGroups'
import CatalogChips from '@/app/(layout)/pisne/components/CatalogChips'
import SongSearchResults from '@/app/(layout)/pisne/components/SongSearchResults'
import { MobileAppHeader } from '@/common/components/MobileAppHeader'
import {
	GroupRowsSkeleton,
	ListStateView,
	SongGroup,
} from '@/common/ui/GroupList'
import { Box, Button, Typography } from '@/common/ui'
import { Pagination } from '@/common/ui/mui'
import { CloudOffRounded, MusicNoteRounded, RefreshRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useMemo, useState } from 'react'

const PREVIEW_LINES = 1
// small alphabetical section label above each letter's group card
const LETTER_HEADER_SX = {
	paddingLeft: 0.5,
	paddingTop: 0.5,
	paddingBottom: 0.5,
} as const

type SongsMobileProps = {
	/** The search field, owned by the page so both widths share one. It lives in
	 * the header's control strip, where it cannot be scrolled away. */
	field: ReactNode
	/** Folds the large title away so the field is the whole header — what the
	 * screen looks like once you are searching with it. */
	collapseTitle: boolean
	/** The query being searched (trimmed, debounced). Empty means browsing. */
	query: string
	smartSearch: boolean
	/** Browsing: the order. Searching: what the results are narrowed to. The
	 * phone shows whichever applies as a row of pills under the field. */
	sort: SongSort
	onSortChange: (sort: SongSort) => void
	filters: SearchFilters
	onFiltersChange: (filters: SearchFilters) => void
	loggedIn: boolean
	/** The recently-added batch, fetched by the page when that order is chosen. */
	newestSongs: BasicVariantPack[]
	newestLoading: boolean
	/** 1-indexed page, kept in the URL by the parent (shared with desktop) */
	page: number
	onPageChange: (page: number) => void
	count: number
	/** Page size, owned by the page so mobile and desktop agree on what `?s=` means */
	perPage: number
}

/**
 * Native-feeling mobile song catalog, built on the shared MobileAppHeader
 * app-shell (collapsing title, search field pinned under it, only the content
 * scrolls, paginator in a quiet bottom panel — see docs/design/MOBILE.md).
 *
 * Browsing groups the current page's songs by first letter; there are thousands
 * of songs, so paging beats an endless scroll. Searching replaces that body
 * (and the paginator with it, since results scroll themselves). The desktop
 * layout of the same two states stays in page.tsx.
 */
export default function SongsMobile({
	field,
	collapseTitle,
	query,
	smartSearch,
	sort,
	onSortChange,
	filters,
	onFiltersChange,
	loggedIn,
	newestSongs,
	newestLoading,
	page,
	onPageChange,
	count,
	perPage,
}: SongsMobileProps) {
	const t = useTranslations('songsList')
	const tCommon = useTranslations('common')
	const { songGettingApi } = useApi()

	const [items, setItems] = useState<GetListSongData[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)
	const [reloadKey, setReloadKey] = useState(0)

	const pagesCount = Math.max(1, Math.ceil(count / perPage))

	const searching = query.length > 0

	// the songbook read alphabetically is read by its initials; read by date it
	// is one run, so the letters would be noise
	const newest = !searching && sort === 'newest'
	const letterGroups = useMemo(() => groupByFirstLetter(items), [items])

	useEffect(() => {
		// nothing to page through while results — or the recently-added batch,
		// which the page fetches — are on screen; going back to A–Z runs this again
		if (searching || newest) return
		let active = true
		setLoading(true)
		setError(false)
		// `page` is 1-indexed for the UI/paginator, but the backend list is
		// 0-indexed (see Pager, which fetches `page - 1`) — so page 1 → offset 0.
		songGettingApi
			.getList(page - 1, perPage)
			.then((data) => {
				if (active) setItems(data)
			})
			.catch(() => {
				if (active) {
					setItems([])
					setError(true)
				}
			})
			.finally(() => {
				if (active) setLoading(false)
			})
		return () => {
			active = false
		}
	}, [page, perPage, songGettingApi, reloadKey, searching, newest])

	const paginator =
		!searching && !newest && !error && pagesCount > 1 ? (
			<Pagination
				count={pagesCount}
				page={Math.min(page, pagesCount)}
				onChange={(_, p) => onPageChange(p)}
				siblingCount={0}
				boundaryCount={1}
				sx={{
					// finger-sized touch targets (44px) while staying compact
					'& .MuiPaginationItem-root': {
						minWidth: 44,
						height: 44,
						margin: '0 2px',
						fontSize: '1rem',
					},
				}}
			/>
		) : undefined

	return (
		<MobileAppHeader
			title={t('title')}
			collapseTitle={collapseTitle}
			controlPanel={
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
					{field}
					<CatalogChips
						searching={searching}
						sort={sort}
						onSortChange={onSortChange}
						filters={filters}
						onFiltersChange={onFiltersChange}
						loggedIn={loggedIn}
					/>
				</Box>
			}
			bottomPanel={paginator}
			// a new query starts at the top of its own results, and so does a new
			// page of the browse list
			scrollResetKey={searching ? query : newest ? 'newest' : page}
		>
			{searching ? (
				<SongSearchResults
					query={query}
					smartSearch={smartSearch}
					filters={filters}
				/>
			) : newest ? (
				newestLoading ? (
					<GroupRowsSkeleton rows={8} withIcon />
				) : (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						<SongGroup songs={newestSongs} previewLines={PREVIEW_LINES} />
						<Typography small color="grey.600" sx={{ paddingX: 0.5 }}>
							{t('newestNote')}
						</Typography>
					</Box>
				)
			) : loading ? (
				<GroupRowsSkeleton rows={perPage} withIcon />
			) : error ? (
				<ListStateView
					icon={<CloudOffRounded fontSize="inherit" />}
					message={t('error')}
					action={
						<Button
							variant="outlined"
							onClick={() => setReloadKey((k) => k + 1)}
							startIcon={<RefreshRounded />}
							disableUppercase
						>
							{tCommon('tryAgain')}
						</Button>
					}
				/>
			) : items.length === 0 ? (
				<ListStateView
					icon={<MusicNoteRounded fontSize="inherit" />}
					message={t('empty')}
				/>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{letterGroups.map((group, groupIndex) => (
						// groups are consecutive runs, so the same letter can appear twice
						// (mixed collation, or two untitled songs both mapping to '#')
						<Box key={`${group.letter}-${groupIndex}`}>
							<Box sx={LETTER_HEADER_SX}>
								<Typography
									small
									strong={700}
									color="grey.700"
									sx={{ letterSpacing: '0.5px' }}
								>
									{group.letter}
								</Typography>
							</Box>
							<SongGroup
								songs={group.items.map((s) => mapBasicVariantPackApiToDto(s.main))}
								previewLines={PREVIEW_LINES}
							/>
						</Box>
					))}
				</Box>
			)}
		</MobileAppHeader>
	)
}
