import { expect } from '@playwright/test'
import { openEmailForm } from '../helpers/auth.helper'
import { selectors } from '../helpers/selectors.helper'
import { smartTest } from '../setup'

smartTest('Contain title and form', 'smoke', async ({ page }) => {
	await page.goto('/registrace')
	const sel = selectors(page)

	await expect(page.getByText('Vytvořte si účet')).toBeVisible()

	await openEmailForm(page)

	// by the name the field carries, not by a placeholder: a placeholder is
	// decoration and can be taken away, which is exactly what happened to the
	// generic "Zadejte text" these used to be found by
	await expect(sel.signupPage.firstNameInput()).toBeEmpty()
	await expect(sel.signupPage.lastNameInput()).toBeEmpty()
	await expect(page.locator('input[type="email"]')).toBeEmpty()
	await expect(page.locator('input[type="password"]')).toBeEmpty()
	await expect(sel.signupPage.signupButton()).toBeVisible()
})
