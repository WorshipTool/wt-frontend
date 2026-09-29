'use client'

import {
	MOBILE_NAV_BREAKPOINT,
	MOBILE_NAV_CLEARANCE,
	SHORT_VIEWPORT,
} from '@/common/components/MobileAppTabBar/nav.constants'
import { useClientPathname } from '@/hooks/pathname/useClientPathname'
import { hasInAppHistory } from '@/routes/history/inAppHistory'
import {
	LARGE_TITLE_COMPACT_REM,
	LARGE_TITLE_REM,
	largeTitleSx,
	TOUCH_TARGET,
} from '@/common/constants/layout'
import { Box, IconButton, Typography, useTheme } from '@/common/ui'
import { RoutesKeys, SmartAllParams } from '@/routes/routes.types'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { ArrowBackRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useLayoutEffect, useRef } from 'react'

/** Status-bar / notch clearance. Exported so a screen that owns its own top
 * (one with no header row) can inset itself the same way the header does. */
export const TOOLBAR_SPACER = 'env(safe-area-inset-top)'
// how far you scroll before the title finishes shrinking to its compact size
const SHRINK_DISTANCE = 64
// sits above the scrolling content, below the app's overlays/popups (Z_INDEX.OVERLAY = 1300)
const HEADER_Z = 100
/** Resting top padding of the header block, above the safe-area inset. */
const HEADER_TOP_PAD = 12
/** How long the title takes to fold away when a control takes the header over. */
const COLLAPSE_MS = 240
/** Enough for a title and a subtitle; the row is shorter than this in practice,
 * and an explicit length is what a transition needs to animate from. */
const TITLE_ROW_MAX_HEIGHT = 96
/** The header block's bottom padding in px — mirrors its `paddingBottom: 1`. A
 * header that is only a control panel uses it on both sides, so the panel sits
 * evenly between the two edges instead of under a large title's roomier top. */
const HEADER_BOTTOM_PAD = 8

/**
 * Where each screen was left, so coming back to it does not start at the top.
 * Module state rather than session storage: it is meant to last as long as the
 * tab does and no longer, which is exactly what a reload should forget.
 */
const scrollMemory = new Map<string, number>()

// useLayoutEffect warns during SSR; this is the standard isomorphic shim
const useIsoLayoutEffect =
	typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** How long a restored position keeps re-applying while the list arrives. */
const RESTORE_WINDOW_MS = 1500

/** The header's top padding on a phone held sideways — see `SHORT_VIEWPORT`. */
const SHORT_HEADER_PAD = 6

type MobileAppHeaderProps<T extends RoutesKeys> = {
	/** The page title — large at rest, shrinks to a compact bar on scroll.
	 * Omit it on a screen that brings its own hero (home): the header row is then
	 * skipped entirely and the content starts at the top of the shell. */
	title?: string
	/**
	 * Generic secondary line under the title. A string gets the default muted
	 * style; pass any node (count, status, chip, meta …) to fully control it.
	 */
	subtitle?: ReactNode
	/**
	 * Hierarchical parent route. When set, an Up (back) control appears inline to
	 * the left of the title and is history-aware (in-app history if present, else
	 * navigate to this parent). Omit on tab-root pages (Domů / Písně / Účet).
	 */
	backTo?: T
	backParams?: SmartAllParams<T>
	/** Up to 2 icon actions shown to the right of the title. Extras are ignored. */
	actions?: ReactNode[]
	/** Optional control strip (segment / chips / a search field) inside the header
	 * block, under the title. Pass it without a title and the header is only the
	 * strip — pinned above the scroller, so it cannot be scrolled away. */
	controlPanel?: ReactNode
	/** Folds the title row away, leaving the control strip as the whole header.
	 * For a screen whose control takes over — the catalog's field, once you are
	 * searching with it. It folds rather than vanishing, so the strip rides up to
	 * the top instead of jumping there. */
	collapseTitle?: boolean
	/** Optional panel pinned above the bottom tab bar (e.g. pagination). */
	bottomPanel?: ReactNode
	/**
	 * Height to keep free below the scrolling content, for something that floats
	 * there and is not the tab bar — the song page's dock.
	 *
	 * It shortens the scroller instead of padding it, and that is the whole
	 * point: padding only clears the *end* of the content, so the dock still lay
	 * across whatever line you happened to stop on. Room taken here is room the
	 * content never occupies.
	 */
	bottomInset?: number | string
	/** When this value changes, the content scrolls back to the top (e.g. on page change). */
	scrollResetKey?: string | number
	/** Surface (and header) background — palette path. Defaults to the grey app
	 * canvas; a white reading surface (song page) passes 'background.paper'. */
	surface?: string
	/** Persistent hairline under the header. Off by default, in which case a
	 * hairline fades in as content scrolls beneath the header instead. */
	divider?: boolean
	/** The page body (the scrolling content below the header). */
	children?: ReactNode
}

