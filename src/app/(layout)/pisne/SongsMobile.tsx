'use client'

import { mapBasicVariantPackApiToDto } from '@/api/dtos/song/song.map'
import { GetListSongData } from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
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
import { Fragment, useEffect, useMemo, useState } from 'react'

const PREVIEW_LINES = 1
// small alphabetical section label above each letter's group card
const LETTER_HEADER_SX = {
	paddingLeft: 0.5,
	paddingTop: 0.5,
	paddingBottom: 0.5,
} as const

// first letter of a song title, upper-cased for the section header
const firstLetter = (title: string) =>
	(title.trim().charAt(0) || '#').toLocaleUpperCase('cs')

type SongsMobileProps = {
	/** 1-indexed page, kept in the URL by the parent (shared with desktop) */
	page: number
	onPageChange: (page: number) => void
	count: number
	/** Page size, owned by the page so mobile and desktop agree on what `?s=` means */
	perPage: number
}

/**
 * Native-feeling mobile songs list, built on the shared MobileAppHeader
 * app-shell (collapsing title, only the content scrolls, paginator pinned in a
 * quiet bottom panel — see docs/design/MOBILE.md). The songs of the current
 * page are grouped by first letter; there are thousands of songs, so paging
 * beats an endless scroll. The desktop grid stays in page.tsx.
 */
export default function SongsMobile({
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

	// split the current page's songs into consecutive first-letter sections so
	// each new starting letter gets a header — kept entirely within the page
	// (the backend returns the list alphabetically sorted)
	const letterGroups = useMemo(() => {
		const groups: { letter: string; items: GetListSongData[] }[] = []
		for (const s of items) {
			const letter = firstLetter(s.main.title)
			const last = groups[groups.length - 1]
			if (last && last.letter === letter) last.items.push(s)
			else groups.push({ letter, items: [s] })
		}
		return groups
	}, [items])

	useEffect(() => {
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
	}, [page, perPage, songGettingApi, reloadKey])

	const paginator =
		!error && pagesCount > 1 ? (
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
			bottomPanel={paginator}
			scrollResetKey={page}
		>
			{loading ? (
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
