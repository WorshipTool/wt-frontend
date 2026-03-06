import { Sheet } from '@pepavlin/sheet-api'

/**
 * Tests for chord detection logic used in SongVariantCard.
 * The card uses sheet.getKeyChord() to determine whether a song
 * has chord notation, and shows a guitar icon if it does.
 */
describe('SongCard chord detection', () => {
	describe('sheet.getKeyChord()', () => {
		it('returns a chord when sheetData contains chord notation', () => {
			const sheetData = '{V1}Lorem ipsum[C] \nnechodim na uprum\nTestovaci akordy[Am]'
			const sheet = new Sheet(sheetData)
			expect(sheet.getKeyChord()).toBeTruthy()
		})

		it('returns undefined/null when sheetData has no chords', () => {
			const sheetData = '{V1}Lorem ipsum\nnechodim na uprum\nBez akordov'
			const sheet = new Sheet(sheetData)
			expect(sheet.getKeyChord()).toBeFalsy()
		})

		it('returns a chord for a song with multiple chords across sections', () => {
			const sheetData = '{V1}Sloka[G]\n{C}Refrén[D][Em]'
			const sheet = new Sheet(sheetData)
			expect(sheet.getKeyChord()).toBeTruthy()
		})

		it('returns falsy for empty sheet data', () => {
			const sheet = new Sheet('')
			expect(sheet.getKeyChord()).toBeFalsy()
		})

		it('boolean conversion (hasChords pattern) works correctly', () => {
			const withChords = new Sheet('{V1}Text[C]')
			const withoutChords = new Sheet('{V1}Text only')

			expect(!!withChords.getKeyChord()).toBe(true)
			expect(!!withoutChords.getKeyChord()).toBe(false)
		})
	})
})
