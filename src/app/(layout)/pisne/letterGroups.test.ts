import { GetListSongData } from '@/api/generated'
import { firstLetter, groupByFirstLetter } from './letterGroups'

const song = (title: string) => ({ main: { title } }) as GetListSongData

describe('firstLetter', () => {
	it('upper-cases the first character', () => {
		expect(firstLetter('amen')).toBe('A')
	})

	it('keeps Czech letters whole', () => {
		expect(firstLetter('Čas')).toBe('Č')
		expect(firstLetter('řeka')).toBe('Ř')
	})

	it('ignores leading space', () => {
		expect(firstLetter('   Amen')).toBe('A')
	})

	it('files a title with nothing to read under #', () => {
		expect(firstLetter('')).toBe('#')
		expect(firstLetter('   ')).toBe('#')
	})

	it('leaves a digit as it is', () => {
		expect(firstLetter('10 000 důvodů')).toBe('1')
	})
})

describe('groupByFirstLetter', () => {
	it('starts a section at every new letter', () => {
		const groups = groupByFirstLetter([
			song('Amen'),
			song('Ať'),
			song('Blízko'),
		])

		expect(groups.map((g) => g.letter)).toEqual(['A', 'B'])
		expect(groups[0].items).toHaveLength(2)
	})

	it('keeps two runs of one letter apart, in the order they arrived', () => {
		// the list is the backend's; a second run means its collation put
		// something between them, and merging the two would reorder the page
		const groups = groupByFirstLetter([song('Amen'), song('Blízko'), song('Ave')])

		expect(groups.map((g) => g.letter)).toEqual(['A', 'B', 'A'])
	})

	it('returns nothing for nothing', () => {
		expect(groupByFirstLetter([])).toEqual([])
	})
})
