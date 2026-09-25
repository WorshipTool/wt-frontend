'use client'

/**
 * The caret's passage from home's field to the catalog's.
 *
 * Home is a door: type in its field and the catalog opens with what you typed.
 * The two fields are different elements on different screens, so the caret does
 * not survive the navigation by itself — the one you were typing into
 * disappears, and on a phone the keyboard goes with it.
 *
 * So home says it is handing over, and the catalog takes the caret when it
 * arrives. A flag in the module rather than in the URL: it lives exactly as long
 * as the navigation does. A shared or reloaded link starts a new module and
 * finds nothing here, which is what should happen — arriving at someone else's
 * search should show the results, not open a keyboard over them.
 */
let handingOver = false

/** Called by the screen that navigates to the catalog while you are typing. */
export function handOffSearchFocus() {
	handingOver = true
}

/** Read once by the catalog when it arrives; false for every other arrival. */
export function consumeSearchFocus(): boolean {
	const was = handingOver
	handingOver = false
	return was
}
