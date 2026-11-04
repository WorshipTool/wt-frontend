import { defaultSongIndex, firstLyricLine } from './sheetPreview'

describe('firstLyricLine', () => {
	it('drops chords and section markers', () => {
		expect(firstLyricLine('{V1}[G]Ráno ti [D]zpívám,\n[Em]světlo')).toBe(
			'Ráno ti zpívám,',
		)
	})

	it('skips lines that hold only markers or chords', () => {
		expect(firstLyricLine('\n{R}\n[C] [G]\n  Haleluja  ')).toBe('Haleluja')
	})

	it('is empty for a sheet without words', () => {
		expect(firstLyricLine('[C][G]\n{V1}')).toBe('')
	})
})

describe('defaultSongIndex', () => {
	it('picks the first song not saved yet', () => {
		expect(defaultSongIndex(3, {})).toBe(0)
		expect(defaultSongIndex(3, { 0: true })).toBe(1)
		expect(defaultSongIndex(3, { 0: true, 1: true, 2: true })).toBe(0)
	})
})
