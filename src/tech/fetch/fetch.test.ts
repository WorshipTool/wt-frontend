import { isSafeUrl } from './fetch'

describe('isSafeUrl', () => {
	it.each([
		'https://chvalotce.cz/api/foo',
		'https://api.chvalotce.cz/bar',
		'https://worship.cz/song',
		'https://fly.dev/health',
		'https://app.fly.dev/health',
		'https://hallelujahhub.com/api',
		'https://dev-wt-backend.pavlin.dev/auth/check',
		'https://pavlin.dev/api',
		'http://localhost:5501/api',
		'http://localhost/api',
	])('allows safe URL: %s', (url) => {
		expect(isSafeUrl(url)).toBe(true)
	})

	it.each([
		'https://evil.com/steal',
		'http://chvalotce.cz/api',
		'https://notpavlin.dev.evil.com/api',
		'ftp://pavlin.dev/file',
		'not-a-url',
	])('blocks unsafe URL: %s', (url) => {
		expect(isSafeUrl(url)).toBe(false)
	})
})
