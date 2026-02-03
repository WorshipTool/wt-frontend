import { expect } from '@playwright/test'
import { smartTest } from '../setup'

smartTest('Contain title and form', 'smoke', async ({ page }) => {
	await page.goto('/registrace')

	await expect(page.getByText('Vytvořte si účet')).toBeVisible()

	await expect(
		page
			.locator('div')
			.filter({ hasText: /^Jméno$/ })
			.getByPlaceholder('Zadejte vaše jméno')
	).toBeEmpty()
	await expect(
		page
			.locator('div')
			.filter({ hasText: /^Příjmení$/ })
			.getByPlaceholder('Zadejte vaše příjmení')
	).toBeEmpty()
	await expect(page.getByPlaceholder('Zadejte e-mail')).toBeEmpty()
	await expect(page.getByPlaceholder('Vytvořte heslo')).toBeEmpty()
	await expect(page.getByPlaceholder('Zopakujte heslo')).toBeEmpty()
	await expect(
		page.getByRole('button', { name: 'Vytvořit účet' })
	).toBeVisible()
})
