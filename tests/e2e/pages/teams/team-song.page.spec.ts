import { expect } from '@playwright/test'
import { login } from '@tests/e2e/helpers/auth.helper'
import { smartTest } from '../../setup'

smartTest('Song ins team is visible', 'critical', async ({ page }) => {
	await page.goto('/')
	await login(page)
	await page.goto('sub/tymy/zkouska-team/pisen/a32c2/oceany')
	await page.waitForURL(/a32c2\/oceany/)
	await expect(page.getByText('Oceány')).toBeVisible()
	await expect(page.getByText('Říkáš')).toBeVisible()
})
