import { expect } from '@playwright/test'
import { test_tech_loginWithData } from '../../../test.tech'
import { smartTest } from '../../setup'

smartTest('Team is visible', 'critical', async ({ page }) => {
	await test_tech_loginWithData(page)
	await page.goto('/sub/tymy/zkouska-team')

	await expect(page.getByText('Zkouska')).toBeVisible()
})
