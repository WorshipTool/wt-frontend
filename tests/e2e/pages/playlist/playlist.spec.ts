import { getRandomInt } from '@/tech/number/getRandomInt'
import { expect, Page, test } from '@playwright/test'
import { test_tech_loginWithData } from '../../../test.tech'
import { smartTest } from '../../setup'
import {
	addRandomSong,
	addSearchedSong,
	checkSongs,
	checkSongTransposition,
	move,
	pagePlaylistReload,
	removeSong,
	renamePlaylist,
	savePlaylist,
	startWithCreatePlaylist,
	transposeSong,
} from './playlist.test.utils'

test.describe.configure({ mode: 'parallel', timeout: 4 * 60 * 1000 }) // 4 minutes

smartTest('Playlist list loads', 'critical', async ({ page }) => {
	await page.goto('/')

	await test_tech_loginWithData(page)

	await page.goto('/ucet/playlisty')

	await expect(
		page.getByRole('heading', { name: 'Moje playlisty' })
	).toBeVisible()
})

smartTest('Can create a new playlist', 'critical', async ({ page }) => {
	await startWithCreatePlaylist(page)

	await expect(page).toHaveURL(/\/playlist/)

	await page.waitForTimeout(1000)
	// close popup
	await page.mouse.click(10, 10)
})

smartTest('Can rename a playlist', 'critical', async ({ page }) => {
	await startWithCreatePlaylist(page)

	await expect(
		page.getByRole('textbox', { name: 'Název playlistu' })
	).toBeVisible()

	const newName = 'asdfihelhalhi ohi'
	await renamePlaylist(page, newName)

	await expect(
		page.getByRole('textbox', { name: 'Název playlistu' })
	).toHaveValue(newName)

	await savePlaylist(page)

	await page.reload()
	await page.waitForLoadState('networkidle')

	await expect(
		page.getByRole('textbox', { name: 'Název playlistu' })
	).toHaveValue(newName)
})

smartTest('Can add a song to a playlist', 'critical', async ({ page }) => {
	await startWithCreatePlaylist(page)

	const song = await addRandomSong(page)
	await checkSongs(page, [song], 'Before save: song not added to playlist')
	await savePlaylist(page)

	await checkSongs(page, [song], 'After save: song not added to playlist')
	await page.reload()
	await page.waitForLoadState('networkidle')
	await checkSongs(page, [song], 'After reload: song not added to playlist')
})

smartTest(
	'Song not added to playlist without save',
	'critical',
	async ({ page }) => {
		await startWithCreatePlaylist(page)

		const song = await addRandomSong(page)
		await checkSongs(page, [song])

		await pagePlaylistReload(page)
		await checkSongs(page, [])
	}
)

smartTest(
	'should save playlist without any songs',
	'critical',
	async ({ page }) => {
		await startWithCreatePlaylist(page)

		const song = await addRandomSong(page)
		await checkSongs(page, [song])
		await savePlaylist(page)
		await removeSong(page, 0)

		await savePlaylist(page)
		await pagePlaylistReload(page)
		await checkSongs(page, [])
	}
)

smartTest('Song can be removed from playlist', 'critical', async ({ page }) => {
	await startWithCreatePlaylist(page)

	const song = await addRandomSong(page)

	await checkSongs(
		page,
		[song],
		'Song was not added to playlist before removal'
	)
	await savePlaylist(page)
	await pagePlaylistReload(page)

	await checkSongs(page, [song], 'Song was not added to playlist after reload')

	await removeSong(page, 0)
	await checkSongs(
		page,
		[],
		'Song was not removed from playlist before refresh'
	)

	await savePlaylist(page)
	await pagePlaylistReload(page)
	await checkSongs(page, [], 'Song was not removed from playlist after refresh')
})

smartTest(
	'Songs can be reordered in playlist',
	'critical',
	async ({ page }) => {
		await startWithCreatePlaylist(page)

		const songs: string[] = [
			await addRandomSong(page),
			await addRandomSong(page),
			await addRandomSong(page),
		]

		await savePlaylist(page)
		await pagePlaylistReload(page)

		await checkSongs(page, songs, 'Songs were not added to playlist after save')

		// Reorder songs by dragging and dropping

		await move(page, songs, 0, 1)
		await checkSongs(
			page,
			songs,
			'Songs were not reordered after first move before save'
		)
		await savePlaylist(page)
		await pagePlaylistReload(page)
		await checkSongs(page, songs, 'Songs were not reordered after first save')
	}
)

