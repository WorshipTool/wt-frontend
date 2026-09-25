import { splitByMatch } from '../highlight.string.tech'

const shape = (text: string, query: string) =>
	splitByMatch(text, query).map((p) => (p.match ? `[${p.text}]` : p.text)).join('')

describe('splitByMatch', () => {
	it('marks the match inside a title', () => {
		expect(shape('Masithi amen', 'amen')).toBe('Masithi [amen]')
	})

	it('ignores case', () => {
		expect(shape('Amen, Otče', 'amen')).toBe('[Amen], Otče')
	})

	it('ignores diacritics on both sides', () => {
		// the whole point: "svaty" has to light up "Svátý"
		expect(shape('Svätý 01', 'svaty')).toBe('[Svätý] 01')
		expect(shape('Kámen', 'amen')).toBe('K[ámen]')
		expect(shape('Svatý', 'svátý')).toBe('[Svatý]')
	})

	it('keeps the original letters, not the folded ones', () => {
		const parts = splitByMatch('Kámen', 'amen')

		expect(parts.find((p) => p.match)?.text).toBe('ámen')
	})

	it('marks only the first occurrence', () => {
		expect(shape('Amen, amen', 'amen')).toBe('[Amen], amen')
	})

	it('returns the text whole when nothing matches', () => {
		expect(splitByMatch('Adonai', 'amen')).toEqual([
			{ text: 'Adonai', match: false },
		])
	})

	it('returns the text whole for an empty query', () => {
		expect(splitByMatch('Adonai', '  ')).toEqual([
			{ text: 'Adonai', match: false },
		])
	})
})
