import { getRandomString } from '@/tech/string/random.string.tech'
import { login } from '@e2e/helpers/auth.helper'
import { selectors } from '@e2e/helpers/selectors.helper'
import { Page, expect } from '@playwright/test'

export const test_createNewSong = async (
	page: Page,
	title?: string,
	content?: string
) => {
	const sel = selectors(page)

	await page.goto('/')

	await login(page)
	await page.goto('/vytvorit/napsat')

	const songTitle = title ?? getRandomString(10, 5)
	const notValidText = getRandomString(10, 10)
	const validText = content ?? `${notValidText}\n\n${getRandomString(50, 10)}`

	const titleInput = sel.writeSongPage.titleInput()
	await expect(titleInput).toBeVisible()
	await titleInput.click()
	await titleInput.fill(songTitle)

	const contentInput = sel.writeSongPage.contentInput()
	await expect(contentInput).toBeVisible()
	await contentInput.click()
	await contentInput.fill(validText)

	// Wait for the create response
	const createResponsePromise = page.waitForResponse(
		(resp) =>
			resp.url().includes('/song') &&
			(resp.status() === 200 || resp.status() === 201),
		{ timeout: 20000 }
	)

	await sel.writeSongPage.createButton().click()

	// Wait for response
	await createResponsePromise

	await page.waitForURL(/.*\/pisen\/.*/, { timeout: 30000 })

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
