import { Locator, Page } from '@playwright/test'

/**
 * Centralized selectors organized by page/feature.
 */
export class Selectors {
	constructor(private page: Page) {}

	// Search
	search = {
		input: () => this.page.getByPlaceholder(/.*Hledej.*/i),
		songResult: (songName: string) =>
			this.page.getByRole('link', { name: new RegExp(songName, 'i') }).first(),
		loadMoreButton: () =>
			this.page.getByRole('button', { name: 'Načíst další' }),
	}

	// Write Song Page
	writeSongPage = {
		titleInput: () =>
			this.page.getByRole('textbox', { name: 'Zadejte název písně' }),
		contentInput: () =>
			this.page.getByRole('textbox', { name: 'Zde je místo pro obsah písně' }),
		createButton: () =>
			this.page.getByRole('button', { name: 'Vytvořit (neveřejně)' }),
	}

	loginPage = {
		loginButton: () => this.page.getByRole('button', { name: 'Přihlásit se' }),
		emailInput: () =>
			this.page.getByRole('textbox', { name: 'Zadejte e-mail' }),
		passwordInput: () =>
			this.page.getByRole('textbox', { name: 'Zadejte heslo' }),
	}

	toolbar = {
		loginButton: () => this.page.getByRole('button', { name: 'Přihlásit se' }),
	}

	// Playlist
	playlist = {
		nameInput: () =>
			this.page.getByRole('textbox', { name: 'Název playlistu' }),
		createButton: () => this.page.getByRole('button', { name: 'Vytvořit' }),
		saveButton: () => this.page.getByRole('button', { name: 'Uložit' }),
		savedIndicator: () => this.page.getByRole('button', { name: 'Uloženo' }),
		addSongButton: () =>
			this.page.getByLabel('Přidat píseň do playlistu').getByRole('button'),
		searchInput: () =>
			this.page.getByRole('textbox', { name: 'Vyhledej píseň' }),
		songItems: (): Locator => this.page.locator('.song-menu-list p'),
		songDiv: (index: number) =>
			this.page.locator('.playlist-middle-song-list > div').nth(index),
		removeButton: (index: number = 0) =>
			this.page.getByRole('button', { name: 'Odebrat z playlistu' }).nth(index),
		transposeUpButton: (index: number = 0) =>
			this.page.getByRole('button', { name: 'Transpose up' }).nth(index),
		transposeDownButton: (index: number = 0) =>
			this.page.getByRole('button', { name: 'Transpose down' }).nth(index),
		presentationButton: () =>
			this.page.getByRole('button', { name: 'Prezentace' }),
		chordElements: () => this.page.locator('.chord'),
	}

	songPage = {
		createEditButton: () => this.page.getByText('Vytvořit úpravu'),
		printButton: () => this.page.getByRole('button', { name: /tisknout/i }),
		transposeUpButton: () =>
			this.page.getByRole('button', { name: 'Zvýšit o půltón' }),
		transposeDownButton: () =>
			this.page.getByRole('button', { name: 'Snížit o půltón' }),
	}

	// Popup
	popup = {
		content: () => this.page.getByTestId('song-select-popup'),
		addSongButton: () =>
			this.page
				.getByTestId('song-select-popup')
				.getByRole('button', { name: 'Přidat píseň' }),
		songListItem: (): Locator => this.page.locator('.global-song-list-item'),
	}
}

export function selectors(page: Page): Selectors {
	return new Selectors(page)
}
