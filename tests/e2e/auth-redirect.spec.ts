import test, { expect } from '@playwright/test'
import { test_tech_loginWithData } from '../test.tech'

test('User visits song page, logs in manually, and stays on song page', async ({
	page,
}) => {
	// Step 1: Visit a song page while unauthenticated (should work fine, no redirect)
	const songUrl = '/pisen/a6d46/mou-cestu-v-rukou-mas'
	await page.goto(songUrl)

	// Step 2: Verify we're on the song page (no redirect should happen)
	await expect(page).toHaveURL(songUrl)

	// Step 3: Manually log in using the login button in the toolbar
	await test_tech_loginWithData(page)

	// Step 4: Should still be on the song page after login
	await expect(page).toHaveURL(songUrl)

	// Verify we're actually on the song page by checking for song-specific content
	await expect(page.getByText('Mou cestu v rukou máš').first()).toBeVisible()
})

test('User visits different song page, logs in manually, and stays on that song page', async ({
	page,
}) => {
	// Test with a different song to ensure it works for any song
	const songUrl = '/pisen/26515/52k6a'
	await page.goto(songUrl)

	// Verify we're on the song page (no redirect should happen)
	await expect(page).toHaveURL(songUrl)

	// Manually log in using the login button in the toolbar
	await test_tech_loginWithData(page)

	// Should still be on the song page after login
	await expect(page).toHaveURL(songUrl)
})
