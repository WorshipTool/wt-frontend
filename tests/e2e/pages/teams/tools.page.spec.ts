import { expect } from '@playwright/test'
import { test_tech_loginWithData } from '../../../test.tech'
import { smartTest } from '../../setup'

smartTest('Team is in tools', 'critical', async ({ page }) => {
	await page.goto('/')

	await test_tech_loginWithData(page)

	await page.getByRole('button', { name: 'Nástroje' }).click()
	await expect(
		page.getByRole('link', { name: 'Zkouska Zkouska' })
	).toBeVisible()
	await page.getByRole('link', { name: 'Zkouska Zkouska' }).click()

	await page.waitForURL(
		new RegExp(
			`tymy\\/zkouska-team|http:\\/\\/tymy\\.test-chvalotce\\.cz:5500\\/zkouska-team`
		)
	)
	const expectedUrls = [
		'tymy/zkouska-team',
		`http://tymy.test-chvalotce.cz:5500/zkouska-team`,
	]
	const currentUrl = page.url()
	const isMatch = expectedUrls.some((url) => currentUrl.includes(url))
	expect(isMatch).toBeTruthy()

	await expect(page.getByRole('link', { name: 'Zkouska' })).toBeVisible()
})
