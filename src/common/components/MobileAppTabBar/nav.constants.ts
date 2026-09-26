// Shared mobile-nav constants + route classification. Kept in a plain
// (non-'use client') module so both client components and server
// components/layouts can import them.

import { RoutesKeys, routesPaths } from '@/routes'
import { urlMatchPatterns } from '@/routes/tech/routes.tech'

/** Width below which the mobile tab bar shows (and the top bar hides). */
export const MOBILE_NAV_BREAKPOINT = 700

/**
 * DOM id of the slot the tab bar renders directly above itself. Pages portal
 * their bottom-docked content (e.g. a paginator) into it so it stacks on top of
 * the bar via layout — no hard-coded bar height, and it follows automatically
 * if the bar's height ever changes.
 */
export const ABOVE_TABBAR_SLOT_ID = 'mobile-above-tabbar-slot'

/** Bottom clearance pages need so their content isn't hidden by the fixed bar.
 * The bar measures ~71px, so this leaves a little slack for larger text sizes —
 * overshooting is invisible, undershooting hides content. */
export const MOBILE_NAV_CLEARANCE = 'calc(env(safe-area-inset-bottom) + 80px)'

/**
 * Height of the dock's bar itself, without the safe-area inset — for the few
 * places that need the number in JS (floating corner buttons sitting above it)
 * rather than as CSS clearance.
 */
export const MOBILE_NAV_BAR_HEIGHT = 71

/**
 * How much of the bottom of the screen the dock takes up right now, in px.
 *
 * Measured rather than assumed: the height depends on which bar holds the dock
 * and on whether the page has docked an action above it, and it is 0 wherever
 * the dock isn't there — desktop, or a route outside the shell.
 *
 * Anything that floats over the page asks this and stays above it. The bar is
 * navigation, and a popup that buries navigation leaves no way out of itself.
 *
 * Reads the DOM, so it is client-only; returns 0 during SSR.
 */
export function measureBottomDock(): number {
	if (typeof document === 'undefined') return 0

	const dock = document.getElementById(ABOVE_TABBAR_SLOT_ID)?.parentElement
	if (!dock) return 0

	const rect = dock.getBoundingClientRect()
	// CSS-hidden on desktop: no height, so nothing to stay clear of
	if (rect.height === 0) return 0

	return Math.max(0, window.innerHeight - rect.top)
}

export type MobileTab = 'home' | 'songs' | 'account' | 'tools' | null

/**
 * Which bottom tab each app route maps to.
 *
 * This is the single source of truth for the whole mobile app shell: the tab
 * bar's active state, whether the tab bar renders, and whether the top bar
 * hides on phones — so the top bar and tab bar always agree. Add app routes
 * here to bring them into the mobile shell.
 *
 * Keyed by `routesPaths` keys rather than path strings, so renaming a route in
 * the routing layer is a compile error here instead of a silently broken shell.
 */
const TAB_BY_ROUTE: Partial<Record<RoutesKeys, Exclude<MobileTab, null>>> = {
	home: 'home',
	// songs list + a song detail page, but not the detail's sub-routes
	songsList: 'songs',
	variant: 'songs',
	// account and everything under it
	account: 'account',
	usersSongs: 'account',
	usersFavourites: 'account',
	usersPlaylists: 'account',
	// create-a-song menu + manual editor + file upload, reached from Moje písně
	addMenu: 'account',
	writeSong: 'account',
	upload: 'account',
	// playlist detail, not its sub-routes (prezentace / pdf)
	playlist: 'account',
	// Signing in and up are where the Account tab leads while signed out, so they
	// belong to it. They hide the top bar and the footer and their phone layouts
	// are full-screen sheets, which left them with no way back into the app at
	// all — and an installed app has no browser Back either.
	login: 'account',
	signup: 'account',
	// reached from the sign-in screen, so it stays in the same tab rather than
	// swapping the whole chrome half-way through one flow
	resetPassword: 'account',
	resetPasswordToken: 'account',
	// The team module, opened from the Nástroje sheet — so Nástroje is the tab
	// that stays lit. Its own presentation route is left out on purpose, below.
	teams: 'tools',
	team: 'tools',
	teamSongbook: 'tools',
	teamPlaylists: 'tools',
	teamPlaylist: 'tools',
	teamPeople: 'tools',
	teamSettings: 'tools',
	teamStatistics: 'tools',
	teamSong: 'tools',
	teamJoin: 'tools',
	teamPublic: 'tools',
	teamPublicSong: 'tools',
	teamNoAccess: 'tools',
}

