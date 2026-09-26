import {
	previewLinesAroundMatch,
	splitByMatch,
} from '../highlight.string.tech'

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

	it('marks every occurrence, not only the first', () => {
		expect(shape('Amen, amen', 'amen')).toBe('[Amen], [amen]')
	})

	it('marks each word of a phrase the song does not have side by side', () => {
		// the search finds the song by its words, so the words are what is marked
		expect(shape('Chval Ho, ó duše má', 'chval duse')).toBe(
			'[Chval] Ho, ó [duše] má'
		)
	})

	it('prefers the phrase whole where the song has it', () => {
		expect(shape('nový den a nový začátek', 'nový den')).toBe(
			'[nový den] a nový začátek'
		)
	})

	it('leaves one-letter words out of a phrase', () => {
		expect(shape('A ty jsi král', 'a kral')).toBe('A ty jsi [král]')
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

const preview = (text: string, query: string | undefined, count: number, lead?: number) =>
	previewLinesAroundMatch(text, query, count, lead).map((line) =>
		line.map((p) => (p.match ? `[${p.text}]` : p.text)).join('')
	)

const SONG = [
	'Chval Ho, ó duše má,',
	'',
	'Slunce vychází,',
	'nový den začíná',
	'a je čas zpívat Tvou píseň zas.',
	'Cokoli se může stát',
].join('\n')

describe('previewLinesAroundMatch', () => {
	it('opens the song where it always did when nothing is searched', () => {
		expect(preview(SONG, undefined, 2)).toEqual([
			'Chval Ho, ó duše má,',
			'Slunce vychází,',
		])
	})

	it('skips the blank lines a one-line preview cannot afford', () => {
		expect(preview(SONG, '', 2)).toEqual([
			'Chval Ho, ó duše má,',
			'Slunce vychází,',
		])
	})

	it('shows the lines the search matched, not the first ones', () => {
		expect(preview(SONG, 'novy den', 2)).toEqual([
			'[nový den] začíná',
			'a je čas zpívat Tvou píseň zas.',
		])
	})

	it('opens the song at the top when only its title matched', () => {
		expect(preview(SONG, 'svatebni', 2)).toEqual([
			'Chval Ho, ó duše má,',
			'Slunce vychází,',
		])
	})

	it('backs up so the preview is still full at the end of a song', () => {
		expect(preview(SONG, 'cokoli', 2)).toEqual([
			'a je čas zpívat Tvou píseň zas.',
			'[Cokoli] se může stát',
		])
	})

	it('marks a match that runs over a line break, on both lines', () => {
		// the search drops the break with the rest of the punctuation
		expect(preview('Amen,\nOtče náš', 'amenotce', 2)).toEqual([
			'[Amen,]',
			'[Otče] náš',
		])
	})

	it('trims a line to the match for a row that cannot wrap', () => {
		expect(preview(SONG, 'pisen', 1, 12)).toEqual(['…Tvou [píseň] zas.'])
	})

	it('cuts at a non-breaking space too, as a sheet writes them', () => {
		const line = 'Bu\u010f,\u00a0Bo\u017ee,\u00a0d\u00edk\u00a0za\u00a0nov\u00fd den,'

		expect(preview(line, 'novy', 1, 12)).toEqual(['\u2026d\u00edk\u00a0za\u00a0[nov\u00fd] den,'])
	})

	it('leaves a short lead alone', () => {
		expect(preview(SONG, 'novy', 1, 12)).toEqual(['[nový] den začíná'])
	})
})
