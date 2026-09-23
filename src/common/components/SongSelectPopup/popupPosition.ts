/** The popup's preferred width; it never grows past this. */
export const MAX_WIDTH = 600
/** Gap between the popup and whatever it sits next to — anchor or screen edge. */
export const OFFSET = 8

export type PopupPosition = {
	top?: number
	bottom?: number
	left?: number
	right?: number
}

type Rect = { top: number; bottom: number; left: number; right: number }
type Viewport = { width: number; height: number }

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
 * or rises from its bottom.
 */
export function getPopupPosition(
	anchor: Rect,
	viewport: Viewport,
	upDirection?: boolean
): PopupPosition {
	const top = upDirection ? undefined : anchor.top + OFFSET
	const bottom = upDirection
		? viewport.height - anchor.bottom + OFFSET
		: undefined

	if (viewport.width < MAX_WIDTH + OFFSET * 2) {
		return { top, bottom, left: OFFSET }
	}

	if (anchor.left < viewport.width / 2) {
		return {
			top,
			bottom,
			left: Math.min(anchor.left + OFFSET, viewport.width - MAX_WIDTH - OFFSET),
		}
	}

	return {
		top,
		bottom,
		right: Math.max(viewport.width - anchor.right + OFFSET, OFFSET),
	}
}
