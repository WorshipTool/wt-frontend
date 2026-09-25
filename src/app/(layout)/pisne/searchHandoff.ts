'use client'

/**
 * The passage from home's field to the catalog's — the caret, and the place the
 * field stood.
 *
 * Home is a door: type in its field and the catalog opens with what you typed.
 * The two fields are different elements on different screens, so neither the
 * caret nor the field's position survives the navigation by itself — the one you
 * were typing into disappears, and on a phone the keyboard goes with it.
 *
 * So home says it is handing over, and the catalog takes both when it arrives:
 * the caret, so the word can be finished, and the rect, so its own field starts
 * life where home's was and travels to its place instead of appearing in it.
 *
 * A flag in the module rather than in the URL: it lives exactly as long as the
 * navigation does. A shared or reloaded link starts a new module and finds
 * nothing here, which is what should happen — arriving at someone else's search
 * should show the results, not open a keyboard over them and fly a field in.
 */

/** Where a field stood, in window coordinates. */
export type FieldRect = {
	top: number
	left: number
	width: number
	height: number
}

let handingOver = false
let fromRect: FieldRect | null = null

/**
 * Called by the screen that navigates to the catalog while you are typing.
 *
 * @param from the field being left behind, if it should be flown across
 */
export function handOffSearchFocus(from?: Element | null) {
	handingOver = true
	const rect = from?.getBoundingClientRect()
	fromRect = rect
		? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
		: null
}

/** Read once by the catalog when it arrives; false for every other arrival. */
export function consumeSearchFocus(): boolean {
	const was = handingOver
	handingOver = false
	return was
}

/**
 * Read once by the catalog's field, in the layout pass before its first paint.
 * Separate from the caret above because the two are wanted at different moments:
 * the geometry before that paint, the caret after it.
 */
export function consumeSearchFieldRect(): FieldRect | null {
	const rect = fromRect
	fromRect = null
	return rect
}
