describe('device.tech', () => {
	const originalNavigator = global.navigator

	afterEach(() => {
		jest.resetModules()
		Object.defineProperty(global, 'navigator', {
			value: originalNavigator,
			configurable: true,
		})
	})

	it('detects mobile user agent', () => {
		Object.defineProperty(global, 'navigator', {
			value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' },
			configurable: true,
		})

		const { isMobile, isTablet } = require('../device.tech')
		expect(isMobile).toBe(true)
		expect(isTablet).toBe(false)
	})

	it('detects Android mobile user agent', () => {
		Object.defineProperty(global, 'navigator', {
			value: { userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0 Mobile Safari/537.36' },
			configurable: true,
		})

		const { isMobile } = require('../device.tech')
		expect(isMobile).toBe(true)
	})

	it('detects desktop user agent', () => {
		Object.defineProperty(global, 'navigator', {
			value: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0 Safari/537.36' },
			configurable: true,
		})

		const { isMobile, isTablet } = require('../device.tech')
		expect(isMobile).toBe(false)
		expect(isTablet).toBe(false)
	})

	it('detects iPad user agent as tablet', () => {
		Object.defineProperty(global, 'navigator', {
			value: { userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15' },
			configurable: true,
		})

		const { isTablet } = require('../device.tech')
		expect(isTablet).toBe(true)
	})
})
