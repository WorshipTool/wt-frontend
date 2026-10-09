import { Locator, Page } from '@playwright/test'

/**
 * Centralized selectors organized by page/feature.
 */
export class Selectors {
	constructor(private page: Page) {}

	// Search
	search = {
		input: () => this.page.getByTestId('main-search-input'),
		songResult: (songName: string) =>
			this.page.getByRole('link', { name: new RegExp(songName, 'i') }).first(),
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
		/** Sign in and sign up offer Google and e-mail as two equal ways in, and
		 * the e-mail form waits behind this until it is chosen. */
		continueWithEmail: () =>
			this.page.getByRole('button', { name: 'Pokračovat e-mailem' }),
		loginButton: () => this.page.getByRole('button', { name: 'Přihlásit se' }),
		emailInput: () =>
			this.page.getByRole('textbox', { name: 'Zadejte e-mail' }),
		passwordInput: () =>
			this.page.getByRole('textbox', { name: 'Zadejte heslo' }),
	}

	signupPage = {
		continueWithEmail: () =>
			this.page.getByRole('button', { name: 'Pokračovat e-mailem' }),
		// named by the label above them, which is what a screen reader reads
		firstNameInput: () =>
			this.page.getByRole('textbox', { name: 'Jméno', exact: true }),
		lastNameInput: () =>
			this.page.getByRole('textbox', { name: 'Příjmení', exact: true }),
		signupButton: () =>
			this.page.getByRole('button', { name: 'Vytvořit účet' }),
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
		// the same names the song page's own transpose controls carry; they were
		// English placeholders in the Czech catalog until they got translated
		transposeUpButton: (index: number = 0) =>
			this.page.getByRole('button', { name: 'Zvýšit o půltón' }).nth(index),
		transposeDownButton: (index: number = 0) =>
			this.page.getByRole('button', { name: 'Snížit o půltón' }).nth(index),
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
