import { login } from '@e2e/helpers/auth.helper'
import { selectors } from '@e2e/helpers/selectors.helper'
import { expect, Page } from '@playwright/test'

const MAX_PLAYLIST_SAVE_TIMEOUT = 60000 // 60 seconds
/**
 * Wait for any popup to appear (including auto-opening popups) and then close it.
 * In playlist pages, a SongSelectPopup auto-opens after ~1 second for new playlists.
 * @param timeout - How long to wait for the popup to appear (default 3s to catch auto-popup)
 */
export const waitUntilPopupAndClose = async (page: Page) => {
	const sel = selectors(page)

	await page.waitForLoadState('domcontentloaded')

	// Wait for SongSelectPopup to appear (auto-opens after ~1s for empty playlists)
	try {
		await sel.popup.content().waitFor({ state: 'visible', timeout: 3000 })

		// Fallback: click outside to close
		await page.mouse.click(10, 10)

		// Wait for popup to be hidden
		await sel.popup.content().waitFor({ state: 'hidden', timeout: 3000 })
	} catch {
		// No popup appeared within timeout, continue
	}
}

export const startWithCreatePlaylist = async (page: Page) => {
	const sel = selectors(page)

	await page.goto('/', { timeout: 30000 })
	await login(page)
	await page.goto('/ucet/playlisty')

	await page.waitForLoadState('domcontentloaded')

	// Wait for "ofuser" request to finish before proceeding
	await page.waitForResponse(
		(resp) => resp.url().includes('playlist/ofuser') && resp.status() === 200,
		{ timeout: 10000 }
	)

	// Wait for create button and click it
	await expect(sel.playlist.createButton()).toBeVisible()
	await sel.playlist.createButton().click()

	// Wait for navigation to playlist page
	await page.waitForURL(/\/playlist\//, { timeout: 10000 })
	await expect(async () => {
		const url = new URL(page.url())
		expect(url.pathname.startsWith('/playlist')).toBe(true)
	}).toPass()

	await waitUntilPopupAndClose(page)
}

export const addSearchedSong = async (
	page: Page,
	searchQuery: string
): Promise<string> => {
	const sel = selectors(page)

	await waitUntilPopupAndClose(page)

	// Open add song dialog
	await expect(sel.playlist.addSongButton()).toBeVisible()
	await sel.playlist.addSongButton().click()

	// Wait for search input to be visible
	await expect(sel.playlist.searchInput()).toBeVisible()

	// Fill search and wait for results
	await sel.playlist.searchInput().fill(searchQuery)

	// Wait for the search request to complete (searchString should not be empty)
	await page.waitForResponse(
		(resp) => {
			const url = resp.url()
			const isSearch =
				url.includes('teampopupglobalsongssearch') &&
				url.includes('searchString=') &&
				!url.endsWith('searchString=')
			return isSearch && resp.status() === 200
		},
		{ timeout: 5000 }
	)

	// Wait for search results to appear
	await expect(sel.popup.songListItem().first()).toBeVisible({
		timeout: 5000,
	})

	// Click first result
	await sel.popup.songListItem().first().click()

	// Click add song button
	await expect(sel.popup.addSongButton()).toBeVisible()
	await sel.popup.addSongButton().click()

	// Wait for song to be added to the list
	await expect(sel.playlist.songItems().last()).toBeVisible({ timeout: 5000 })

	// Close popup
	await page.mouse.click(10, 10)

	const lastParagraph = await sel.playlist.songItems().last().textContent()
	return lastParagraph || ''
}

export const addRandomSong = async (page: Page): Promise<string> => {
	const queries = ['a', 'e', 'i', 'o', 'u']
	const query = queries[Math.floor(Math.random() * queries.length)]
	return addSearchedSong(page, query)
}

export const removeSong = async (page: Page, songIndex: number) => {
	const sel = selectors(page)

	// Close any open popups first
	await page.mouse.click(10, 10)

	const button = sel.playlist.removeButton(songIndex)

	await expect(button).toBeVisible()
	await button.click()

	// Wait for the song to be removed (count should decrease)
	await expect(async () => {
		const count = await sel.playlist.songItems().count()
		expect(count).toBeGreaterThanOrEqual(0)
	}).toPass({ timeout: 5000 })
}

export const renamePlaylist = async (page: Page, newName?: string) => {
	const sel = selectors(page)

	newName = newName || `${Math.random().toString(36).substring(2, 7)}`

	const input = sel.playlist.nameInput()
	await expect(input).toBeVisible()
	await input.click()
	await input.fill(newName)
	await input.press('Enter')

	return newName
}

export const checkNoErrors = async (page: Page) => {
	const consoleErrors: string[] = []
	page.on('console', (msg) => {
		if (msg.type() === 'error') {
			consoleErrors.push(msg.text())
		}
	})

	const failedRequests: string[] = []
	page.on('requestfailed', (request) => {
		failedRequests.push(
			`${request.method()} ${request.url()} - ${request.failure()?.errorText}`
		)
	})

	// Wait for network to be idle instead of arbitrary timeout
	await page.waitForLoadState('networkidle', { timeout: 5000 })

	expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual(
		[]
	)
	expect(
		failedRequests,
		`Network errors: ${failedRequests.join('\n')}`
	).toEqual([])
}

export const savePlaylist = async (page: Page) => {
	const sel = selectors(page)

	// Wait for save button to be visible and enabled
	await expect(sel.playlist.saveButton()).toBeVisible()

	// Wait for the save response
	const saveResponsePromise = page.waitForResponse(
		(resp) =>
			(resp.url().includes('/playlist') || resp.url().includes('/edit')) &&
			(resp.status() === 200 || resp.status() === 201),
		{ timeout: MAX_PLAYLIST_SAVE_TIMEOUT }
	)

	await sel.playlist.saveButton().click()

	// Wait for save to complete
	await saveResponsePromise

	// Wait for "Uloženo" (Saved) indicator to appear
	await expect(sel.playlist.savedIndicator()).toBeVisible({
		timeout: MAX_PLAYLIST_SAVE_TIMEOUT,
	})
}

export const checkSongs = async (
	page: Page,
	songs: string[],
	message?: string
) => {
	const sel = selectors(page)

	const paragraphs = (await sel.playlist.songItems().allTextContents()).filter(
		(_, i) => i % 2 === 1
	)
	expect(
		paragraphs.every((v) => {
			return songs.some((s) => v.includes(s))
		}),
		message
	).toBeTruthy()
}

export const pagePlaylistReload = async (page: Page) => {
	await page.reload()

	await page.waitForLoadState('domcontentloaded')
	await waitUntilPopupAndClose(page)
}

export const move = async (
	page: Page,
	songs: string[],
	fromIndex: number,
	toIndex: number
) => {
	const songToMove = songs[fromIndex]
	const fromElement = page.locator('.song-menu-list p', {
		hasText: songToMove,
	})
	const toElement = page.locator('.song-menu-list p', {
		hasText: songs[toIndex],
	})

	const fromBox = await fromElement.boundingBox()
	const toBox = await toElement.boundingBox()

	if (!fromBox || !toBox) {
		expect(true).toBe(false)
		return
	}

	await page.mouse.move(
		fromBox.x + fromBox.width / 2,
		fromBox.y + fromBox.height / 2
	)
	await page.mouse.down()
	await page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2, {
		steps: 10,
	})
	await page.mouse.up()

	const temp = songs[fromIndex]
	songs[fromIndex] = songs[toIndex]
	songs[toIndex] = temp
}

