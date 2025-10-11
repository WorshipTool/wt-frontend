import { getRandomString } from '@/tech/string/random.string.tech'
import { expect, Page } from '@playwright/test'
import { test_tech_loginWithData } from '../../test.tech'
import { smartTest } from '../setup'

smartTest('Transposition exists and works', 'critical', async ({ page }) => {
	await page.goto('/pisen/a6d46/mou-cestu-v-rukou-mas')
	await page.getByText('TRANSPOZICE').click()
	const c1 = await page
		.locator('div')
		.filter({ hasText: /^CMou$/ })
		.getByRole('paragraph')
		.first()

	await expect(c1).toBeVisible()

	const up = await page.getByRole('button', { name: 'Zvýšit o půltón' })
	up.click()
	up.click()

	const c2 = await page
		.locator('div')
		.filter({ hasText: /^DMou$/ })
		.getByRole('paragraph')
		.first()

	await expect(c2).toBeVisible()

	const down = await page.getByRole('button', { name: 'Snížit o půltón' })

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
	await page.goto('/pisen/a6d46/mou-cestu-v-rukou-mas')

	const page2Promise = page.waitForEvent('popup')
	await page.getByRole('button', { name: 'Tisknout' }).click()
	const page2 = await page2Promise

	await page2.getByText('Mou cestu v rukou máš').click()

	await expect(page2.getByText('Mou cestu v rukou m')).toBeVisible()
	///pisen/a6d46/mou-cestu-v-rukou-mas/tisk
	await expect(page2).toHaveURL(/\/pisen\/a6d46\/mou-cestu-v-rukou-mas\/tisk/)
})

smartTest('Contains source', 'smoke', async ({ page }) => {
	await page.goto('/pisen/a6d46/mou-cestu-v-rukou-mas')

	await expect(
		page.getByRole('button', { name: 'https://zpevnik.proscholy.cz/' })
	).toBeVisible()
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
	await page.goto('/pisen/26515/52k6a')
	await test_tech_loginWithData(page)

	const newTitle = getRandomString(10, 5)
	const content = getRandomString(50, 20) + '\n\n' + getRandomString(50, 20)

	await songEdit(page, newTitle, content)

	await expect(page.locator('h5')).toContainText(newTitle)
	await expect(page.locator('body')).toContainText(content.split('\n')[0])

	// check if url is different... not equal to original
	await expect(page).not.toHaveURL(/\/pisen\/26515\/52k6a/)
})

smartTest('Creating clone', 'critical', async ({ page }) => {
	await page.goto('/pisen/26515/52k6a')

	await test_tech_loginWithData(page)

	await page.getByLabel('Další možnosti').getByRole('button').click()
	await page.getByText('Vytvořit úpravu').click()
	await page.waitForTimeout(10000) // wait for save to finish

	// check if url is different... not equal to original
	await expect(page).not.toHaveURL(/\/pisen\/26515\/52k6a/)

	// page check element, which contains element "(kopie)"
	await expect(page.locator('text=/.*\\(kopie\\).*/').first()).toBeVisible()
})
