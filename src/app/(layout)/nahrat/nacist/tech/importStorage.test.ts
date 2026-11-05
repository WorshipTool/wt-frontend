import {
	chooseImportedSong,
	clearImport,
	EditorHandoff,
	loadChosenSong,
	loadImportResult,
	saveImportResult,
	StoredImportResult,
} from './importStorage'

const result: StoredImportResult = {
	id: 'r1',
	source: { kind: 'link', label: 'https://a.cz' },
	songs: [
		{
			title: 'Ráno',
			sheetData: '{V}[C]Ráno',
			confidence: 0.9,
			source: { url: 'https://a.cz', file: null, index: 0 },
		},
	],
}
const chosen: EditorHandoff = {
	title: 'Ráno',
	sheetData: '{V}[C]Ráno',
	sourceKind: 'link',
}

describe('importStorage: the stored import from results to saved', () => {
	beforeEach(() => window.sessionStorage.clear())

	it('keeps the found songs until one is chosen', () => {
		saveImportResult(result)
		expect(loadImportResult()).toEqual(result)
		expect(loadImportResult()).toEqual(result)
		expect(loadChosenSong()).toBeNull()
	})

	it('choosing a song replaces the list — the choice is final', () => {
		saveImportResult(result)
		chooseImportedSong(chosen)
		expect(loadImportResult()).toBeNull()
		expect(loadChosenSong()).toEqual(chosen)
	})

	it('reading the chosen song does not delete it (a reload reads it again)', () => {
		chooseImportedSong(chosen)
		expect(loadChosenSong()).toEqual(chosen)
		expect(loadChosenSong()).toEqual(chosen)
	})

	it('saving the song (or starting over) clears everything', () => {
		chooseImportedSong(chosen)
		clearImport()
		expect(loadChosenSong()).toBeNull()
		expect(loadImportResult()).toBeNull()
	})

	it('works without storage — it only forgets', () => {
		const spy = jest
			.spyOn(Storage.prototype, 'setItem')
			.mockImplementation(() => {
				throw new Error('QuotaExceededError')
			})
		expect(() => saveImportResult(result)).not.toThrow()
		expect(loadImportResult()).toBeNull()
		spy.mockRestore()
	})
})
