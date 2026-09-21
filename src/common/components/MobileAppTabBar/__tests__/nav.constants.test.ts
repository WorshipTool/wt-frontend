import {
	isMobileTabBarRoute,
	mobileTabForPath,
	pageOwnsBottomClearance,
} from '../nav.constants'

describe('mobileTabForPath', () => {
	it('maps the three tab roots', () => {
		expect(mobileTabForPath('/')).toBe('home')
		expect(mobileTabForPath('/seznam')).toBe('songs')
		expect(mobileTabForPath('/ucet')).toBe('account')
	})

	it('maps a song detail page to the songs tab', () => {
		expect(mobileTabForPath('/pisen/a1b2/moje-pisen')).toBe('songs')
	})

	it('does NOT map a song detail sub-route', () => {
		// presentation mode is its own full-screen experience — no app shell
		expect(mobileTabForPath('/pisen/a1b2/moje-pisen/prezentace')).toBeNull()
		expect(mobileTabForPath('/pisen/a1b2/moje-pisen/zverejnit')).toBeNull()
	})

	it('maps account sub-pages and the create flow to the account tab', () => {
		expect(mobileTabForPath('/ucet/pisne')).toBe('account')
		expect(mobileTabForPath('/ucet/oblibene')).toBe('account')
		expect(mobileTabForPath('/ucet/playlisty')).toBe('account')
		expect(mobileTabForPath('/vytvorit')).toBe('account')
		expect(mobileTabForPath('/vytvorit/napsat')).toBe('account')
		expect(mobileTabForPath('/nahrat')).toBe('account')
	})

	it('maps a playlist detail but not its sub-routes', () => {
		expect(mobileTabForPath('/playlist/abc-123')).toBe('account')
		expect(mobileTabForPath('/playlist/abc-123/prezentace')).toBeNull()
		expect(mobileTabForPath('/playlist/abc-123/pdf')).toBeNull()
	})

	it('ignores a trailing slash', () => {
		// the shell used to vanish on `/seznam/` while working on `/seznam`
		expect(mobileTabForPath('/seznam/')).toBe('songs')
		expect(mobileTabForPath('/ucet/')).toBe('account')
		expect(mobileTabForPath('/pisen/a1b2/moje-pisen/')).toBe('songs')
	})

	it('maps signing in and up to the account tab', () => {
		// the Account tab leads here while signed out, and both screens hide every
		// other way back into the app
		expect(mobileTabForPath('/prihlaseni')).toBe('account')
		expect(mobileTabForPath('/registrace')).toBe('account')
	})

	it('keeps the password reset in the same tab as the sign-in it comes from', () => {
		expect(mobileTabForPath('/reset-hesla')).toBe('account')
		expect(mobileTabForPath('/reset-hesla/abc123')).toBe('account')
	})

	it('maps the team module to the tools tab it is opened from', () => {
		expect(mobileTabForPath('/sub/tymy')).toBe('tools')
		expect(mobileTabForPath('/sub/tymy/nas-tym')).toBe('tools')
		expect(mobileTabForPath('/sub/tymy/nas-tym/zpevnik')).toBe('tools')
		expect(mobileTabForPath('/sub/tymy/nas-tym/playlisty')).toBe('tools')
		expect(mobileTabForPath('/sub/tymy/nas-tym/lide')).toBe('tools')
		expect(mobileTabForPath('/sub/tymy/nas-tym/nastaveni')).toBe('tools')
		expect(mobileTabForPath('/sub/tymy/v/nas-tym')).toBe('tools')
	})

	it('leaves presentation modes out of the shell', () => {
		// projection screens own the whole display on purpose
		expect(mobileTabForPath('/pisen/a1b2/x/prezentace')).toBeNull()
		expect(mobileTabForPath('/playlist/abc/prezentace')).toBeNull()
		expect(mobileTabForPath('/sub/tymy/nas-tym/playlist/abc/prezentace')).toBeNull()
	})

	it('returns null for marketing pages, which belong to no tab', () => {
		expect(mobileTabForPath('/o-nas')).toBeNull()
		expect(mobileTabForPath('/kontakt')).toBeNull()
	})

	it('returns null for unknown account sub-routes rather than assuming the shell', () => {
		expect(mobileTabForPath('/ucet/neco/co/neexistuje')).toBeNull()
	})

	it('handles a null pathname', () => {
		expect(mobileTabForPath(null)).toBeNull()
	})
})

describe('isMobileTabBarRoute', () => {
	it('agrees with mobileTabForPath wherever a tab is lit', () => {
		for (const path of ['/', '/seznam', '/ucet', '/prihlaseni', '/sub/tymy']) {
			expect(isMobileTabBarRoute(path)).toBe(mobileTabForPath(path) !== null)
		}
	})

	it('also covers the shell pages that light no tab', () => {
		// the bar is there so you can leave; nothing is lit because they belong to
		// no tab
		expect(mobileTabForPath('/o-nas')).toBeNull()
		expect(isMobileTabBarRoute('/o-nas')).toBe(true)
		expect(isMobileTabBarRoute('/kontakt')).toBe(true)
	})

	it('stays out of presentation modes', () => {
		expect(isMobileTabBarRoute('/pisen/a1b2/x/prezentace')).toBe(false)
		expect(isMobileTabBarRoute('/playlist/abc/prezentace')).toBe(false)
	})

	it('is false for a null pathname', () => {
		expect(isMobileTabBarRoute(null)).toBe(false)
	})
})

describe('pageOwnsBottomClearance', () => {
	it('is true only for the overlay app-shell screens', () => {
		expect(pageOwnsBottomClearance('/pisen/a1b2/moje-pisen')).toBe(true)
		expect(pageOwnsBottomClearance('/playlist/abc-123')).toBe(true)
		// full-screen sheets sized to the viewport, padding for the bar themselves
		expect(pageOwnsBottomClearance('/prihlaseni')).toBe(true)
		expect(pageOwnsBottomClearance('/registrace')).toBe(true)
	})

	it('is false for ordinary shell pages', () => {
		expect(pageOwnsBottomClearance('/')).toBe(false)
		expect(pageOwnsBottomClearance('/seznam')).toBe(false)
		expect(pageOwnsBottomClearance('/ucet')).toBe(false)
	})

	it('is false for a null pathname', () => {
		expect(pageOwnsBottomClearance(null)).toBe(false)
	})

	it('only claims clearance for routes that are in the shell at all', () => {
		// a page outside the shell can't "own" the bar's clearance
		const paths = ['/pisen/a1b2/x/prezentace', '/playlist/abc/prezentace']
		for (const p of paths) {
			expect(pageOwnsBottomClearance(p)).toBe(false)
			expect(isMobileTabBarRoute(p)).toBe(false)
		}
	})
})
