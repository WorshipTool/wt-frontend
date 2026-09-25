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

	it('reads a letter the way the rest of the app does', () => {
		// normalizeCzechString's own table: ô, ľ, ä are in it
		expect(shape('Aby ma rieka zmyla', 'ABY')).toBe('[Aby] ma rieka zmyla')
		expect(shape('Svätý', 'svaty')).toBe('[Svätý]')
	})

	it('folds letters the Czech table does not list', () => {
		// the Polish brand's own: ś, ę, ą are nowhere in that table, and the
		// search box has to find them anyway
		expect(shape('Pieśń o miłości', 'piesn')).toBe('[Pieśń] o miłości')
		expect(shape('Tęsknota', 'tesknota')).toBe('[Tęsknota]')
	})

	describe("under the app's own search normalization", () => {
		// normalizeSearchText is what the search itself runs on, so anything it
		// calls a match has to be underlinable — otherwise a result comes back
		// with nothing lit up and looks like a mistake

		it('sees y and i as one letter', () => {
			expect(shape('Svatý', 'svati')).toBe('[Svatý]')
			expect(shape('Chci Tě chválit', 'chci')).toBe('[Chci] Tě chválit')
		})

		it('reads straight through punctuation and spaces', () => {
			expect(shape('Amen, Otče', 'amenotce')).toBe('[Amen, Otče]')
		})

		it('counts a doubled letter once', () => {
			expect(shape('Haleluja', 'halleluja')).toBe('[Haleluja]')
			expect(shape('Agnus Dei, Halleluja', 'haleluja')).toBe(
				'Agnus Dei, [Halleluja]'
			)
		})

		it('folds mne to me, as the search does', () => {
			expect(shape('Ach, obnov mne', 'obnovme')).toBe('Ach, [obnov mne]')
		})

		it('still finds nothing when there is nothing', () => {
			expect(splitByMatch('Adonai', 'betlem')).toEqual([
				{ text: 'Adonai', match: false },
			])
		})
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
