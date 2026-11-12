import { firstLyricLine } from './sheetPreview'

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
