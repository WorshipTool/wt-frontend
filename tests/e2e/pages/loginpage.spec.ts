import { expect } from '@playwright/test'
import { openEmailForm } from '../helpers/auth.helper'
import { selectors } from '../helpers/selectors.helper'
import { smartTest } from '../setup'

smartTest('Contain title and form', 'smoke', async ({ page }) => {
	await page.goto('/prihlaseni')
	const sel = selectors(page)

	await expect(page.getByText('Přihlaste se')).toBeVisible()

	// Google and e-mail are two equal ways in; the form is one click past them
	await openEmailForm(page)

	await expect(sel.loginPage.emailInput()).toBeEmpty()
	await expect(sel.loginPage.passwordInput()).toBeEmpty()
	await expect(sel.loginPage.loginButton()).toBeVisible()
})
