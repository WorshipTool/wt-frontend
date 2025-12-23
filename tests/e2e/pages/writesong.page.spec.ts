import { getRandomString } from '@/tech/string/random.string.tech'
import { expect } from '@playwright/test'
import { test_tech_loginWithData } from '../../test.tech'
import { smartTest } from '../setup'

smartTest('Link, routing', 'smoke', async ({ page }) => {
	await page.goto('/')

	await page.waitForLoadState()
	await test_tech_loginWithData(page)

	await page.getByRole('button', { name: 'Přidat novou píseň' }).click()
	await page.getByRole('link', { name: 'Sepsat ručně' }).click()

	await page.waitForURL(/.*\/vytvorit\/napsat/)
	await expect(
		page.getByRole('textbox', { name: 'Zadejte název písně' })
	).toBeVisible({ timeout: 30000 })
	await expect(
		page.getByRole('textbox', { name: 'Zde je místo pro obsah písně' })
	).toBeVisible()
	await expect(
		page
			.getByLabel('Přidat', { exact: true })
			.locator('div')
			.filter({ hasText: 'Vytvořit (neveřejně)' })
	).toBeVisible()
})

smartTest('Create new song', 'critical', async ({ page }) => {
	await page.goto('/')
	await page.waitForLoadState('networkidle')

	await test_tech_loginWithData(page)
	await page.goto('/vytvorit/napsat')
	await page.waitForLoadState('networkidle')

	const title = getRandomString(10, 5)
	const notValidText = getRandomString(10, 10)
	const validText = `${notValidText}\n\n${getRandomString(50, 10)}`

	await page.getByRole('textbox', { name: 'Zadejte název písně' }).click()
	await page.getByRole('textbox', { name: 'Zadejte název písně' }).fill(title)

	await page
		.getByRole('textbox', { name: 'Zde je místo pro obsah písně' })
		.click()
	await page
		.getByRole('textbox', { name: 'Zde je místo pro obsah písně' })
		.fill(validText)

	await page.getByRole('button', { name: 'Vytvořit (neveřejně)' }).click()

	await page.waitForURL(/.*\/pisen\/.*/, { timeout: 20000 })
	await expect(page).toHaveURL(/.*\/pisen\/.*/)

	await expect(page.locator('b')).toContainText(title)
})

smartTest('Create new song, validity, in list', 'full', async ({ page }) => {
	await page.goto('/')
	await page.waitForLoadState('networkidle')

	await test_tech_loginWithData(page)
	await page.goto('/vytvorit/napsat')
	await page.waitForLoadState('networkidle')

	const title = getRandomString(10, 5)
	const notValidText = getRandomString(10, 10)
	const validText = `${notValidText}\n\n${getRandomString(50, 10)}`

	await page.getByRole('textbox', { name: 'Zadejte název písně' }).click()
	await page.getByRole('textbox', { name: 'Zadejte název písně' }).fill(title)

	await page
		.getByRole('textbox', { name: 'Zde je místo pro obsah písně' })
		.click()
	await page
		.getByRole('textbox', { name: 'Zde je místo pro obsah písně' })
		.fill(notValidText)

	await page
		.getByLabel('Přidat', { exact: true })
		.locator('div')
		.filter({ hasText: 'Vytvořit (neveřejně)' })
		.click()

	await page.waitForURL(/.*\/vytvorit\/napsat/, { timeout: 20000 })
	await expect(page).toHaveURL(/.*\/vytvorit\/napsat/)

	await expect(page.getByText('Neplatný obsah')).toBeVisible()

	await page
		.getByRole('textbox', { name: 'Zde je místo pro obsah písně' })
		.click()
	await page
		.getByRole('textbox', { name: 'Zde je místo pro obsah písně' })
		.fill(validText)

	await page.getByRole('button', { name: 'Vytvořit (neveřejně)' }).click()

	await page.waitForURL(/.*\/pisen\/.*/)
	await expect(page).toHaveURL(/.*\/pisen\/.*/)

	await expect(page.locator('b')).toContainText(title)

	// Check if the song is in the list
	await page.goto('/ucet/pisne')

	await expect(page.getByRole('link', { name: title })).toBeVisible()
})
