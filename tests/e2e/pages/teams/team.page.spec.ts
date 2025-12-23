import { expect } from '@playwright/test'
import { login } from '@tests/e2e/helpers/auth.helper'
import { smartTest } from '../../setup'

smartTest('Team is visible', 'critical', async ({ page }) => {
	await page.goto('/')
	await login(page)
	await page.goto('/sub/tymy/zkouska-team')

	await page.waitForLoadState('domcontentloaded')

	await expect(page.getByText(/Zkouska/i).first()).toBeVisible({
		timeout: 10000,
	})
})
