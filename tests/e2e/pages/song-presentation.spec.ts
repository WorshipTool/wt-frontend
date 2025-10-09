import { expect, test } from '@playwright/test'
import { smartTest } from '../setup'

test.describe.configure({ mode: 'parallel', timeout: 4 * 60 * 1000 })

smartTest(
	'Song presentation displays correctly with default key',
	'critical',
	async ({ page }) => {
		// Navigate to a specific song's presentation page
		await page.goto('/pisen/a6d46/mou-cestu-v-rukou-mas/prezentace')

		// Wait for presentation to load
		await page.waitForTimeout(1000)
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(1000)

		// Verify PresentationLayout is rendered
		const presentationLayout = page.locator('body')
		await expect(presentationLayout).toBeVisible()

		// Check that the song title is visible in presentation
		const pageContent = await page.content()
		expect(pageContent.toLowerCase()).toContain('mou cestu')

		// Check for the original chord (should be C in default key)
		const chordElements = page.locator('.chord')
		await expect(chordElements.first()).toBeVisible()

		const firstChordText = await chordElements.first().textContent()
		expect(firstChordText?.trim().startsWith('C')).toBe(true)

		// Check for navigation and control buttons
		const backButton = page
			.locator('button')
			.filter({ hasText: /opustit|back/i })
			.first()

		// If no text-based back button, look for a button that could be back button
		if ((await backButton.count()) === 0) {
			const iconBackButton = page.getByRole('button').first()
			await expect(iconBackButton).toBeVisible()
		} else {
			await expect(backButton).toBeVisible()
		}

		const fullscreenButton = page
			.getByRole('button')
			.filter({ has: page.locator('[data-testid="FullscreenIcon"]') })
		await expect(fullscreenButton).toBeVisible()
	}
)

smartTest(
	'Song presentation displays correctly with transposed key',
	'critical',
	async ({ page }) => {
		// Navigate to song presentation with key parameter (transpose +2)
		await page.goto('/pisen/a6d46/mou-cestu-v-rukou-mas/prezentace?key=D')

		// Wait for presentation to load
		await page.waitForTimeout(1000)
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(1000)

		// Check that the song title is still visible
		const pageContent = await page.content()
		expect(pageContent.toLowerCase()).toContain('mou cestu')

		// Check for the transposed chord (should be D when transposed +2 from C)
		const chordElements = page.locator('.chord')
		await expect(chordElements.first()).toBeVisible()

		const firstChordText = await chordElements.first().textContent()
		expect(firstChordText?.trim().startsWith('D')).toBe(true)
	}
)

smartTest(
	'Song presentation back button works',
	'critical',
	async ({ page }) => {
		// Navigate to song presentation
		await page.goto('/pisen/a6d46/mou-cestu-v-rukou-mas/prezentace')

		// Wait for presentation to load
		await page.waitForTimeout(2000)
		await page.waitForLoadState('networkidle')

		// Find and click the back button
		const backButton = page
			.locator('button')
			.filter({ hasText: /opustit|back/i })
			.first()

		if ((await backButton.count()) === 0) {
			// If no text-based back button, look for a button with an arrow or close icon
			const iconBackButton = page.getByRole('button').first()
			await iconBackButton.click()
		} else {
			await backButton.click()
		}

		await page.waitForTimeout(1000)

		await page.waitForURL('**/pisen/a6d46/mou-cestu-v-rukou-mas{,?**}')
	}
)
