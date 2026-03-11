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
 *
 * Uses two complementary strategies to detect that the search completed:
 *   1. Listen for the "searching/search" network response.
 *   2. Wait for visual search results (results heading or no-results message).
 *
 * The function succeeds when either signal fires, which makes it resilient
 * against flaky network-interception timing while still verifying that the
 * API returns a successful status when the response is captured.
 */
async function searchWithSearchBar(str: string, page: Page) {
	const sel = selectors(page)

	await page.waitForLoadState('domcontentloaded')

	const searchInput = sel.search.input()
	await expect(searchInput).toBeVisible()

	// Register the network listener before any user action
	const responsePromise = page.waitForResponse(
		(response) => response.url().includes('searching/search'),
		{ timeout: 60_000 },
	)

	// Clear existing value and type character-by-character to reliably
	// trigger React's synthetic onChange through the debounce chain.
	await searchInput.clear()
	await searchInput.pressSequentially(str, { delay: 50 })

	// Wait for results to appear in the DOM — this is the primary signal
	// that the search completed, independent of network interception.
	const resultsVisible = page
		.locator('text=/Výsledky vyhledávání|Nic jsme nenašli/i')
		.first()
		.waitFor({ state: 'visible', timeout: 60_000 })
		.then(() => ({ type: 'visual' as const }))

	// Use Promise.race: succeed as soon as EITHER the API response arrives
	// OR the results are visually rendered.
	const result = await Promise.race([
		responsePromise.then((res) => ({ type: 'response' as const, res })),
		resultsVisible,
	])

	// When we caught the network response, verify its status
	if (result.type === 'response') {
		expect([200, 201, 204]).toContain(result.res.status())
	}

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
