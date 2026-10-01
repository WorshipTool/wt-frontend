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
 * These are what the app's scale renders on a phone for `h3` and `h5` — not
 * what `theme.tsx` declares for them. It ends in `responsiveFontSizes()`, which
 * treats every declared heading size as the size at the widest breakpoint and
 * puts `1 + (max - 1) / 2` below 600px: h3 is declared 2rem and renders 1.5,
 * h5 is declared 1.25 and renders 1.125. (h4 and h6, which look like the right
 * steps in the table in DESIGN-SYSTEM.md §3, render at 1.25 and 1.0625 here.)
 *
 * A title is the one thing on a phone screen with nothing to compare itself
 * against, and at 1.85rem it read as the loudest thing on every page — a song
 * included, where it outweighed the sheet it was announcing. The playlist
 * screen, drawn later and by hand, had already settled on 23px → 17.5px; this
 * is that, landed on the scale.
 */
export const LARGE_TITLE_REM = 1.5
export const LARGE_TITLE_COMPACT_REM = 1.125

/**
 * Everything else about that title — for the two screens that draw it at the
 * size above (the app-shell header and the catalog, whose title scrolls with
 * the list instead of sitting in the header row), and for home's hero, which
 * stays deliberately bigger because it greets rather than names. They are one
 * title to whoever is looking, so they don't each keep their own copy of the
 * style: the day the header's tracking changed and the catalog's didn't, the
 * app would have two versions of the same word.
 *
 * The playlist screen is the one that still does keep its own (see
 * PlaylistMobile's MorphItem): its title is a hand-tuned morph between two
 * absolute font sizes, and its tracking has already drifted to -0.3px. Bringing
 * it in is its own small job, not a line of this one.
 *
 * Nothing here defines a token — the colour is a palette path and the rest is
 * this element's own shape — so the three token homes in DESIGN-SYSTEM.md §1
 * stay the only places a token comes from.
 *
 * The size is deliberately not in here: the header animates it on scroll and
 * home overrides it. Nothing else about the title varies.
 */
export const largeTitleSx = {
	// 800 paints as 700: `app/layout.tsx` loads Roboto at 300/400/500/700, and a
	// weight with no face of its own falls to the nearest one below. Left as it
	// was found — it is the number every one of these titles already carried —
	// but it is 700 on the screen until that face is loaded.
	fontWeight: 800,
	letterSpacing: '-0.4px',
	lineHeight: 1.15,
	color: 'grey.900',
} as const
