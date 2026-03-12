import fs from 'fs'
import path from 'path'

import browserslist from 'browserslist'

/**
 * Validates that the browserslist configuration targets modern browsers
 * that natively support ES2022+ features, avoiding unnecessary polyfills.
 *
 * These polyfills were flagged by Lighthouse as "Legacy JavaScript":
 * - Array.prototype.at (Chrome 92+, Firefox 90+, Safari 15.4+)
 * - Object.hasOwn (Chrome 93+, Firefox 92+, Safari 15.4+)
 * - Array.prototype.flat/flatMap (Chrome 69+, Firefox 62+, Safari 12+)
 * - Object.fromEntries (Chrome 73+, Firefox 63+, Safari 12.1+)
 * - String.prototype.trimEnd/trimStart (Chrome 66+, Firefox 61+, Safari 12+)
 */

// Minimum browser versions that support all flagged ES2022+ features
const MIN_VERSIONS: Record<string, number> = {
	chrome: 93,
	edge: 93,
	firefox: 92,
	safari: 15,
	ios_saf: 15,
	opera: 79,
	samsung: 17,
}

describe('browserslist configuration', () => {
	it('should resolve production targets', () => {
		const browsers = browserslist(undefined, {
			path: process.cwd(),
			env: 'production',
		})
		expect(browsers.length).toBeGreaterThan(0)
	})

	it('should not target browsers older than ES2022 feature support', () => {
		const browsers = browserslist(undefined, {
			path: process.cwd(),
			env: 'production',
		})

		const violatingBrowsers: string[] = []

		for (const browser of browsers) {
			const [name, versionStr] = browser.split(' ')
			// Handle version ranges like "15.6-15.8"
			const version = parseFloat(versionStr.split('-')[0])

			if (name in MIN_VERSIONS && version < MIN_VERSIONS[name]) {
				violatingBrowsers.push(browser)
			}
		}

		expect(violatingBrowsers).toEqual([])
	})

	it('should not include Opera Mini (no JS support)', () => {
		const browsers = browserslist(undefined, {
			path: process.cwd(),
			env: 'production',
		})

		const hasOpMini = browsers.some((b) => b.startsWith('op_mini'))
		expect(hasOpMini).toBe(false)
	})
})

describe('polyfill-module replacement', () => {
	const emptyPolyfillPath = path.resolve(
		process.cwd(),
		'src/polyfills/empty.js'
	)

	it('should have an empty polyfill replacement file', () => {
		expect(fs.existsSync(emptyPolyfillPath)).toBe(true)
	})

	it('empty polyfill file should not contain executable code', () => {
		const content = fs.readFileSync(emptyPolyfillPath, 'utf-8')
		// Strip comments and whitespace
		const code = content
			.replace(/\/\/.*$/gm, '')
			.replace(/\/\*[\s\S]*?\*\//g, '')
			.trim()
		expect(code).toBe('')
	})

	it('Next.js polyfill-module.js should still exist (to be aliased away)', () => {
		const nextPolyfill = require.resolve(
			'next/dist/build/polyfills/polyfill-module'
		)
		expect(fs.existsSync(nextPolyfill)).toBe(true)
	})
})

describe('next.config.mjs legacy JS mitigation', () => {
	const configPath = path.resolve(process.cwd(), 'next.config.mjs')
	let configContent: string

	beforeAll(() => {
		configContent = fs.readFileSync(configPath, 'utf-8')
	})

	it('should alias polyfill-module to empty file for client bundles', () => {
		expect(configContent).toContain(
			'next/dist/build/polyfills/polyfill-module'
		)
		expect(configContent).toContain('src/polyfills/empty.js')
	})

	it('should only apply polyfill alias on client builds (!isServer)', () => {
		expect(configContent).toContain('if (!isServer)')
	})

	it('should include notistack in transpilePackages', () => {
		expect(configContent).toContain("'notistack'")
		// Verify it's in the transpilePackages array specifically
		const transpileMatch = configContent.match(
			/transpilePackages:\s*\[([^\]]+)\]/
		)
		expect(transpileMatch).not.toBeNull()
		expect(transpileMatch![1]).toContain('notistack')
	})

	it('should include react-transition-group in transpilePackages', () => {
		const transpileMatch = configContent.match(
			/transpilePackages:\s*\[([^\]]+)\]/
		)
		expect(transpileMatch).not.toBeNull()
		expect(transpileMatch![1]).toContain('react-transition-group')
	})
})
