'use client'

import { Box, Typography } from '@/common/ui'
import { Pagination } from '@/common/ui/mui'
import { useTranslations } from 'next-intl'

/** Clear of the window's bottom edge, in px — `bottom` in `sx` is a position,
 * not a spacing, so the theme scale does not apply to it. */
const BOTTOM_OFFSET = 24
/** Above the page, below the top bar (10) and the search field (11) — it never
 * reaches either, and the scale in Z_INDEX starts above 100. */
const BAR_Z = 9

/**
 * Where you are in the songbook, floating over the bottom of the window.
 *
 * It used to sit under the list, which on a page of twenty-one songs meant
 * scrolling past all of them to reach it. Floating, it is in the same place
 * however far down the page you have read, and the list keeps the full width
 * of the block.
 *
 * Sticky rather than fixed, and so still part of the page: it comes to rest
 * under the last row instead of covering the footer at the end of the scroll.
 *
 * Compact on purpose: the ends and the pages around the current one, the rest
 * an ellipsis.
 */
export default function CatalogPagination({
	page,
	pagesCount,
	onChange,
}: {
	/** 1-indexed, as the paginator shows it. */
	page: number
	pagesCount: number
	onChange: (page: number) => void
}) {
	const t = useTranslations('songsList')

	if (pagesCount <= 1) return null

	const current = Math.min(page, pagesCount)

	return (
		<Box
			sx={{
				position: 'sticky',
				bottom: BOTTOM_OFFSET,
				zIndex: BAR_Z,
				display: 'flex',
				justifyContent: 'center',
				// the strip itself is only as wide as the bar, so the rows it floats
				// over stay clickable either side of it
				pointerEvents: 'none',
			}}
		>
			<Box
				sx={{
					pointerEvents: 'auto',
					display: 'flex',
					alignItems: 'center',
					gap: 1.5,
					paddingLeft: 2,
					paddingRight: 1,
					paddingY: 0.5,
					borderRadius: 2,
					bgcolor: 'background.paper',
					boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
				}}
			>
				<Typography small color="grey.600">
					{t('pageOf', {
						page: String(current),
						total: String(pagesCount),
					})}
				</Typography>

				<Pagination
					count={pagesCount}
					page={current}
					onChange={(_, next) => onChange(next)}
					siblingCount={1}
					boundaryCount={1}
					size="small"
					color="primary"
					sx={{ '& .MuiPagination-ul': { flexWrap: 'nowrap' } }}
				/>
			</Box>
		</Box>
	)
}
