import { getRandomString } from '@/tech/string/random.string.tech'
import { Page } from '@playwright/test'
import { test_tech_loginWithData } from '../../../test.tech'

import { expect } from '@playwright/test'

export const test_createNewSong = async (
	page: Page,
	title?: string,
	content?: string
) => {
	await page.goto('/')

	await test_tech_loginWithData(page)
	await page.goto('/vytvorit/napsat')

	const songTitle = title ?? getRandomString(10, 5)
	const notValidText = getRandomString(10, 10)
	const validText = content ?? `${notValidText}\n\n${getRandomString(50, 10)}`

	await page.getByRole('textbox', { name: 'Zadejte název písně' }).click()
	await page
		.getByRole('textbox', { name: 'Zadejte název písně' })
		.fill(songTitle)

	await page
		.getByRole('textbox', { name: 'Zde je místo pro obsah písně' })
		.click()
	await page
		.getByRole('textbox', { name: 'Zde je místo pro obsah písně' })
		.fill(validText)

	await page.getByRole('button', { name: 'Vytvořit (neveřejně)' }).click()

	await page.waitForURL(/.*\/pisen\/.*/, { timeout: 20000 })
	await expect(page).toHaveURL(/.*\/pisen\/.*/)

	await expect(page.locator('b')).toContainText(songTitle)

	const { pathname } = new URL(page.url())
	const match = pathname.match(/\/pisen\/([^/]+)\/([^/]+)/)
	if (!match) throw new Error('Could not extract hex and alias from URL')
	const [, hex, alias] = match
	return {
		hex,
		alias,
	}
}
