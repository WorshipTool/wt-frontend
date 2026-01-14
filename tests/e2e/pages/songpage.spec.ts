import { getRandomString } from '@/tech/string/random.string.tech'
import { expect, Page } from '@playwright/test'
import { Selectors } from '@tests/e2e/helpers/selectors.helper'
import { test_tech_loginWithData } from '../../test.tech'
import { smartTest } from '../setup'
import { test_createNewSong } from './songs/songs.test.utils'

smartTest('Transposition exists and works', 'critical', async ({ page }) => {
	const sel = new Selectors(page)
	await page.goto('/pisen/a6d46/proscholy')
	// await page.getByText('TRANSPOZICE').click()
	const c1 = await page
		.locator('div')
		.filter({ hasText: /^CMou$/ })
		.getByRole('paragraph')
		.first()

	await expect(c1).toBeVisible()

	const up = await sel.songPage.transposeUpButton()
	up.click()
	up.click()

	const c2 = await page
		.locator('div')
		.filter({ hasText: /^DMou$/ })
		.getByRole('paragraph')
		.first()

	await expect(c2).toBeVisible()

	const down = await sel.songPage.transposeDownButton()

	down.click()
	down.click()
	down.click()
	const c3 = await page
		.locator('div')
		.filter({ hasText: /^HMou$/ })
		.getByRole('paragraph')
		.first()

	await expect(c3).toBeVisible()
})

smartTest('Print button exists and works', 'critical', async ({ page }) => {
	const sel = new Selectors(page)
	const pisenUrl = '/pisen/a6d46/proscholy'
	await page.goto(pisenUrl)

	// Wait for button to be visible and click it
	const printButton = sel.songPage.printButton()
	await expect(printButton).toBeVisible()

	const url = new URL(page.url())
	const pdfUrl = url.origin + pisenUrl + '/pdf'
	const response = await page.request.get(pdfUrl)

	// Check that we got a successful response
	expect(response.status()).toBe(200)

	// Check content type is PDF
	const contentType = response.headers()['content-type']
	expect(contentType).toContain('application/pdf')
})

smartTest('Contains source', 'smoke', async ({ page }) => {
	await page.goto('/pisen/a6d46/proscholy')

	// Wait for page to fully load
	await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

	await expect(
		page.getByRole('button', { name: 'https://zpevnik.proscholy.cz/' })
	).toBeVisible({ timeout: 10000 })
})

// User logged

smartTest(
	'Edit song is enabled only for user',
	'critical',
	async ({ page }) => {
		await page.goto('/pisen/26515/52k6a')

		const userButtons = [
			page.getByRole('button', { name: 'Upravit' }),
			page.getByRole('button', { name: 'Přidat do playlistu' }),
		]

		for (const button of userButtons) {
			await expect(button).not.toBeVisible()
		}

		// Log in
		await test_tech_loginWithData(page)

		for (const button of userButtons) {
			await expect(button).toBeVisible()
		}
	}
)

const songEdit = async (page: Page, newTitle: string, newContent: string) => {
	await page.getByRole('button', { name: 'Upravit' }).click()

	if (newTitle) {
		await page.getByRole('textbox', { name: 'Název písně' }).click()
		await page.getByRole('textbox', { name: 'Název písně' }).fill(newTitle)
	}

	if (newContent) {
		await page.getByRole('textbox', { name: 'Obsah písně' }).click()
		await page.getByRole('textbox', { name: 'Obsah písně' }).fill(newContent)
	}

	await page.getByRole('button', { name: 'Uložit' }).click()

	await page.waitForTimeout(10000) // wait for save to finish
}

smartTest('Edit song saves changes', 'critical', async ({ page }) => {
	const { hex, alias } = await test_createNewSong(page)

	const url = `/pisen/${hex}/${alias}`
	await page.goto(url)

	const newTitle = getRandomString(10, 5)
	const content = getRandomString(50, 20) + '\n\n' + getRandomString(50, 20)

	await songEdit(page, newTitle, content)

	await expect(page.locator('h5')).toContainText(newTitle)
	await expect(page.locator('body')).toContainText(content.split('\n')[0])

	// check if url is different... not equal to original
	await expect(page).not.toHaveURL(url)
})

smartTest('Creating clone', 'critical', async ({ page }) => {
	const publicSongUrl = '/pisen/2ae33/bozi-beranek'
	await page.goto(publicSongUrl)

	await test_tech_loginWithData(page)

	// await page.getByLabel('Další možnosti').getByRole('button').click()
	await page.getByText('Vytvořit úpravu').click()
	await page.waitForResponse(
		(response) =>
			response.url().includes('/song/create/copy') && response.status() === 201
	)

	// check if url is different... not equal to original
	await page.waitForURL((url) => url.pathname !== publicSongUrl)
	// await expect(page).not.toHaveURL(publicSongUrl)

	// page check element, which contains element "(kopie)"
	await expect(page.locator('text=/.*\\(kopie\\).*/').first()).toBeVisible()
})
