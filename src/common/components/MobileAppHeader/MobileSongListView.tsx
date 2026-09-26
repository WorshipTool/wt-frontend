'use client'

import { BasicVariantPack } from '@/api/dtos'
import { MobileAppHeader } from '@/common/components/MobileAppHeader'
import {
	GroupRowsSkeleton,
	ListStateView,
	SongGroup,
} from '@/common/ui/GroupList'
import { Pagination } from '@/common/ui/mui'
import { RoutesKeys, SmartAllParams } from '@/routes/routes.types'
import { MusicNoteRounded } from '@mui/icons-material'
import { ReactNode, useEffect, useMemo, useState } from 'react'
const PREVIEW_LINES = 1
const SKELETON_ROWS = 8

type MobileSongListViewProps<T extends RoutesKeys> = {
	title: string
	subtitle?: ReactNode
	backTo?: T
	backParams?: SmartAllParams<T>
	actions?: ReactNode[]
	controlPanel?: ReactNode
	items: BasicVariantPack[]
	loading?: boolean
	emptyText?: string
	/** When set, the list is paginated client-side and a paginator is pinned
	 * above the tab bar (there can be thousands of songs). */
	perPage?: number
}

/**
 * Shared mobile screen for a list of songs: the collapsing MobileAppHeader plus
 * an S5 grouped list of tappable song rows (leading note icon + disclosure
 * chevron). Used by the account song-list pages (Moje písně, Oblíbené) so they
 * share one native-feeling layout.
 */
export default function MobileSongListView<T extends RoutesKeys>({
	title,
	subtitle,
	backTo,
	backParams,
	actions,
	controlPanel,
	items,
	loading,
	emptyText,
	perPage,
}: MobileSongListViewProps<T>) {
	const [page, setPage] = useState(1)
	const pageCount = perPage ? Math.max(1, Math.ceil(items.length / perPage)) : 1
	useEffect(() => {
		setPage((p) => Math.min(p, pageCount))
	}, [pageCount])

	const pageItems = useMemo(
		() => (perPage ? items.slice((page - 1) * perPage, page * perPage) : items),
		[items, perPage, page]
	)

	const paginator =
		perPage && pageCount > 1 ? (
			<Pagination
				count={pageCount}
				page={Math.min(page, pageCount)}
				onChange={(_, p) => setPage(p)}
				siblingCount={0}
				boundaryCount={1}
				sx={{
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
			title={title}
			subtitle={subtitle}
			backTo={backTo}
			backParams={backParams}
			actions={actions}
			controlPanel={controlPanel}
			bottomPanel={paginator}
			scrollResetKey={page}
		>
			{loading ? (
				<GroupRowsSkeleton rows={SKELETON_ROWS} withIcon />
			) : items.length === 0 ? (
				<ListStateView
					icon={<MusicNoteRounded fontSize="inherit" />}
					message={emptyText ?? ''}
				/>
			) : (
				<SongGroup songs={pageItems} previewLines={PREVIEW_LINES} />
			)}
		</MobileAppHeader>
	)
}
