import { deriveBasePath, stripBasePath } from '../basePath'

describe('deriveBasePath', () => {
	describe('root URLs (no path prefix)', () => {
		it('returns empty string for bare domain', () => {
			expect(deriveBasePath('https://chvalotce.cz')).toBe('')
		})

		it('returns empty string for domain with trailing slash', () => {
			expect(deriveBasePath('https://chvalotce.cz/')).toBe('')
		})

		it('returns empty string for localhost', () => {
			expect(deriveBasePath('http://localhost:3000')).toBe('')
		})

		it('returns empty string for localhost with trailing slash', () => {
			expect(deriveBasePath('http://localhost:3000/')).toBe('')
		})
	})

	describe('URLs with a path prefix', () => {
		it('extracts /pr-55 from preview URL', () => {
			expect(
				deriveBasePath('https://preview.chvalotce.cz/pr-55')
			).toBe('/pr-55')
		})

		it('extracts /pr-123 from preview URL', () => {
			expect(
				deriveBasePath('https://preview.chvalotce.cz/pr-123')
			).toBe('/pr-123')
		})

		it('extracts /dev from staging URL', () => {
			expect(deriveBasePath('https://chvalotce.cz/dev')).toBe('/dev')
		})

		it('extracts deep path prefix', () => {
			expect(deriveBasePath('https://chvalotce.cz/a/b/c')).toBe('/a/b/c')
		})
	})

	describe('undefined / empty input', () => {
		it('returns empty string for undefined', () => {
			expect(deriveBasePath(undefined)).toBe('')
		})

		it('returns empty string for empty string', () => {
			expect(deriveBasePath('')).toBe('')
		})
	})
})

describe('stripBasePath', () => {
	describe('with basePath /pr-55', () => {
		const basePath = '/pr-55'

		it('strips prefix from a regular route', () => {
			expect(stripBasePath('/pr-55/prihlaseni', basePath)).toBe('/prihlaseni')
		})

		it('strips prefix from nested route', () => {
			expect(stripBasePath('/pr-55/seznam/pisen', basePath)).toBe(
				'/seznam/pisen'
			)
		})

		it('strips prefix from root (returns /)', () => {
			expect(stripBasePath('/pr-55', basePath)).toBe('/')
		})

		it('strips prefix from root with trailing slash', () => {
			expect(stripBasePath('/pr-55/', basePath)).toBe('/')
		})

		it('does not strip when pathname does not start with basePath', () => {
			expect(stripBasePath('/prihlaseni', basePath)).toBe('/prihlaseni')
		})

		it('does not strip on partial prefix match', () => {
			// /pr-550 should NOT be treated as /pr-55 + /0
			expect(stripBasePath('/pr-550/page', basePath)).toBe('/pr-550/page')
		})
	})

	describe('with empty basePath (production / root deployment)', () => {
		it('returns pathname unchanged', () => {
			expect(stripBasePath('/prihlaseni', '')).toBe('/prihlaseni')
		})

		it('returns root unchanged', () => {
			expect(stripBasePath('/', '')).toBe('/')
		})

		it('returns nested path unchanged', () => {
			expect(stripBasePath('/seznam/pisen', '')).toBe('/seznam/pisen')
		})
	})

	describe('subdomain routing path reconstruction', () => {
		// Middleware prepends NEXT_BASE_PATH when rewriting subdomain paths:
		// url.pathname = NEXT_BASE_PATH + newPathname
		// These tests verify the inverse: stripping works correctly.

		it('strips basePath from subdomain-prefixed rewritten path', () => {
			expect(stripBasePath('/pr-55/sub/tymy/pisen', '/pr-55')).toBe(
				'/sub/tymy/pisen'
			)
		})

		it('works correctly when basePath is empty (no-op)', () => {
			expect(stripBasePath('/sub/tymy/pisen', '')).toBe('/sub/tymy/pisen')
		})
	})
})

describe('deriveBasePath + stripBasePath round-trip', () => {
	it('production URL: basePath is empty, paths pass through unchanged', () => {
		const basePath = deriveBasePath('https://chvalotce.cz')
		expect(basePath).toBe('')
		expect(stripBasePath('/prihlaseni', basePath)).toBe('/prihlaseni')
		expect(stripBasePath('/seznam', basePath)).toBe('/seznam')
	})

	it('preview URL pr-55: basePath /pr-55, stripping works end-to-end', () => {
		const basePath = deriveBasePath(
			'https://preview.chvalotce.cz/pr-55'
		)
		expect(basePath).toBe('/pr-55')
		expect(stripBasePath('/pr-55/prihlaseni', basePath)).toBe('/prihlaseni')
		expect(stripBasePath('/pr-55/seznam', basePath)).toBe('/seznam')
		expect(stripBasePath('/pr-55', basePath)).toBe('/')
	})

	it('redirect to /prihlaseni uses basePath as prefix', () => {
		// Simulates: loginUrl.pathname = NEXT_BASE_PATH + '/prihlaseni'
		const basePath = deriveBasePath(
			'https://preview.chvalotce.cz/pr-55'
		)
		const loginPathname = basePath + '/prihlaseni'
		expect(loginPathname).toBe('/pr-55/prihlaseni')
		// Stripping it back gives the logical path
		expect(stripBasePath(loginPathname, basePath)).toBe('/prihlaseni')
	})
})
