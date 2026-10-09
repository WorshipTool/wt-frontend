import { expect } from '@playwright/test'
import { smartTest } from '../setup'

/**
 * The catalog — what /seznam became. It is still reached by its old address,
 * so the redirect is part of what this checks: a stale link in the wild, a
 * bookmark, the sitemaps search engines already hold.
 */
smartTest('Contain title and list', 'critical', async ({ page }) => {
	await page.goto('/seznam')
	await expect(page).toHaveURL(/\/pisne$/)

	await expect(page.getByText('Všechny písně')).toBeVisible()

	// the songbook itself: rows that lead somewhere, not merely boxes
	const songLinks = page.locator('a[href*="/pisen/"]')
	await expect(songLinks.first()).toBeVisible()
	await expect
		.poll(() => songLinks.count(), { timeout: 10000 })
		.toBeGreaterThan(5)
})
