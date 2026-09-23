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

export type PopupPlacement = {
	/** Rise from the anchor's bottom instead of hanging from its top. */
	upDirection?: boolean
	/**
	 * Place the popup as a sheet: centred at the bottom of the screen, above the
	 * dock, ignoring the anchor.
	 *
	 * The narrow layouts ask for this. There the popup is nearly as wide and as
	 * tall as the screen, so it is not a menu belonging to a button — hanging it
	 * off one squeezed it into whatever room happened to be above, and on a short
	 * list the picker had to scroll with its buttons cut off while half the
	 * screen sat empty. A sheet is the same size and in the same place however
	 * long the list is.
	 */
	asSheet?: boolean
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
 *
 * `asSheet` opts out of anchoring altogether — see `PopupPlacement`.
 */
export function getPopupPosition(
	anchor: Rect,
	viewport: Viewport,
	{ upDirection, asSheet }: PopupPlacement = {}
): PopupPosition {
	const inset = viewport.bottomInset ?? 0
	const floor = inset + OFFSET
	const width = Math.min(MAX_WIDTH, viewport.width - OFFSET * 2)

	// A sheet ignores the anchor: it is the bottom of the screen, centred, as
	// tall as the room above the dock allows. See PopupPlacement.
	if (asSheet) {
		return {
			bottom: floor,
			left: Math.round((viewport.width - width) / 2),
			maxHeight: viewport.height - floor - OFFSET,
		}
	}

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
