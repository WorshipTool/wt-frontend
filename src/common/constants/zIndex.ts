/**
 * Centralized Z-Index Layer System
 *
 * Only HIGH z-index values (> 100) used for overlays, popups, modals,
 * and other stacking-critical UI elements are defined here.
 *
 * Low z-index values (-100 … 100) used for simple layout purposes
 * (e.g. "slightly above sibling", "behind content") remain hardcoded
 * in their respective components — centralizing them adds no value.
 *
 * To change stacking order of overlays globally, adjust values in this
 * single file.
 *
 * Layer overview (back → front):
 *
 *   CORNER_STACK     (200)   Corner buttons (proposals, ideas) — below overlays
 *   OVERLAY          (1300)  Overlays (preview banner, spotlight)
 *   POPUP            (1360)  Popup containers (dropdowns, tooltips attached to popups)
 *   TOOLTIP          (1500)  Floating tooltips
 *   DIALOG           (2000)  Modal dialogs
 *   CONTEXT_MENU     (9999)  Context menus, critical blocking overlays
 *   LOADING          (10000) Full-screen loading screens
 *   FLOATING_EDIT    (10000) Admin floating edit button — always on top
 */
export const Z_INDEX = {
	/** Corner stack buttons (proposals, ideas) — below overlays & popups */
	CORNER_STACK: 200,

	// ── Overlay Layers ───────────────────────────────────────────────────
	/** Overlays: preview banner, spotlight */
	OVERLAY: 1300,
	/** Popup containers (dropdown menus, popup content) */
	POPUP: 1360,
	/** Floating tooltips */
	TOOLTIP: 1500,
	/** Modal dialogs */
	DIALOG: 2000,

	// ── Top Layers ───────────────────────────────────────────────────────
	/** Context menus, critical blocking overlays (e.g. unavailable message) */
	CONTEXT_MENU: 9999,
	/** Full-screen loading screens */
	LOADING: 10000,
	/** Admin floating edit button — always visible above everything */
	FLOATING_EDIT: 10000,
} as const

/** Type of a single z-index layer value */
export type ZIndexLayer = (typeof Z_INDEX)[keyof typeof Z_INDEX]
