'use client'

import { Box, Typography } from '@/common/ui'
import { Pagination } from '@/common/ui/mui'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'

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
 * Two rules at once: it keeps the bottom edge of the window, and it never
 * covers the footer. Fixed gives the first and breaks the second at the end of
 * the scroll; sticky gives the second and lets go of the edge as soon as the
 * page's block ends, which is a good stretch above the footer. So it is fixed,
 * and rides up over the last stretch to stay above the end of the page — which
 * is where the footer begins. The measuring is one rect per animation frame,
 * written straight to the element, so the page never re-renders for it.
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
	const barRef = useRef<HTMLDivElement>(null)
	const endRef = useRef<HTMLDivElement>(null)

	// The bar holds the window's bottom edge until the end of the page comes up
	// to meet it, and then rides with it — so it is never over the footer that
	// follows. A phone has no footer under its scroller and stays sticky.
	useEffect(() => {
		if (touch) return
		let raf = 0
		const paint = () => {
			raf = 0
			const bar = barRef.current
			const end = endRef.current
			if (!bar || !end) return
			const pageEnd = end.getBoundingClientRect().bottom
			const bottom = Math.max(BOTTOM_OFFSET, window.innerHeight - pageEnd)
			bar.style.bottom = `${Math.round(bottom)}px`
		}
		const schedule = () => {
			if (!raf) raf = requestAnimationFrame(paint)
		}
		window.addEventListener('scroll', schedule, { passive: true })
		window.addEventListener('resize', schedule)
		// …and when the page itself grows or shrinks under it: a list that arrives
		// after the first paint moves the end of the page without any scrolling,
		// and the bar would otherwise keep the place it measured while empty
		const observer = new ResizeObserver(schedule)
		observer.observe(document.body)
		paint()
		return () => {
			window.removeEventListener('scroll', schedule)
			window.removeEventListener('resize', schedule)
			observer.disconnect()
			if (raf) cancelAnimationFrame(raf)
		}
	}, [touch, pagesCount])

	if (pagesCount <= 1) return null

	const current = Math.min(page, pagesCount)
	const offset = touch ? TOUCH_BOTTOM_OFFSET : BOTTOM_OFFSET

	return (
		<>
			<Box
				ref={barRef}
				sx={{
					// On a phone the shell's scroller ends at the tab bar with no footer
					// under it, so sticky is the whole answer there.
					position: touch ? 'sticky' : 'fixed',
					bottom: offset,
					...(touch ? {} : { left: 0, right: 0 }),
					zIndex: BAR_Z,
					display: 'flex',
					justifyContent: 'center',
					// the strip itself is only as wide as the bar, so whatever it floats
					// over stays clickable either side of it
					pointerEvents: 'none',
				}}
			>
				<Box
					sx={{
						pointerEvents: 'auto',
						display: 'flex',
						alignItems: 'center',
						gap: 2,
						// the label is what the left padding is for; without it the bar is
						// the numbers and nothing else
						paddingLeft: touch ? 0.5 : 2.5,
						paddingRight: touch ? 0.5 : 1.5,
						paddingY: touch ? 0.5 : 1,
						borderRadius: 2.5,
						bgcolor: 'background.paper',
						boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
					}}
				>
					{/* on a phone the bar is only as wide as the screen, and the
				    highlighted number says the same thing */}
					{!touch && (
						<Typography color="grey.600">
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
						size="medium"
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

			{/* The end of the page, which is what the bar stops at — and the air it
			    stops in, so the last row is never under it. It takes whatever height
			    the block has left over (the block is at least a screen tall), so its
			    bottom edge is the end of the page rather than the end of the list. */}
			<Box
				ref={endRef}
				sx={{
					minHeight: `${Math.max(0, offset) + RESTING_AIR}px`,
					flexShrink: 0,
					...(touch ? {} : { flexGrow: 1 }),
				}}
			/>
		</>
	)
}