/**
 * Native-feeling mobile screen shell with a collapsing large-title header, built
 * as a proper app shell: the header (+ optional control strip) stay pinned at the
 * top, an optional panel + the tab bar stay at the bottom — only the middle
 * content scrolls, so the scrollbar is confined to the content.
 *
 * At rest the header is a single row — back arrow, large title (+ subtitle) and
 * up to two action icons. As the content scrolls the title smoothly shrinks to a
 * compact bar (Material large → small), painted imperatively via refs so the
 * page body never re-renders while scrolling.
 *
 * Renders only on phones (< MOBILE_NAV_BREAKPOINT); hidden on desktop via CSS.
 */
export default function MobileAppHeader<T extends RoutesKeys>({
	title,
	subtitle,
	backTo,
	backParams,
	actions,
	controlPanel,
	collapseTitle = false,
	bottomPanel,
	bottomInset,
	scrollResetKey,
	surface = 'grey.50',
	divider = false,
	children,
}: MobileAppHeaderProps<T>) {
	const theme = useTheme()
	const tCommon = useTranslations('common')
	const router = useRouter()
	const navigate = useSmartNavigate()

	const scrollRef = useRef<HTMLDivElement>(null)
	const headerRef = useRef<HTMLDivElement>(null)
	const titleRef = useRef<HTMLDivElement>(null)
	const subtitleRef = useRef<HTMLDivElement>(null)

	const shownActions = actions?.slice(0, 2) ?? []

	/** Which screen's scroll position this is. */
	const memoryKey = useClientPathname() ?? ''

	// Continuously shrink the title (and fade the subtitle) as the content
	// scrolls — imperative so the list underneath never re-renders while scrolling.
	useEffect(() => {
		const scroller = scrollRef.current
		if (!scroller) return
		let raf = 0
		const paint = () => {
			raf = 0
			const p = Math.min(1, Math.max(0, scroller.scrollTop / SHRINK_DISTANCE))
			if (titleRef.current) {
				titleRef.current.style.fontSize = `${
					LARGE_TITLE_REM - (LARGE_TITLE_REM - LARGE_TITLE_COMPACT_REM) * p
				}rem`
			}
			if (subtitleRef.current) {
				subtitleRef.current.style.opacity = String(Math.max(0, 1 - p * 1.6))
				subtitleRef.current.style.maxHeight = `${(1 - p) * 24}px`
			}
			if (headerRef.current) {
				// with no persistent divider, fade a hairline in as content scrolls under
				if (!divider) {
					headerRef.current.style.borderBottomColor = `rgba(0, 0, 0, ${0.08 * p})`
				}
				headerRef.current.style.boxShadow =
					p > 0.9 ? `0 2px 8px rgba(0, 0, 0, 0.05)` : 'none'
			}
		}
		const schedule = () => {
			if (!raf) raf = requestAnimationFrame(paint)
		}
		scroller.addEventListener('scroll', schedule, { passive: true })
		paint()
		return () => {
			scroller.removeEventListener('scroll', schedule)
			if (raf) cancelAnimationFrame(raf)
		}
	}, [divider])

	// Scroll back to the top when the reset key *changes* (e.g. paginator page
	// change) — not when the screen mounts holding one. A fresh mount is at the
	// top already, and the screen may be coming back to a remembered position,
	// which this used to wipe a frame after it was restored.
	const lastResetKey = useRef(scrollResetKey)
	useEffect(() => {
		if (lastResetKey.current === scrollResetKey) return
		lastResetKey.current = scrollResetKey
		scrollRef.current?.scrollTo({ top: 0 })
	}, [scrollResetKey])

	/**
	 * Where this screen was left, put back when it opens again.
	 *
	 * The shell scrolls a box of its own rather than the document, so the
	 * browser's scroll restoration has nothing to restore: reading the catalog
	 * 450px down, opening a song and coming back put you at the top of a screen
	 * you had already read.
	 *
	 * Recording and restoring are one effect because they race. The list is
	 * usually still arriving when the screen mounts, so the position has to be
	 * re-applied while the content grows under it — and each of those attempts
	 * lands at 0 on an empty page and fires a scroll event, which the recorder
	 * would take for the user scrolling to the top and write over the very
	 * position being restored. So nothing is recorded until the restore is done,
	 * and touching the screen ends it early, because then the position is yours.
	 */
	useIsoLayoutEffect(() => {
		const scroller = scrollRef.current
		if (!scroller) return

		const wanted = scrollMemory.get(memoryKey) ?? 0
		let restoring = wanted > 0

		const remember = () => {
			if (!restoring) scrollMemory.set(memoryKey, scroller.scrollTop)
		}
		scroller.addEventListener('scroll', remember, { passive: true })

		let frame = 0
		let giveUp: ReturnType<typeof setTimeout> | undefined

		const finish = () => {
			restoring = false
			if (frame) cancelAnimationFrame(frame)
			frame = 0
			if (giveUp) clearTimeout(giveUp)
			scroller.removeEventListener('touchstart', finish)
			scroller.removeEventListener('wheel', finish)
		}

		if (restoring) {
			// A frame at a time rather than on a resize: the list grows by rows
			// deep inside the scroller, where an observer on the box itself never
			// hears about it — the first attempt reached a third of the way down a
			// page that was still filling.
			const apply = () => {
				frame = 0
				if (!restoring) return
				scroller.scrollTop = wanted
				if (Math.abs(scroller.scrollTop - wanted) < 2) return finish()
				frame = requestAnimationFrame(apply)
			}
			apply()
			giveUp = setTimeout(finish, RESTORE_WINDOW_MS)
			scroller.addEventListener('touchstart', finish, { passive: true })
			scroller.addEventListener('wheel', finish, { passive: true })
		}

		return () => {
			const keep = !restoring
			finish()
			if (keep) scrollMemory.set(memoryKey, scroller.scrollTop)
			scroller.removeEventListener('scroll', remember)
		}
	}, [memoryKey])

	const goUp = () => {
		if (!backTo) return
		if (hasInAppHistory()) router.back()
		else navigate(backTo, (backParams ?? {}) as SmartAllParams<T>)
	}

	const hasTitleRow = Boolean(title || backTo || shownActions.length > 0)
	const titleRowShown = hasTitleRow && !collapseTitle
	// nothing to put in the header block — the screen draws its own top instead
	const hasHeaderRow = Boolean(hasTitleRow || controlPanel)

	return (
		<Box
			sx={{
				// App-shell surface filling the viewport down to the tab bar: header
				// and panels stay pinned, only the content region scrolls.
				//
				// Always fixed, never in flow. An in-flow shell contributes its height
				// to the document, so the page itself could also scroll — giving two
				// stacked scrollers. Dragging anywhere the inner one didn't handle
				// (the header, or the content once it hit its end) scrolled the
				// document instead and carried the whole shell, header included, off
				// the top of the screen. Fixed means there is nothing to scroll but
				// the content region.
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				// Down to the very bottom: the content region runs under the tab bar
				// and pads itself for it, rather than the shell stopping above the
				// bar. Stopping short left a strip of surface between the last row
				// and the bar with nothing in it — and, while the shell ended at the
				// clearance (which overshoots the bar on purpose), a strip of the
				// page's own background under that.
				bottom: 0,
				zIndex: 2,
				bgcolor: surface,
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
				[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { display: 'none' },
			}}
		>
			{/* header — a compact row (back · title · actions); the title shrinks on
			    scroll (see effect above) */}
			{hasHeaderRow && (
			<Box
				ref={headerRef}
				sx={{
					flexShrink: 0,
					zIndex: HEADER_Z,
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					paddingTop: `calc(${TOOLBAR_SPACER} + ${
						titleRowShown ? HEADER_TOP_PAD : HEADER_BOTTOM_PAD
					}px)`,
					paddingBottom: 1,
					transition: `padding-top ${COLLAPSE_MS}ms ease`,
					// sideways the header gives back what it can: the collapse's own
					// difference is 4px, and there is no room here for either value
					[SHORT_VIEWPORT]: {
						paddingTop: `calc(${TOOLBAR_SPACER} + ${SHORT_HEADER_PAD}px)`,
						paddingBottom: 0.5,
					},
					bgcolor: surface,
					borderBottom: '1px solid',
					borderColor: divider ? 'grey.200' : 'transparent',
				}}
			>
				{hasTitleRow && (
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 0.5,
						paddingX: 1.5,
						// folded away rather than unmounted, so the strip below rides up
						// to the top instead of jumping there
						overflow: 'hidden',
						maxHeight: collapseTitle ? 0 : TITLE_ROW_MAX_HEIGHT,
						opacity: collapseTitle ? 0 : 1,
						transition: `max-height ${COLLAPSE_MS}ms ease, opacity ${
							COLLAPSE_MS / 2
						}ms ease`,
					}}
				>
					{backTo && (
						<IconButton
							onClick={goUp}
							alt={tCommon('back')}
							color="grey.800"
							sx={{
								marginLeft: -0.5,
								flexShrink: 0,
								// the house IconButton puts `sx` on the box around the button,
								// so the size has to be asked for by name
								'& .MuiIconButton-root': {
									width: TOUCH_TARGET,
									height: TOUCH_TARGET,
								},
							}}
						>
							<ArrowBackRounded />
						</IconButton>
					)}
					<Box
						sx={{
							flex: 1,
							minWidth: 0,
							// keep the header the same height on every page: match the
							// back-arrow / action buttons even when the title is the only
							// thing in the row, so a title-only header (Seznam, Účet)
							// doesn't collapse shorter than pages that have controls
							minHeight: TOUCH_TARGET,
							[SHORT_VIEWPORT]: { minHeight: 36 },
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							paddingLeft: backTo ? 0 : 0.5,
						}}
					>
						<Box
							ref={titleRef}
							sx={{
								...largeTitleSx,
								fontSize: `${LARGE_TITLE_REM}rem`,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}}
						>
							{title}
						</Box>
						{subtitle && (
							<Box ref={subtitleRef} sx={{ overflow: 'hidden', marginTop: 0.25 }}>
								{typeof subtitle === 'string' ? (
									<Typography small strong={500} color="grey.600">
										{subtitle}
									</Typography>
								) : (
									subtitle
								)}
							</Box>
						)}
					</Box>
					{shownActions.length > 0 && (
						<Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
							{shownActions.map((a, i) => (
								<Box key={i} sx={{ display: 'flex' }}>
									{a}
								</Box>
							))}
						</Box>
					)}
				</Box>
				)}

				{/* control strip — inside the header block so it shares the header
				    background (one solid white zone above the bottom divider) */}
				{controlPanel && (
					<Box
						sx={{
							paddingX: 2,
							paddingTop: titleRowShown ? 1 : 0,
							transition: `padding-top ${COLLAPSE_MS}ms ease`,
						}}
					>
						{controlPanel}
					</Box>
				)}
			</Box>
			)}

			{/* Status-bar scrim for a screen with no header row: its content starts at
			    the very top, so without this it would show through the status bar as
			    it scrolls past. Above the content, below anything the screen sticks
			    to the top itself. */}
			{!hasHeaderRow && (
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: TOOLBAR_SPACER,
						bgcolor: surface,
						zIndex: HEADER_Z,
						pointerEvents: 'none',
					}}
				/>
			)}

			{/* the only scroller — scrollbar confined between the header/panels */}
			<Box
				ref={scrollRef}
				sx={{
					flex: 1,
					minHeight: 0,
					overflowY: 'auto',
					overflowX: 'hidden',
					paddingX: 2,
					// with no header row the screen owns its own top inset, so it can
					// stick something (home's search bar) right under the status bar
					paddingTop: hasHeaderRow ? 0.5 : 0,
					// room for the bar the content scrolls under — the bar's own
					// height, not the clearance, which is deliberately more than that
					// and would leave a gap at the end of the scroll. A panel of its
					// own below takes that room instead.
					paddingBottom:
						bottomPanel || bottomInset
							? 2
							: 'calc(env(safe-area-inset-bottom) + var(--mobile-nav-bar-height))',
				}}
			>
				{children}
			</Box>

			{/* room reserved for something that floats above the tab bar without
			    being part of the shell (the song dock). Empty on purpose: it is
			    space, not a panel. */}
			{!bottomPanel && Boolean(bottomInset) && (
				<Box
					aria-hidden
					sx={{
						flexShrink: 0,
						height:
							typeof bottomInset === 'number'
								? `${bottomInset}px`
								: bottomInset,
						marginBottom: MOBILE_NAV_CLEARANCE,
					}}
				/>
			)}

			{/* optional panel pinned above the bottom tab bar (e.g. pagination).
			    Must stay BELOW the tab bar so its raised center action (the
			    "Hledat" button that pokes up over the bar) renders in front. */}
			{bottomPanel && (
				<Box
					sx={{
						flexShrink: 0,
						// the shell reaches the bottom of the window now, so the panel
						// keeps itself clear of the bar
						marginBottom: MOBILE_NAV_CLEARANCE,
						zIndex: 1,
						bgcolor: 'background.paper',
						borderTop: '1px solid',
						borderColor: 'grey.200',
						boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
						display: 'flex',
						justifyContent: 'center',
						paddingY: 0.5,
					}}
				>
					{bottomPanel}
				</Box>
			)}
		</Box>
	)
}
