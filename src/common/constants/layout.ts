/**
 * Sizes that two screens have to agree on.
 *
 * They live here, in a file that imports nothing, rather than next to the
 * components that draw them. A constant exported from a component is a constant
 * behind that component's whole import tree: the catalog took `TOOLBAR_HEIGHT`
 * from `Toolbar.tsx`, the cycle that closed around it left the binding in its
 * temporal dead zone, and the page that had type-checked, linted and passed its
 * tests threw `Cannot access 'z' before initialization` when the production
 * build tried to prerender it. Numbers shared across modules belong somewhere
 * with no edges of its own.
 */

/** How tall the bar across the top of a desktop page is. */
export const TOOLBAR_HEIGHT = 56

/**
 * How tall the app's search field stands: an InputBase's line box (32px — the
 * 24px line plus the input's own 4px and 5px), 12px of padding either side, and
 * a hairline on each edge.
 *
 * Measured in the browser, because the input's own padding is MUI's and is not
 * written down in our styles. Two screens dock the field on the top bar's
 * bottom edge and need this to centre it there; they each used to hold a number
 * tuned to whatever the field measured at the time, so the day it grew by ten
 * pixels it stopped sitting on the edge in two places at once.
 */
export const SEARCH_FIELD_HEIGHT = 32 + 12 * 2 + 1 * 2

/**
 * Where the field sits when it is docked: astride the top bar's bottom edge,
 * half above and half below. Both the home hero and the catalog put it here.
 */
export const DOCKED_FIELD_TOP = TOOLBAR_HEIGHT - SEARCH_FIELD_HEIGHT / 2
