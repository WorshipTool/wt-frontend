import { expect, Page } from '@playwright/test'
import { test_tech_loginWithData } from '../../../test.tech'

export const waitUntilPopupAndClose = async (page: Page) => {
	await page.waitForLoadState('networkidle', { timeout: 60000 })
	await page.waitForTimeout(1500)
	await page.mouse.click(10, 10)
	await page.waitForTimeout(500)
}

export const startWithCreatePlaylist = async (page: Page) => {
	await page.goto('/', { timeout: 30000 })
	await test_tech_loginWithData(page)
	await page.goto('/ucet/playlisty')
	await page.getByRole('button', { name: 'Vytvořit' }).click()

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
	await page.waitForLoadState('networkidle')
	await page.waitForTimeout(1000)

	await page.mouse.click(10, 10)
	await page.waitForTimeout(500)

	await page.getByLabel('Přidat píseň do playlistu').getByRole('button').click()
	await page.waitForLoadState('networkidle')
	await page.waitForTimeout(1000)

	await page.getByRole('textbox', { name: 'Vyhledej píseň' }).fill(searchQuery)
	await page.waitForTimeout(1000)
	await page.waitForLoadState('networkidle')
	await page.waitForTimeout(500)

	await page.locator('.global-song-list-item').first().click()
	await page.waitForTimeout(500)
	await page.waitForLoadState('networkidle')

	await page
		.locator('#popup-div-container')
		.getByRole('button', { name: 'Přidat píseň' })
		.click()

	await page.waitForTimeout(500)
	await page.mouse.click(10, 10)
	await page.waitForTimeout(500)
	await page.waitForLoadState('networkidle')

	const lastParagraph = await page
		.locator('.song-menu-list p')
		.last()
		.textContent()
	return lastParagraph || ''
}

export const addRandomSong = async (page: Page): Promise<string> => {
	const query = String.fromCharCode(97 + Math.floor(Math.random() * 26))
	return addSearchedSong(page, query)
}

export const removeSong = async (page: Page, songIndex: number) => {
	await page.waitForLoadState('networkidle')
	await page.waitForTimeout(500)

	await page.mouse.click(10, 10)
	await page.waitForTimeout(500)

	const button = page
		.getByRole('button', { name: 'Odebrat z playlistu' })
		.nth(songIndex)

	await expect(button).toBeVisible()
	await button.click()
	await page.waitForTimeout(500)
	await page.waitForLoadState('networkidle')
}

export const renamePlaylist = async (page: Page, newName?: string) => {
	newName = newName || `${Math.random().toString(36).substring(2, 7)}`

	const input = page.getByRole('textbox', { name: 'Název playlistu' })
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

	await page.waitForTimeout(300)

	expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual(
		[]
	)
	expect(
		failedRequests,
		`Network errors: ${failedRequests.join('\n')}`
	).toEqual([])
}

export const savePlaylist = async (page: Page) => {
	await page.waitForTimeout(1000)
	await page.waitForLoadState('networkidle')
	await page.getByRole('button', { name: 'Uložit' }).click()
	await page.waitForTimeout(1000)
	await page.waitForLoadState('networkidle')
	await page.waitForTimeout(1000)
	await page.waitForTimeout(500)
	await expect(page.getByRole('button', { name: 'Uloženo' })).toBeVisible({
		timeout: 30000,
	})
}

export const checkSongs = async (
	page: Page,
	songs: string[],
	message?: string
) => {
	const paragraphs = (
		await page.locator('.song-menu-list p').allTextContents()
	).filter((_, i) => i % 2 === 1)
	expect(
		paragraphs.every((v) => {
			return songs.some((s) => v.includes(s))
		}),
		message
	).toBeTruthy()
}

export const pagePlaylistReload = async (page: Page) => {
	await page.reload()
	await page.waitForLoadState('networkidle')
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
	for (let i = 0; i < Math.abs(transpose); i++) {
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(500)

		if (transpose > 0) {
			const button = page
				.getByRole('button', { name: 'Transpose up' })
				.nth(songIndex)
			await expect(button).toBeVisible()
			await button.click()
		} else {
			const button = page
				.getByRole('button', { name: 'Transpose down' })
				.nth(songIndex)
			await expect(button).toBeVisible()
			await button.click()
		}

		await page.waitForTimeout(1000)
		await page.waitForLoadState('networkidle')
	}
}

export const checkSongTransposition = async (
	page: Page,
	songIndex: number,
	songs: string[],
	toneKey: string,
	message?: string
) => {
	const songDiv = page
		.locator('.playlist-middle-song-list > div')
		.nth(songIndex)

	await expect(songDiv).toBeVisible()

	const chordElement = songDiv.locator('.chord').first()
	await expect(chordElement).toBeVisible()

	const chordText = await chordElement.textContent()
	expect(chordText?.trim().startsWith(toneKey), message).toBe(true)
}

export const openPresentation = async (page: Page) => {
	await page.waitForLoadState('networkidle')
	await page.waitForTimeout(500)

	const presentationButton = page.getByRole('button', { name: 'Prezentace' })
	await expect(presentationButton).toBeVisible()
	await presentationButton.click()

	await page.waitForLoadState('networkidle')
	await page.waitForTimeout(1500)

	await page.waitForURL('**/prezentace')
	await page.waitForTimeout(15000)
}
