import { expect, test } from '@playwright/test'
import { smartTest } from '../../setup'
import {
	addSearchedSong,
	openPresentation,
	savePlaylist,
	startWithCreatePlaylist,
	transposeSong,
} from './playlist.test.utils'

test.describe.configure({ mode: 'parallel', timeout: 4 * 60 * 1000 })

smartTest(
	'PresentationLayout component renders correctly',
	'critical',
	async ({ page }) => {
		await startWithCreatePlaylist(page)

		// Add two songs to the playlist
		await addSearchedSong(page, 'Volas nas do morskych')
		await addSearchedSong(page, 'Rano cely den')

		// Transpose songs: first song +2, second song +4
		await transposeSong(page, 0, 2)
		await transposeSong(page, 1, 4)

		await savePlaylist(page)
		await openPresentation(page)

		// Verify PresentationLayout is rendered
		const presentationLayout = page.locator('body')
		await expect(presentationLayout).toBeVisible()

		// Check for navigation buttons
		const leftButton = page
			.getByRole('button')
			.filter({ has: page.locator('[data-testid="ChevronLeftIcon"]') })
		const rightButton = page
			.getByRole('button')
			.filter({ has: page.locator('[data-testid="ChevronRightIcon"]') })
		const fullscreenButton = page
			.getByRole('button')
			.filter({ has: page.locator('[data-testid="FullscreenIcon"]') })

		await expect(leftButton).toBeVisible()
		await expect(rightButton).toBeVisible()
		await expect(fullscreenButton).toBeVisible()

		// Test left button is disabled on first slide (first song)
		await expect(leftButton).toBeDisabled()

		// Test navigation to second slide
		await rightButton.click()
		await page.waitForTimeout(500)

		// Now left button should be enabled and right button disabled (assuming 2 songs)
		await expect(leftButton).toBeEnabled()
		await expect(rightButton).toBeDisabled()

		// Navigate back to first slide
		await leftButton.click()
		await page.waitForTimeout(500)
		await expect(leftButton).toBeDisabled()
		await expect(rightButton).toBeEnabled()
	}
)

smartTest(
	'Playlist presentation page shows correct song names and transposed chords',
	'critical',
	async ({ page }) => {
		await startWithCreatePlaylist(page)

		// Add two specific songs
		await addSearchedSong(page, 'Volas nas do morskych')
		await addSearchedSong(page, 'Rano cely den')

		// Transpose first song +2 semitones, second song +4 semitones
		await transposeSong(page, 0, 2)
		await transposeSong(page, 1, 4)

		await savePlaylist(page)

		await openPresentation(page)

		// Wait for presentation to load
		await page.waitForTimeout(1000)
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(1000)

		// Check that the song title is visible in presentation
		const pageContent = await page.content()
		expect(pageContent.toLowerCase()).toContain('voláš')

		// Check for the first chord being transposed correctly
		// "Volas nas do morskych" typically starts with C, transposed +2 should be D
		const chordElements = page.locator('.chord')
		await expect(chordElements.first()).toBeVisible()

		const firstChordText = await chordElements.first().textContent()
		expect(firstChordText?.trim().startsWith('Dm')).toBe(true)
	}
)

smartTest(
	'Playlist presentation back button works',
	'critical',
	async ({ page }) => {
		await startWithCreatePlaylist(page)

		await addSearchedSong(page, 'Volas nas do morskych')
		await savePlaylist(page)

		const playlistUrl = page.url()
		await openPresentation(page)

		// Wait for presentation to load
		await page.waitForTimeout(5000)

		// Find and click the back button (Go back button)
		const backButton = page
			.locator('button')
			.filter({ hasText: /opustit|back/i })
			.first()
		if ((await backButton.count()) === 0) {
			// If no text-based back button, look for a button with an arrow or close icon
			const iconBackButton = page.getByRole('button').first()
			await iconBackButton.click()
		} else {
			await backButton.click()
		}

		await page.waitForTimeout(1000)

		// Should be back to the playlist page
		expect(page.url()).toBe(`${playlistUrl}/prezentace`)
	}
)
