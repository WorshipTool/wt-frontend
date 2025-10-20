import { expect } from '@playwright/test'
import { smartTest } from '../setup'

smartTest('Contain title and list', 'critical', async ({ page }) => {
	await page.goto('/seznam')

	await page.waitForLoadState('networkidle')

	await expect(page.getByText('Seznam všech písní')).toBeVisible()

	await expect(page.locator('.MuiPaper-root').first()).toBeVisible()

	const items = await page.locator('.MuiPaper-root')
	await expect(await items.count()).toBeGreaterThan(10)

	await expect(page.getByRole('button', { name: 'Go to page 4' })).toBeVisible()
})
