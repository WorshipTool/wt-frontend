import normalizeSearchText from '@/tech/string/normalizeSearchText'
import { normalizeCzechString } from '@/tech/string/string.tech'

/** A piece of text, and whether it is part of what was searched for. */
export type HighlightPart = {
	text: string
	match: boolean
}

/** Where a match sits in the original text: [from, to). */
type Range = [number, number]

/**
 * Fold one character for comparison: no diacritics, lower case.
 *
 * The project's own table first (`normalizeCzechString`), so this agrees with
 * how the rest of the app reads a letter, then NFD for anything the table does
 * not list — Polish is a brand too, and ą, ę and ś are not in it.
 *
 * Character by character on purpose. Folding a whole string with NFD expands
 * each accented letter into two code points, so positions in the folded text no
 * longer line up with the original — and the highlight would land a letter or
 * two off on any Czech title. For the same reason a mapping that is not one
 * character long (ß → ss, æ → ae) is left alone rather than applied.
 */
function fold(char: string): string {
	const mapped = normalizeCzechString(char)
	const base = mapped.length === 1 ? mapped : char
	const stripped = base.normalize('NFD').replace(/[̀-ͯ]/g, '')
	return (stripped[0] ?? base).toLocaleLowerCase('cs')
}

function foldAll(text: string): string {
	let out = ''
	for (const char of text) out += fold(char)
	return out
}

/** Exactly what was typed, accents and case aside. */
function findExact(text: string, query: string): Range | null {
	const needle = foldAll(query)
	if (needle === '') return null

	const start = foldAll(text).indexOf(needle)
	if (start < 0) return null
	return [start, start + needle.length]
}

/** One character of the app's search normalization, and the slice of the
 * original text it was made from. */
type NormalizedChar = {
	char: string
	from: number
	to: number
}

/**
 * `normalizeSearchText`, done one character at a time so every character of the
 * result still knows where it came from.
 *
 * It is the same pipeline in the same order — the project's letter table,
 * then everything that is not a letter or digit dropped, lower case, `mne` to
 * `me`, `y` to `i`, and runs of one letter collapsed. Keep the two in step: a
 * step added there and not here means a search that finds a song this cannot
 * underline.
 */
function normalizeWithSource(text: string): {
	normalized: string
	chars: NormalizedChar[]
} {
	let chars: NormalizedChar[] = []

	// the letter table, the alphanumeric filter and the case, per character
	let index = 0
	for (const char of text) {
		const from = index
		index += char.length
		const mapped = normalizeCzechString(char)
		for (const out of mapped) {
			if (!/[A-Za-z0-9]/.test(out)) continue
			chars.push({ char: out.toLowerCase(), from, to: index })
		}
	}

	// `mne` → `me`: the n goes, and the m it followed keeps its span
	const withoutMne: NormalizedChar[] = []
	for (let i = 0; i < chars.length; i++) {
		const isMne =
			chars[i].char === 'n' &&
			withoutMne[withoutMne.length - 1]?.char === 'm' &&
			chars[i + 1]?.char === 'e'
		if (isMne) {
			withoutMne[withoutMne.length - 1].to = chars[i].to
			continue
		}
		withoutMne.push({ ...chars[i] })
	}
	chars = withoutMne

	// `y` → `i`
	for (const c of chars) if (c.char === 'y') c.char = 'i'

	// a run of one letter counts as one
	const collapsed: NormalizedChar[] = []
	for (const c of chars) {
		const previous = collapsed[collapsed.length - 1]
		if (previous && previous.char === c.char) {
			previous.to = c.to
			continue
		}
		collapsed.push(c)
	}

	return { normalized: collapsed.map((c) => c.char).join(''), chars: collapsed }
}

/** What the app's own search would call a match, mapped back onto the text. */
function findNormalized(text: string, query: string): Range | null {
	const needle = normalizeSearchText(query)
	if (needle === '') return null

	const { normalized, chars } = normalizeWithSource(text)
	const start = normalized.indexOf(needle)
	if (start < 0) return null

	return [chars[start].from, chars[start + needle.length - 1].to]
}

/**
 * Split a title around what a search matched in it, so a result can show why it
 * is in the list.
 *
 * Two passes, because the app searches more loosely than it reads. First what
 * was actually typed, accents and case aside — that underlines exactly what you
 * see in the field. Failing that, what `normalizeSearchText` would call a match,
 * which is what the search itself ran on: punctuation gone, doubled letters
 * counted once, y and i the same letter. So "svati" underlines "Svatý", and
 * "amenotce" underlines "Amen, Otče" — comma and space included, since the
 * search saw straight through them.
 *
 * The pieces are cut from the original text, so what is rendered is still the
 * real title.
 */
export function splitByMatch(text: string, query: string): HighlightPart[] {
	const trimmed = query.trim()
	const range = findExact(text, trimmed) ?? findNormalized(text, trimmed)
	if (!range) return [{ text, match: false }]

	const [from, to] = range
	const parts: HighlightPart[] = []
	if (from > 0) parts.push({ text: text.slice(0, from), match: false })
	parts.push({ text: text.slice(from, to), match: true })
	if (to < text.length) parts.push({ text: text.slice(to), match: false })
	return parts
}
