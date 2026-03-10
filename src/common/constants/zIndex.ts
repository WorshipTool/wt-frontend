/**
 * Centralized Z-Index Layer System
 *
 * All z-index values used across the application are defined here.
 * Layers are ordered from back (negative) to front (highest positive).
 *
 * To change stacking order globally, adjust values in this single file.
 *
 * Layer overview (back → front):
 *
 *   DEEP_BACKGROUND  (-100)  Background decorations (snow, gradients)
 *   BEHIND           (-1)    Elements behind main content
 *   BASE             (0)     Default / reset level
 *   RAISED           (1)     Slightly above siblings
 *   ELEVATED         (2)     Above RAISED (panels, overlays on content)
 *   STICKY           (10)    Sticky / fixed UI (toolbar, navigation bar)
 *   SEARCH           (100)   Search bars and inputs
 *   CORNER_STACK     (200)   Corner buttons (proposals, ideas) — intentionally below overlays
 *   OVERLAY          (1300)  Overlays (preview banner, spotlight)
 *   POPUP            (1360)  Popup containers (dropdowns, tooltips attached to popups)
 *   TOOLTIP          (1500)  Floating tooltips
 *   DIALOG           (2000)  Modal dialogs
 *   CONTEXT_MENU     (9999)  Context menus, critical blocking overlays
 *   LOADING          (10000) Full-screen loading screens
 *   FLOATING_EDIT    (10000) Admin floating edit button — always on top
 */
export const Z_INDEX = {
	// ── Background Layers ────────────────────────────────────────────────
	/** Background decorations: snow, animated backgrounds */
	DEEP_BACKGROUND: -100,
	/** Elements positioned behind main content */
	BEHIND: -1,

	// ── Content Layers ───────────────────────────────────────────────────
	/** Default / reset level */
	BASE: 0,
	/** Slightly above siblings (cards, panels) */
	RAISED: 1,
	/** Above RAISED — presentation overlays, secondary panels */
	ELEVATED: 2,

	// ── UI Layers ────────────────────────────────────────────────────────
	/** Sticky / fixed UI elements: toolbar, navigation bar */
	STICKY: 10,
	/** Search bars and search input overlays */
	SEARCH: 100,
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
