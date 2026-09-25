import { normalizeCzechString } from '@/tech/string/string.tech'

/** A piece of text, and whether it is part of what was searched for. */
export type HighlightPart = {
	text: string
	match: boolean
}

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

/**
 * Split a title around the first occurrence of `query`, so a result can show
 * what the search actually matched.
 *
 * Diacritics and case are ignored on both sides — searching "svaty" has to
 * light up "Svátý", which is most of the point. The returned pieces are cut
 * from the original text, so what is rendered is still the real title.
 */
export function splitByMatch(text: string, query: string): HighlightPart[] {
	const needle = foldAll(query.trim())
	if (needle === '') return [{ text, match: false }]

	const start = foldAll(text).indexOf(needle)
	if (start < 0) return [{ text, match: false }]

	const end = start + needle.length
	const parts: HighlightPart[] = []
	if (start > 0) parts.push({ text: text.slice(0, start), match: false })
	parts.push({ text: text.slice(start, end), match: true })
	if (end < text.length) parts.push({ text: text.slice(end), match: false })
	return parts
}
