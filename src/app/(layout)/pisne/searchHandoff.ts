'use client'

/**
 * Everything that has to survive the trip to the catalog's search field: the
 * caret, the place the field it came from stood, and the keyboard.
 *
 * The first two belong to home, below. The third belongs to the Hledat tab, at
 * the bottom of this file.
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

// ---- the keyboard, for search asked for from the tab bar -------------------

/**
 * A phone opens its keyboard for the tap that asked for it and for nothing
 * else. Focus given from an effect — which is the earliest the catalog's field
 * exists, a navigation after the tap — moves the caret and leaves the keyboard
 * shut, so tapping Hledat landed you in a field you then had to tap again.
 *
 * So the tap focuses a field itself, while it still counts as a tap. If the
 * catalog is already the screen you are on, that is its own field. If it is not,
 * it is a stand-in — one pixel of input with nothing in it — and the real field
 * takes the caret from it on arrival: moving focus between two fields leaves the
 * keyboard up, letting go of the last one is what closes it.
 */
let liveField: HTMLInputElement | null = null
let standIn: HTMLInputElement | null = null
let standInTimer = 0

/** How long the stand-in holds the keyboard open waiting for the catalog. A
 * navigation that never lands must not leave a focused nothing behind. */
const STAND_IN_TIMEOUT_MS = 2000

/** The catalog's own field registers itself here for as long as it is mounted. */
export function registerSearchField(field: HTMLInputElement | null) {
	liveField = field
}

/** Called from the tap that asks for search, while the gesture is still live. */
export function takeSearchKeyboard() {
	if (liveField?.isConnected) {
		// already on the catalog: its field is right there, and this is also the
		// only thing that answers a second tap on Hledat, which changes no URL and
		// so wakes no effect
		liveField.focus()
		const end = liveField.value.length
		liveField.setSelectionRange(end, end)
		return
	}
	if (standIn) return

	const el = document.createElement('input')
	el.type = 'search'
	el.tabIndex = -1
	el.setAttribute('aria-hidden', 'true')
	// Invisible and out of the way, but neither `display: none` nor `readonly`:
	// either of those and the keyboard stays shut. 16px because anything smaller
	// makes iOS zoom the page in on focus.
	el.style.cssText =
		'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;caret-color:transparent;z-index:-1'
	document.body.appendChild(el)
	standIn = el
	el.focus({ preventScroll: true })
	standInTimer = window.setTimeout(releaseSearchKeyboard, STAND_IN_TIMEOUT_MS)
}

/** Called by the catalog once its own field has the caret — or by the timeout,
 * which gives the keyboard back to a screen that never arrived. */
export function releaseSearchKeyboard() {
	if (standInTimer) clearTimeout(standInTimer)
	standInTimer = 0
	const el = standIn
	standIn = null
	// by now the real field holds the focus, so this takes nothing with it
	el?.remove()
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
