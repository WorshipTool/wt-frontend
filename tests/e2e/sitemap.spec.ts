import { expect } from '@playwright/test'
import { smartTest } from './setup'

smartTest('Sitemap loads successfully', 'smoke', async ({ page }) => {
	const response = await page.goto('/sitemap.xml')
	expect(response?.status()).toBe(200)
	expect(response?.headers()['content-type']).toContain('xml')
})

smartTest('Sitemap contains valid XML structure', 'smoke', async ({ page }) => {
	const response = await page.goto('/sitemap.xml')
	const content = await response?.text()

	expect(content).toContain('<?xml')
	expect(content).toContain('<urlset')
	expect(content).toContain('</urlset>')
	expect(content).toContain('<url>')
	expect(content).toContain('</url>')
})

smartTest(
	'Sitemap contains main site URLs with correct domain',
	'critical',
	async ({ page }) => {
		const response = await page.goto('/sitemap.xml')
		const content = await response?.text()

		// Get expected base URL from environment variable
		const expectedBaseUrl =
			process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://chvalotce.cz'

		// Check that BASE_URL is correctly set
		expect(content).toContain(`${expectedBaseUrl}/`)
		expect(content).toContain(`${expectedBaseUrl}/seznam`)
		expect(content).toContain(`${expectedBaseUrl}/o-nas`)
		expect(content).toContain(`${expectedBaseUrl}/prihlaseni`)
		expect(content).toContain(`${expectedBaseUrl}/registrace`)
		expect(content).toContain(`${expectedBaseUrl}/vytvorit`)
	}
)

smartTest(
	'Sitemap contains required XML elements',
	'critical',
	async ({ page }) => {
		const response = await page.goto('/sitemap.xml')
		const content = await response?.text()

		// Check for required sitemap elements
		expect(content).toContain('<loc>')
		expect(content).toContain('<lastmod>')
		expect(content).toContain('<changefreq>')
		expect(content).toContain('<priority>')
	}
)
