'use client'

import { Box, Typography } from '@/common/ui'
import { Pagination } from '@/common/ui/mui'
import { useTranslations } from 'next-intl'

/** Clear of the bottom of the scroll, in px — `bottom` in `sx` is a position,
 * not a spacing, so the theme scale does not apply to it. */
const BOTTOM_OFFSET = 24
/** On a phone the bar rides right above the tab bar: the scroller pads itself
 * for the bar, and a sticky offset is measured inside that padding, so this is
 * the gap between the two. */
const TOUCH_BOTTOM_OFFSET = 8
/** Air under the bar where it comes to rest, so the last row clears it. */
const RESTING_AIR = 8
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
	touch = false,
}: {
	/** 1-indexed, as the paginator shows it. */
	page: number
	pagesCount: number
	onChange: (page: number) => void
	/** Finger-sized targets and fewer of them — for the phone. */
	touch?: boolean
}) {
	const t = useTranslations('songsList')

	if (pagesCount <= 1) return null

	const current = Math.min(page, pagesCount)
	const offset = touch ? TOUCH_BOTTOM_OFFSET : BOTTOM_OFFSET

	return (
		<>
			<Box
				sx={{
					position: 'sticky',
					bottom: offset,
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
						// the label is what the left padding is for; without it the bar is
						// the numbers and nothing else
						paddingLeft: touch ? 0.5 : 2,
						paddingRight: touch ? 0.5 : 1,
						paddingY: 0.5,
						borderRadius: 2,
						bgcolor: 'background.paper',
						boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
					}}
				>
					{/* on a phone the bar is only as wide as the screen, and the
				    highlighted number says the same thing */}
					{!touch && (
						<Typography small color="grey.600">
							{t('pageOf', {
								page: String(current),
								total: String(pagesCount),
							})}
						</Typography>
					)}

					<Pagination
						count={pagesCount}
						page={current}
						onChange={(_, next) => onChange(next)}
						siblingCount={touch ? 0 : 1}
						boundaryCount={1}
						size={touch ? 'medium' : 'small'}
						color="primary"
						sx={{
							'& .MuiPagination-ul': { flexWrap: 'nowrap' },
							...(touch && {
								'& .MuiPaginationItem-root': {
									minWidth: 40,
									height: 40,
									margin: '0 1px',
									fontSize: '0.95rem',
								},
							}),
						}}
					/>
				</Box>
			</Box>

			{/* the bar's own room at the end of the scroll: without it the last row
			    stays under the bar, which never reaches its place in the flow */}
			<Box
				sx={{ height: `${Math.max(0, offset) + RESTING_AIR}px`, flexShrink: 0 }}
			/>
		</>
	)
}