/**
 * Routes that are in the shell but belong to no single tab: the bar shows with
 * nothing lit, so you can always leave, but it doesn't claim you are somewhere
 * you aren't. Marketing pages are here rather than in TAB_BY_ROUTE because the
 * app reaches them (footer, About) without them being part of any tab.
 */
const SHELL_ONLY: RoutesKeys[] = ['about', 'contact']

/**
 * Routes where a module brings its own bottom bar, so the app's tab bar stands
 * down and lets it have the dock.
 *
 * Inside a team that is the team's four sections: stacking them on top of the
 * app's tabs cost 131px of a 664px screen, and the section bar has to carry the
 * way out itself — its first item is the app's home tab, sheep and all.
 *
 * This is every route under the team page's own layout, the one that renders
 * TeamBottomPanel — the two lists have to stay in step, or a team screen ends
 * up with no bar at all.
 */
const CONTEXTUAL_BAR_ROUTES: RoutesKeys[] = [
	'team',
	'teamSongbook',
	'teamPlaylists',
	'teamPlaylist',
	'teamPlaylistCards',
	'teamPeople',
	'teamSettings',
	'teamStatistics',
	'teamSong',
]

/**
 * App-shell routes whose surface already pads for the bar/dock itself. The tab
 * bar skips its in-flow spacer there, so short content doesn't become needlessly
 * scrollable (no grey strip under the page).
 */
const OWNS_BOTTOM_CLEARANCE: RoutesKeys[] = [
	'variant',
	'playlist',
	// full-screen sheets that size themselves to the viewport and pad their own
	// bottom, so the spacer would only make them scrollable by its own height
	'login',
	'signup',
]

/**
 * The screens whose phone layout is the app shell (MobileAppHeader): a fixed
 * surface with its own scroller, where the document itself must not scroll.
 *
 * It must not scroll from the first paint, not from hydration: which layout a
 * screen wears is decided by a JS media query, so what the server renders — and
 * what stands on the screen until hydration finishes — is the *desktop* layout,
 * which is tall. Drag it and the gesture belongs to the document for as long as
 * it lasts; by the time it ends, the shell is fixed over the top of it, so the
 * screen ignores you until your finger stops and you try again. That is the
 * phantom scroller in front of everything. See MobileShellScrollLock.
 *
 * Has to stay in step with the pages that render MobileAppHeader — a screen
 * left out of this list gets the phantom back.
 */
const APP_SHELL_SCREENS: RoutesKeys[] = [
	'home',
	'songsList',
	'variant',
	'account',
	'usersSongs',
	'usersFavourites',
	'usersPlaylists',
	'addMenu',
	'writeSong',
	'upload',
]

/** Strip a trailing slash so `/seznam/` classifies the same as `/seznam`. */
function normalise(pathname: string): string {
	return pathname.length > 1 && pathname.endsWith('/')
		? pathname.slice(0, -1)
		: pathname
}

function matches(pathname: string, key: RoutesKeys): boolean {
	// `parental: false` requires an equal segment count, so `/pisen/a/b/prezentace`
	// correctly does not match the `/pisen/[hex]/[alias]` detail route
	return urlMatchPatterns(pathname, routesPaths[key], false)
}

export function mobileTabForPath(pathname: string | null): MobileTab {
	if (!pathname) return null
	const path = normalise(pathname)
	for (const [key, tab] of Object.entries(TAB_BY_ROUTE)) {
		if (matches(path, key as RoutesKeys)) return tab
	}
	return null
}

/** True on the app-shell routes that show the bottom tab bar (top bar hidden on phones). */
export function isMobileTabBarRoute(pathname: string | null): boolean {
	if (!pathname) return false
	if (mobileTabForPath(pathname) !== null) return true
	const path = normalise(pathname)
	return SHELL_ONLY.some((key) => matches(path, key))
}

/** See `CONTEXTUAL_BAR_ROUTES`. */
export function hasContextualBottomBar(pathname: string | null): boolean {
	if (!pathname) return false
	const path = normalise(pathname)
	return CONTEXTUAL_BAR_ROUTES.some((key) => matches(path, key))
}

/** See `APP_SHELL_SCREENS`. */
export function isMobileAppShellRoute(pathname: string | null): boolean {
	if (!pathname) return false
	const path = normalise(pathname)
	return APP_SHELL_SCREENS.some((key) => matches(path, key))
}

/** See `OWNS_BOTTOM_CLEARANCE`. */
export function pageOwnsBottomClearance(pathname: string | null): boolean {
	if (!pathname) return false
	const path = normalise(pathname)
	return OWNS_BOTTOM_CLEARANCE.some((key) => matches(path, key))
}
