/** The popup's preferred width; it never grows past this. */
export const MAX_WIDTH = 600
/** Gap between the popup and whatever it sits next to — anchor or screen edge. */
export const OFFSET = 8

export type PopupPosition = {
	top?: number
	bottom?: number
	left?: number
	right?: number
	/** Cap so the popup grows upwards rather than down into the bottom bar. */
	maxHeight: number
}

type Rect = { top: number; bottom: number; left: number; right: number }
type Viewport = {
	width: number
	height: number
	/**
	 * Height of whatever is docked at the bottom of the screen — the phone's tab
	 * bar. The popup stays clear of it: it is navigation, and navigation is not
	 * something a popup may bury. 0 when there is no dock (desktop).
	 */
	bottomInset?: number
}

/**
 * Where the song picker goes, given its anchor.
 *
 * Pure arithmetic on purpose: this is the whole of the popup's placement, and
 * getting it wrong puts the popup somewhere nobody can see — which is exactly
 * what happened on phones before this was pinned down by tests.
 *
 * Horizontally the popup takes the side of the anchor that has room: an anchor
 * in the left half pins the popup's left edge, one in the right half pins its
 * right edge. Below `MAX_WIDTH` + both gutters there is no such room — the
 * popup already spans the screen — so neither edge can follow the anchor
 * without shoving the other one off, and it is centred instead.
 *
 * Vertically `upDirection` says whether the popup hangs below the anchor's top
 * or rises from its bottom. Either way it stops a gutter short of the bottom
 * dock and of the top of the screen, growing upwards or scrolling rather than
 * running underneath either.
 */
export function getPopupPosition(
	anchor: Rect,
	viewport: Viewport,
	upDirection?: boolean
): PopupPosition {
	const inset = viewport.bottomInset ?? 0
	const floor = inset + OFFSET

	const top = upDirection ? undefined : anchor.top + OFFSET
	const bottom = upDirection
		? Math.max(viewport.height - anchor.bottom + OFFSET, floor)
		: undefined

	const maxHeight =
		bottom === undefined
			? viewport.height - (top ?? 0) - floor
			: viewport.height - bottom - OFFSET

	const vertical = { top, bottom, maxHeight }

	if (viewport.width < MAX_WIDTH + OFFSET * 2) {
		return { ...vertical, left: OFFSET }
	}

	// A zero-width anchor is a point, not a thing with sides — there is no edge
	// of it to line up with, so the popup centres on it. Screens that show the
	// narrow layout without being phone-sized use exactly such a marker, and
	// treating it as an edge put the popup half off the screen.
	const width = Math.min(MAX_WIDTH, viewport.width - OFFSET * 2)
	if (anchor.right === anchor.left) {
		const centred = anchor.left - width / 2
		return {
			...vertical,
			left: Math.round(
				Math.max(OFFSET, Math.min(centred, viewport.width - width - OFFSET))
			),
		}
	}

	if (anchor.left < viewport.width / 2) {
		return {
			...vertical,
			left: Math.min(anchor.left + OFFSET, viewport.width - MAX_WIDTH - OFFSET),
		}
	}

	return {
		...vertical,
		right: Math.max(viewport.width - anchor.right + OFFSET, OFFSET),
	}
}
