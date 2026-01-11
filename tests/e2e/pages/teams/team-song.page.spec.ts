import { expect } from '@playwright/test'
import { test_tech_loginWithData } from '../../../test.tech'
import { smartTest } from '../../setup'

smartTest('Team is visible', 'critical', async ({ page }) => {
	await page.goto('/')

	await test_tech_loginWithData(page)

	await page.goto('sub/tymy/ahtk3wx/pisen/a32c2/oceany')

	await page.waitForURL(/a32c2\/oceany/)

	await expect(page.getByText('Oceány')).toBeVisible()
	await expect(page.getByText('Říkáš')).toBeVisible()
})
