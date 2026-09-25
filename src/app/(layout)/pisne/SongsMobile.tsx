'use client'

import { mapBasicVariantPackApiToDto } from '@/api/dtos/song/song.map'
import { groupByFirstLetter } from '@/app/(layout)/pisne/letterGroups'
import { useBrowseSongs } from '@/app/(layout)/pisne/useBrowseSongs'
import CatalogPagination from '@/app/(layout)/pisne/components/CatalogPagination'
import SongSearchResults from '@/app/(layout)/pisne/components/SongSearchResults'
import {
	MobileAppHeader,
	TOOLBAR_SPACER,
} from '@/common/components/MobileAppHeader'
import {
	GroupRowsSkeleton,
	ListStateView,
	SongGroup,
} from '@/common/ui/GroupList'
import { Box, Button, Typography, useTheme } from '@/common/ui'
import { CloudOffRounded, MusicNoteRounded, RefreshRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { ReactNode, useMemo } from 'react'

const PREVIEW_LINES = 1
/** Air above the large title, under the status bar. */
const TITLE_TOP_PAD = 12
/** The title's own line height, so the fold has a length to animate from. */
const TITLE_MAX_HEIGHT = 72
/** How long the title takes to fold away when searching takes the screen. */
const COLLAPSE_MS = 240
/** Air above and below the field in its band, in theme units. */
const BAND_PAD = 1
// small alphabetical section label above each letter's group card
const LETTER_HEADER_SX = {
	paddingLeft: 0.5,
	paddingTop: 0.5,
	paddingBottom: 0.5,
} as const

type SongsMobileProps = {
	/** The search field, owned by the page so both widths share one. It sits in
	 * a band of its own that pins to the top of the scroll. */
	field: ReactNode
	/** Folds the large title away so the field is the whole top — what the
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
 * app-shell — see docs/design/MOBILE.md.
 *
 * The title is ordinary content and scrolls away with the list; only the search
 * band pins, the way home's does. A pinned title bar would spend a row of a
 * phone screen repeating what the tab bar already says.
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
	const theme = useTheme()
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
			// a new query starts at the top of its own results, and so does a new
			// page of the browse list
			scrollResetKey={searching ? query : page}
		>
			{/* the title belongs to the page, not to a bar: it scrolls away with the
			    list, and folds on its own once searching takes the screen */}
			<Box
				sx={{
					paddingTop: `calc(${TOOLBAR_SPACER} + ${TITLE_TOP_PAD}px)`,
					// flush with the cards below it, which the scroller insets by 16px
					overflow: 'hidden',
					maxHeight: collapseTitle ? 0 : TITLE_MAX_HEIGHT,
					opacity: collapseTitle ? 0 : 1,
					transition: `max-height ${COLLAPSE_MS}ms ease, opacity ${
						COLLAPSE_MS / 2
					}ms ease, padding-top ${COLLAPSE_MS}ms ease`,
					...(collapseTitle && { paddingTop: TOOLBAR_SPACER }),
				}}
			>
				<Box
					sx={{
						fontSize: '1.85rem',
						fontWeight: 800,
						letterSpacing: '-0.4px',
						lineHeight: 1.15,
						color: 'grey.900',
					}}
				>
					{t('title')}
				</Box>
			</Box>

			{/* The field's band: `position: sticky`, so the browser keeps it in step
			    with the page and nothing here reads the scroll. Full width — the
			    scroller's inset is added back inside — so the rows pass under all of
			    it. Its line appears only once it has arrived at the top and there is
			    something passing under it to divide from. */}
			<Box
				sx={{
					position: 'sticky',
					// under the status bar, whose scrim the shell draws above it
					top: TOOLBAR_SPACER,
					zIndex: 2,
					marginX: -2,
					paddingX: 2,
					paddingY: BAND_PAD,
					marginTop: BAND_PAD,
					bgcolor: 'grey.50',
					borderBottom: '1px solid',
					borderColor: 'transparent',
					'@supports (animation-timeline: scroll())': {
						'@keyframes songsBandPinned': {
							from: { borderBottomColor: 'transparent' },
							to: { borderBottomColor: theme.palette.grey[200] },
						},
						animationName: 'songsBandPinned',
						animationTimeline: 'scroll(nearest block)',
						animationRange: '8px 40px',
						animationFillMode: 'both',
						animationTimingFunction: 'linear',
					},
				}}
			>
				{field}
			</Box>

			<Box sx={{ marginTop: 1.5 }}>
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

			</Box>

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
