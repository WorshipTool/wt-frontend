describe('device.tech', () => {
	const originalNavigator = global.navigator

	afterEach(() => {
		jest.resetModules()
		Object.defineProperty(global, 'navigator', {
			value: originalNavigator,
			configurable: true,
		})
	})

	function mockNavigator(userAgent: string, maxTouchPoints = 0) {
		Object.defineProperty(global, 'navigator', {
			value: { userAgent, maxTouchPoints },
			configurable: true,
		})
	}

	it('detects iPhone as mobile, not tablet', () => {
		mockNavigator(
			'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
		)

		const { isMobile, isTablet } = require('../device.tech')
		expect(isMobile).toBe(true)
		expect(isTablet).toBe(false)
	})

	it('detects Android phone as mobile, not tablet', () => {
		mockNavigator(
			'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
		)

		const { isMobile, isTablet } = require('../device.tech')
		expect(isMobile).toBe(true)
		expect(isTablet).toBe(false)
	})

	it('detects desktop Mac as neither mobile nor tablet', () => {
		mockNavigator(
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
			0
		)

		const { isMobile, isTablet } = require('../device.tech')
		expect(isMobile).toBe(false)
		expect(isTablet).toBe(false)
	})

	it('detects desktop Windows as neither mobile nor tablet', () => {
		mockNavigator(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
			0
		)

		const { isMobile, isTablet } = require('../device.tech')
		expect(isMobile).toBe(false)
		expect(isTablet).toBe(false)
	})

	it('detects modern iPad (iPadOS 13+) as tablet, not mobile', () => {
		// Modern iPads report as Macintosh but have maxTouchPoints > 1
		mockNavigator(
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
			5
		)

		const { isMobile, isTablet } = require('../device.tech')
		expect(isTablet).toBe(true)
		expect(isMobile).toBe(false)
	})

	it('detects legacy iPad (pre-iPadOS 13) as tablet, not mobile', () => {
		mockNavigator(
			'Mozilla/5.0 (iPad; CPU OS 12_5_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1'
		)

		const { isMobile, isTablet } = require('../device.tech')
		expect(isTablet).toBe(true)
		expect(isMobile).toBe(false)
	})

	it('detects Android tablet as tablet, not mobile', () => {
		// Android tablets have "Android" but NOT "Mobile" in their UA
		mockNavigator(
			'Mozilla/5.0 (Linux; Android 13; SM-X800) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
		)

		const { isMobile, isTablet } = require('../device.tech')
		expect(isTablet).toBe(true)
		expect(isMobile).toBe(false)
	})

	it('returns false for both when navigator is undefined (SSR)', () => {
		Object.defineProperty(global, 'navigator', {
			value: undefined,
			configurable: true,
		})

		const { isMobile, isTablet } = require('../device.tech')
		expect(isMobile).toBe(false)
		expect(isTablet).toBe(false)
	})
})