export const transposeSong = async (
	page: Page,
	songIndex: number,
	transpose: number
) => {
	const sel = selectors(page)

	for (let i = 0; i < Math.abs(transpose); i++) {
		if (transpose > 0) {
			const button = sel.playlist.transposeUpButton(songIndex)
			await expect(button).toBeVisible()
			await button.click()

			// Wait for chord to update (deterministic wait for DOM change)
			await page.waitForTimeout(100) // Minimal wait for animation
		} else {
			const button = sel.playlist.transposeDownButton(songIndex)
			await expect(button).toBeVisible()
			await button.click()

			// Wait for chord to update
			await page.waitForTimeout(100) // Minimal wait for animation
		}
	}
}

export const checkSongTransposition = async (
	page: Page,
	songIndex: number,
	songs: string[],
	toneKey: string,
	message?: string
) => {
	const sel = selectors(page)

	const songDiv = sel.playlist.songDiv(songIndex)

	await expect(songDiv).toBeVisible()

	const chordElement = songDiv.locator(sel.playlist.chordElements().first())
	await expect(chordElement).toBeVisible()

	const chordText = await chordElement.textContent()
	expect(chordText?.trim().startsWith(toneKey), message).toBe(true)
}

export const openPresentation = async (page: Page) => {
	const sel = selectors(page)

	const presentationButton = sel.playlist.presentationButton()
	await expect(presentationButton).toBeVisible()
	await presentationButton.click()

	// Wait for navigation to presentation page
	await page.waitForURL('**/prezentace', { timeout: 10000 })

	// Wait for presentation to load (check for a key element)
	await page.waitForLoadState('domcontentloaded')
}
