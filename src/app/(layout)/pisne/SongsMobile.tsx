'use client'

import { mapBasicVariantPackApiToDto } from '@/api/dtos/song/song.map'
import { groupByFirstLetter } from '@/app/(layout)/pisne/letterGroups'
import { useBrowseSongs } from '@/app/(layout)/pisne/useBrowseSongs'
import CatalogPagination from '@/app/(layout)/pisne/components/CatalogPagination'
import SongSearchResults from '@/app/(layout)/pisne/components/SongSearchResults'
import { MobileAppHeader } from '@/common/components/MobileAppHeader'
import {
	GroupRowsSkeleton,
	ListStateView,
	SongGroup,
} from '@/common/ui/GroupList'
import { Box, Button, Typography } from '@/common/ui'
import { CloudOffRounded, MusicNoteRounded, RefreshRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { ReactNode, useMemo } from 'react'

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
 * scrolls, the paginator floating over the end of it — see docs/design/MOBILE.md).
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
	page,
	onPageChange,
	count,
	perPage,
}: SongsMobileProps) {
	const t = useTranslations('songsList')
	const tCommon = useTranslations('common')
	const searching = query.length > 0

	const pagesCount = Math.max(1, Math.ceil(count / perPage))

	// nothing to page through while results are on screen
	const { items, loading, error, reload } = useBrowseSongs(
		page,
		perPage,
		!searching
	)
	const letterGroups = useMemo(() => groupByFirstLetter(items), [items])

	return (
		<MobileAppHeader
			title={t('title')}
			collapseTitle={collapseTitle}
			controlPanel={field}
			// a new query starts at the top of its own results, and so does a new
			// page of the browse list
			scrollResetKey={searching ? query : page}
		>
			{searching ? (
				<SongSearchResults query={query} smartSearch={smartSearch} />
			) : loading ? (
				<GroupRowsSkeleton rows={perPage} withIcon />
			) : error ? (
				<ListStateView
					icon={<CloudOffRounded fontSize="inherit" />}
					message={t('error')}
					action={
						<Button
							variant="outlined"
							onClick={reload}
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

			{/* floats over the last rows while you scroll and settles under them at
			    the end of the page, the way it does on a desktop */}
			{!searching && !error && (
				<CatalogPagination
					page={page}
					pagesCount={pagesCount}
					onChange={onPageChange}
					touch
				/>
			)}
		</MobileAppHeader>
	)
}
