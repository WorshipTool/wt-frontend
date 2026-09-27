/**
 * Sizes — and the one type style — that two screens have to agree on.
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

/**
 * The phone's large page title, in rem: the size it rests at, and the size it
 * has shrunk to once the content has scrolled under it.
 *
 * Steps of the app's own type scale (h4 and h6), because a title is the one
 * thing on a phone screen with nothing to compare itself against — at 1.85rem
 * it read as the loudest thing on every page, including a song, where it
 * outweighed the sheet it was announcing. The playlist screen, drawn later and
 * by hand, had already settled on 23px → 17.5px; this is that, rounded onto the
 * scale.
 */
export const LARGE_TITLE_REM = 1.5
export const LARGE_TITLE_COMPACT_REM = 1.125

/**
 * Everything else about that title. Three screens draw it — the app-shell
 * header, the catalog (whose title scrolls with the list instead of sitting in
 * the header row) and home's hero — and they are the same title to whoever is
 * looking, so they cannot each keep their own copy: the day the header's shrank
 * and the catalog's didn't, the app had two sizes of the same word.
 *
 * The size is deliberately not in here. The header animates it on scroll, so it
 * belongs to the screen; the rest of the style does not change.
 */
export const largeTitleSx = {
	fontWeight: 800,
	letterSpacing: '-0.4px',
	lineHeight: 1.15,
	color: 'grey.900',
} as const