smartTest('Song can be searched in playlist', 'critical', async ({ page }) => {
	await startWithCreatePlaylist(page)

	const songs = [
		await addSearchedSong(page, 'Ocean'),
		await addSearchedSong(page, 'Rano cely den'),
	]

	await checkSongs(page, songs, 'Song not added to playlist after search')

	await savePlaylist(page)
	await pagePlaylistReload(page)
	await checkSongs(
		page,
		songs,
		'Song not added to playlist after search and save'
	)
})

smartTest(
	'Song can be transposed in playlist',
	'critical',
	async ({ page }) => {
		await startWithCreatePlaylist(page)
		const songs = [
			await addSearchedSong(page, 'Volas nas do morskych'),
			await addSearchedSong(page, 'Jsi darcem zivota a darcem'),
		]
		await checkSongs(page, songs, 'Song not added to playlist after search')

		await transposeSong(page, 0, 4)
		await checkSongTransposition(
			page,
			0,
			songs,
			'E',
			'Song not transposed before save'
		)
		await savePlaylist(page)

		await pagePlaylistReload(page)
		await checkSongs(page, songs)
		await checkSongTransposition(
			page,
			0,
			songs,
			'E',
			'First song not transposed after reload'
		)
		// also check transposition

		await transposeSong(page, 1, -5)
		await checkSongTransposition(
			page,
			1,
			songs,
			'G',
			'Second song not transposed after reload'
		)
		await savePlaylist(page)
		await pagePlaylistReload(page)

		await checkSongTransposition(
			page,
			0,
			songs,
			'E',
			'First song not transposed after second reload'
		)
		await checkSongTransposition(
			page,
			1,
			songs,
			'G',
			'Second song not transposed after second reload'
		)
	}
)

const testEditing = async ({ page }: { page: Page }) => {
	await startWithCreatePlaylist(page)

	await expect(
		page.getByRole('textbox', { name: 'Název playlistu' })
	).toBeVisible()

	type AddAction = {
		type: 'add'
	}
	type RemoveAction = {
		type: 'remove'
	}
	type RenameAction = {
		type: 'rename'
		name?: string
	}
	type Action = AddAction | RemoveAction | RenameAction

	let name = 'Nový playlist'
	const songs: string[] = []

	const doChangeIterations = async () => {
		const addCount = getRandomInt(3, 7)
		const removeCount = Math.floor(Math.random() * (addCount - 1)) + 1
		const actions: Action[] = [
			...(Array.from({ length: addCount }, () => ({
				type: 'add',
			})) satisfies AddAction[]),
			...(Array.from({ length: removeCount }, () => ({
				type: 'remove',
			})) satisfies RemoveAction[]),
			{
				type: 'rename',
			},
		]

		// Shuffle actions array
		actions.sort(() => Math.random() - 0.5)
		for (const action of actions) {
			if (action.type === 'add') {
				const song = await addRandomSong(page)
				songs.push(song)
			} else if (action.type === 'remove') {
				if (songs.length === 0) {
					continue // skip if no songs to remove
				}
				const i = Math.floor(Math.random() * songs.length)
				await removeSong(page, i)
				songs.splice(i, 1)
			} else if (action.type === 'rename') {
				name = await renamePlaylist(page, action.name)
			}
		}
	}
	await doChangeIterations()
	await savePlaylist(page)
	await checkSongs(page, songs)

	await doChangeIterations()
	await savePlaylist(page)
	await checkSongs(
		page,
		songs,
		'Songs do not match after changes after second save'
	)

	await pagePlaylistReload(page)

	await expect(
		page.getByRole('textbox', { name: 'Název playlistu' })
	).toHaveValue(name)

	await checkSongs(page, songs, 'Refreshed song list does not match')

	await doChangeIterations()
	await savePlaylist(page)
	await checkSongs(
		page,
		songs,
		'Songs do not match after changes after refresh'
	)

	await pagePlaylistReload(page)
	await page.waitForLoadState('networkidle')

	await expect(
		page.getByRole('textbox', { name: 'Název playlistu' })
	).toHaveValue(name)

	await checkSongs(page, songs, 'Songs do not match after final refresh')
}

smartTest('Can edit a playlist 1', 'full', testEditing)
smartTest('Can edit a playlist 2', 'full', testEditing)
