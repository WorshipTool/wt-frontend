'use client'

import { Box } from '@/common/ui'
import {
	createContext,
	ReactNode,
	RefObject,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
} from 'react'

// useLayoutEffect warns during SSR; this is the standard isomorphic shim
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * A reusable scroll-driven **morphing** header. Unlike a cross-fade, elements
 * that exist in both the expanded and compact states travel/scale continuously
 * to their target; elements that only exist in one state just fade.
 *
 * Why it's built as a fixed overlay + a top spacer (rather than a header whose
 * height shrinks in the flex column): shrinking a real header hands its height
 * back to the scroller, which shrinks the remaining scroll distance and makes
 * short/medium lists stick part-way. Here the header is an overlay (the
 * scroller's height never changes → no feedback loop), and the room it "gives
 * back" is a `spacerHeight()`-tall spacer the caller puts at the top of the
 * scroll content — it scrolls away under the collapsing header, leaving no dead
 * space at the end of the list.
 *
 * Usage:
 *   <Box ref={scrollRef} sx={{ overflowY: 'auto' }}>
 *     <Box style={{ height: spacerHeight(EXPANDED) }} />   // reserve the hero area
 *     ...content...
 *   </Box>
 *   <CollapsingHeader scrollRef={scrollRef} expandedHeight={210} compactHeight={54}>
 *     <MorphItem to={{ translateY: -120, scale: 0.6 }}>…title…</MorphItem>
 *     <MorphItem to={{ opacity: 0 }}>…cover / subtitle…</MorphItem>   // fade out
 *     <MorphItem from={{ opacity: 0 }} to={{ opacity: 1 }}>…⋮…</MorphItem> // fade in
 *   </CollapsingHeader>
 */

// numeric style props we know how to interpolate
export type MorphStyle = {
	opacity?: number
	scale?: number
	translateX?: number
	translateY?: number
	fontSize?: number
	top?: number
	left?: number
	right?: number
	bottom?: number
	width?: number
	height?: number
	maxWidth?: number
	borderRadius?: number
}
// from/to may depend on the header's measured width (for right-anchored / full-bleed morphs)
type MorphSpec = MorphStyle | ((width: number) => MorphStyle)

const TRANSFORM_KEYS = ['scale', 'translateX', 'translateY'] as const
const PX_KEYS = ['fontSize', 'top', 'left', 'right', 'bottom', 'width', 'height', 'maxWidth', 'borderRadius'] as const

type Registration = {
	el: HTMLElement
	from: MorphSpec
	to: MorphSpec
	origin: string
	/** sub-window of the overall progress this item animates over — e.g. [0, 0.5]
	 * fades/moves fully by half-scroll then holds. Lets the whole header stage its
	 * parts (extras out first, morphs throughout, new bits in last) so it reads as
	 * one coordinated motion rather than every part doing its own thing. */
	range?: [number, number]
}

type Ctx = {
	register: (r: Registration) => () => void
}
const CollapsingHeaderContext = createContext<Ctx | null>(null)

const resolve = (spec: MorphSpec, width: number): MorphStyle =>
	typeof spec === 'function' ? spec(width) : spec

const lerp = (a: number, b: number, p: number) => a + (b - a) * p
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
// one shared easing for every part, so they accelerate and settle together
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// apply the interpolated style (transform for GPU-friendly props, inline for the rest)
function paintItem(r: Registration, rawP: number, width: number) {
	// remap the global progress into this item's window, then ease it
	const [r0, r1] = r.range ?? [0, 1]
	const p = ease(clamp01(r1 > r0 ? (rawP - r0) / (r1 - r0) : rawP))
	const from = resolve(r.from, width)
	const to = resolve(r.to, width)
	const keys = new Set([...Object.keys(from), ...Object.keys(to)]) as Set<keyof MorphStyle>
	const val = (k: keyof MorphStyle, dflt: number) =>
		lerp(from[k] ?? dflt, to[k] ?? from[k] ?? dflt, p)

	let tx = 0
	let ty = 0
	let sc = 1
	let hasTransform = false
	keys.forEach((k) => {
		if ((TRANSFORM_KEYS as readonly string[]).includes(k)) {
			hasTransform = true
			if (k === 'translateX') tx = val('translateX', 0)
			else if (k === 'translateY') ty = val('translateY', 0)
			else if (k === 'scale') sc = val('scale', 1)
		} else if (k === 'opacity') {
			r.el.style.opacity = String(val('opacity', 1))
		} else if ((PX_KEYS as readonly string[]).includes(k)) {
			r.el.style[k as any] = `${val(k, 0)}px`
		}
	})
	if (hasTransform) {
		r.el.style.transformOrigin = r.origin
		r.el.style.transform = `translate(${tx}px, ${ty}px) scale(${sc})`
	}
	// A fading element stops intercepting taps once it's mostly gone. Once it's
	// back we clear the inline value rather than forcing 'auto', so the element's
	// own styling decides: forcing it made decorative items (cover art, subtitle)
	// swallow touch-scroll, and they sit in the header layer with no scrollable
	// ancestor — so dragging on them scrolled nothing at all.
	if (keys.has('opacity')) {
		r.el.style.pointerEvents = val('opacity', 1) > 0.5 ? '' : 'none'
	}
}

export function CollapsingHeader({
	scrollRef,
	expandedHeight,
	compactHeight,
	distance,
	surface = 'grey.50',
	forceCompact = false,
	snap = false,
	children,
}: {
	scrollRef: RefObject<HTMLElement>
	expandedHeight: number
	compactHeight: number
	/** scroll px over which the morph completes; defaults to the height delta so
	 * the content tracks the header's bottom edge exactly. */
	distance?: number
	surface?: string
	/** pin the header in its fully-collapsed state (e.g. a detail sub-view). */
	forceCompact?: boolean
	/** when the user stops scrolling mid-morph, glide the scroll to the nearest
	 * end so the header never rests half-collapsed (the morph still plays while
	 * dragging — only the resting state snaps). */
	snap?: boolean
	children: ReactNode
}) {
	const rootRef = useRef<HTMLDivElement>(null)
	const bgRef = useRef<HTMLDivElement>(null)
	const regs = useRef<Set<Registration>>(new Set())
	const lastP = useRef(forceCompact ? 1 : 0)
	const dist = distance ?? expandedHeight - compactHeight

	const ctx = useRef<Ctx>({
		register: (r) => {
			regs.current.add(r)
			// paint the newcomer at the current progress so a late-mounting item
			// never flashes its unstyled default before the next scroll frame
			paintItem(r, lastP.current, rootRef.current?.clientWidth ?? 0)
			return () => regs.current.delete(r)
		},
	})

	// paint every registered item + the header background for a given progress
	const paint = (p: number) => {
		lastP.current = p
		const width = rootRef.current?.clientWidth ?? 0
		// expose progress so inner bits (e.g. a button's label) can react in CSS
		rootRef.current?.style.setProperty('--collapse-p', String(p))
		regs.current.forEach((r) => paintItem(r, p, width))
		if (bgRef.current) {
			bgRef.current.style.height = `calc(env(safe-area-inset-top) + ${lerp(expandedHeight, compactHeight, p)}px)`
			bgRef.current.style.boxShadow = p > 0.96 ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
		}
	}

	// initial paint (and re-paint when forceCompact flips) — layout effect avoids a flash
	useIsoLayoutEffect(() => {
		paint(forceCompact ? 1 : 0)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [forceCompact, expandedHeight, compactHeight])

	useEffect(() => {
		if (forceCompact) {
			paint(1)
			return
		}
		const scroller = scrollRef.current
		if (!scroller) return
		let raf = 0
		let idle: ReturnType<typeof setTimeout> | undefined
		const run = () => {
			raf = 0
			paint(Math.min(1, Math.max(0, scroller.scrollTop / dist)))
		}
		// once scrolling settles inside the morph zone, glide to the nearer end
		const snapToNearest = () => {
			const st = scroller.scrollTop
			if (st <= 0 || st >= dist) return // already at an end (or past, in the list)
			const reachable = scroller.scrollHeight - scroller.clientHeight >= dist
			const target = st < dist / 2 || !reachable ? 0 : dist
			scroller.scrollTo({ top: target, behavior: 'smooth' })
		}
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(run)
			if (snap) {
				if (idle) clearTimeout(idle)
				idle = setTimeout(snapToNearest, 130)
			}
		}
		scroller.addEventListener('scroll', onScroll, { passive: true })
		run()
		return () => {
			if (idle) clearTimeout(idle)
			scroller.removeEventListener('scroll', onScroll)
			if (raf) cancelAnimationFrame(raf)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [forceCompact, dist, expandedHeight, compactHeight, snap])

	// re-apply on width change so width-dependent morphs (right-anchored / full-bleed) stay correct
	useEffect(() => {
		const root = rootRef.current
		if (!root || typeof ResizeObserver === 'undefined') return
		const ro = new ResizeObserver(() => paint(lastP.current))
		ro.observe(root)
		return () => ro.disconnect()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<CollapsingHeaderContext.Provider value={ctx.current}>
			<Box
				ref={rootRef}
				sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 6, pointerEvents: 'none' }}
			>
				{/* the header surface — its height interpolates so content below it is
				    revealed as it collapses */}
				<Box
					ref={bgRef}
					style={{ height: `calc(env(safe-area-inset-top) + ${forceCompact ? compactHeight : expandedHeight}px)` }}
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bgcolor: surface,
						borderBottom: '1px solid',
						borderColor: 'grey.200',
					}}
				/>
				{/* morphing children get pointer events back individually */}
				<Box sx={{ position: 'relative', pointerEvents: 'none' }}>{children}</Box>
			</Box>
		</CollapsingHeaderContext.Provider>
	)
}

/**
 * One morphing element. It's absolutely positioned inside the header at its
 * expanded spot (via `sx`); `from`/`to` describe how it interpolates as the
 * header collapses. Interactive elements should set `pointerEvents: 'auto'` in
 * `sx` (the header layer disables them by default so gaps stay click-through).
 */
export function MorphItem({
	from = {},
	to,
	origin = 'top left',
	range,
	sx,
	onClick,
	children,
}: {
	from?: MorphSpec
	to: MorphSpec
	origin?: string
	/** sub-window of overall progress to animate over, e.g. [0, 0.5]. */
	range?: [number, number]
	sx?: any
	onClick?: () => void
	children: ReactNode
}) {
	const ctx = useContext(CollapsingHeaderContext)
	const ref = useRef<HTMLDivElement>(null)
	useIsoLayoutEffect(() => {
		if (!ctx || !ref.current) return
		return ctx.register({ el: ref.current, from, to, origin, range })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ctx])
	return (
		<Box ref={ref} onClick={onClick} sx={{ position: 'absolute', ...sx }}>
			{children}
		</Box>
	)
}
