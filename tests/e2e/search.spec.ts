import { mapBasicVariantPackApiToDto } from '@/api/dtos'
import { SongSearchingApi } from '@/api/generated'
import { handleServerApiCall } from '@/tech/fetch/handleServerApiCall'
import { getRandomString } from '@/tech/string/random.string.tech'
import { login } from '@e2e/helpers/auth.helper'
import { selectors } from '@e2e/helpers/selectors.helper'
import { expect, Page } from '@playwright/test'
import { smartTest } from './setup'

/**
 * Search using the search bar and wait for results to appear.
 * Uses deterministic waits instead of arbitrary timeouts.
 */
async function searchWithSearchBar(str: string, page: Page) {
	const sel = selectors(page)

	await page.waitForLoadState('domcontentloaded')

	const searchInput = sel.search.input()
	await expect(searchInput).toBeVisible()

	const responsePromise = page.waitForResponse(
		(response) => response.url().includes('searching/search'),
		{ timeout: 60_000 }
	)

	await searchInput.fill(str)

	// Wait for the "searching/search" network request to complete with status 200
	const res = await responsePromise
	expect([200, 201, 204]).toContain(res.status())

	await page.waitForLoadState('domcontentloaded')
}

smartTest('Vyhledávání podle názvu', 'critical', async ({ page }) => {
	const sel = selectors(page)

	// Open homepage
	await page.goto('/')

	// Search by title
	await searchWithSearchBar('Vira', page)

	// Check that search result exists
	const songLink = sel.search.songResult('Kde je zápis ptačí melodie?').first()
	await expect(songLink).toBeVisible({ timeout: 10000 })

	// Click on result
	await songLink.click()

	// Wait for navigation to song page
	await page.waitForURL(/\/pisen\/[a-z0-9-]+/, { timeout: 10000 })

	// Verify song text is visible
	await expect(page.locator('text=/.*Kde.*/i').first()).toBeVisible()
})

smartTest('Vyhledávání podle textu', 'critical', async ({ page }) => {
	const sel = selectors(page)

	await page.goto('/')

	await searchWithSearchBar('Jsi darcem života', page)

	const songLink = sel.search.songResult('pokoj')
	await expect(songLink).toBeVisible({ timeout: 10000 })
	await songLink.click()

	await page.waitForURL(/\/pisen\/[a-z0-9-]+/, { timeout: 10000 })
})

smartTest('Vyhledávání podle jednoho písmene', 'critical', async ({ page }) => {
	const sel = selectors(page)

	await page.goto('/')

	await searchWithSearchBar('A', page)

	const songLink = sel.search.songResult('Až Až ulovíš severák')
	await expect(songLink).toBeVisible({ timeout: 10000 })
	await songLink.click()

	await page.waitForURL(/\/pisen\/[a-z0-9-]+/, { timeout: 10000 })
})

smartTest('Načíst další', 'critical', async ({ page }) => {
	const sel = selectors(page)

	await page.goto('/')
	await page.waitForLoadState('domcontentloaded')

	await searchWithSearchBar('Pokoj', page)

	const loadMoreButton = sel.search.loadMoreButton()
	await expect(loadMoreButton).toBeVisible({ timeout: 10000 })
	await loadMoreButton.click()

	// Verify button is still visible after loading more results
	await expect(loadMoreButton).toBeVisible()
})

smartTest('Neobsahuje cizí soukromé písně', 'critical', async ({ page }) => {
	await page.goto('/')

	const api = new SongSearchingApi()
	const searchStrings = [
		'Pokoj',
		'Láska',
		'Naděje',
		'Víra',
		'Oceány',
		'Jsi darcem',
		'A',
		'B',
		'C',
	]
	const randomStrings = Array.from({ length: 50 }, () => getRandomString(4))

	const allSearchStrings = [...searchStrings, ...randomStrings]

	for (const searchString of allSearchStrings) {
		const response = await handleServerApiCall(
			api.search(searchString, undefined, true)
		)

		for (const result of response) {
			const whole = [
				...result.found,
				...(result.other || []),
				...(result.original ? [result.original] : []),
			]

			for (const song of whole) {
				const data = mapBasicVariantPackApiToDto(song)
				expect(data.public, `Vyhledávání podle "${searchString}"`).toBeTruthy()
			}
		}
	}
})

smartTest(
	'Při přihlášení obsahuje uživatelovy soukromé písně',
	'critical',
	async ({ page }) => {
		await page.goto('/')

		const user = await login(page)

		const api = new SongSearchingApi()
		const searchStrings = ['Oceany']
		const randomStrings = Array.from({ length: 50 }, () => getRandomString(1))

		const allSearchStrings = [...searchStrings, ...randomStrings]

		let count = 0

		for (const searchString of allSearchStrings) {
			const response = await handleServerApiCall(
				api.search(searchString, undefined, true)
			)
			count += response.length

			for (const result of response) {
				const whole = [
					...result.found,
					...(result.other || []),
					...(result.original ? [result.original] : []),
				]

				for (const song of whole) {
					const data = mapBasicVariantPackApiToDto(song)

					if (!data.public) {
						expect(
							data.createdByGuid,
							`Soukromá píseň: vyhledána pomocí "${searchString}"`
						).toBe(user.guid)
					}
				}
			}
		}

		expect(count).toBeGreaterThan(0)
	}
)
