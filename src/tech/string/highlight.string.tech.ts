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

/** Characters of the line kept before a match when a line is trimmed to it. */
const LEAD_IN = 12

/** Split one text into lines, each line split into its matched and unmatched
 * pieces. A match that runs over a line break comes out marked on both. */
function linesOf(parts: HighlightPart[]): HighlightPart[][] {
	const lines: HighlightPart[][] = [[]]
	for (const part of parts) {
		const pieces = part.text.split('\n')
		pieces.forEach((piece, i) => {
			if (i > 0) lines.push([])
			if (piece !== '') lines[lines.length - 1].push({ ...part, text: piece })
		})
	}
	return lines
}

/**
 * Cut a line down so the match is near its start, with an ellipsis for what was
 * dropped. For a row that does not wrap: the matching line is no use if the
 * match itself is past the end of the row.
 */
function leadInTo(line: HighlightPart[], lead: number): HighlightPart[] {
	const at = line.findIndex((part) => part.match)
	if (at < 0) return line

	const before = line
		.slice(0, at)
		.map((p) => p.text)
		.join('')
	if (before.length <= lead) return line

	const kept = before.slice(-lead)
	// …from a word, not from the middle of one. Any whitespace, not a plain
	// space: a sheet carries non-breaking ones, and looking for the plain kind
	// left lines starting mid-word ("…ože, dík za").
	const space = kept.search(/\s/)
	const tail = space >= 0 ? kept.slice(space + 1) : kept

	return [{ text: `…${tail}`, match: false }, ...line.slice(at)]
}

/**
 * The lines of a song to show under its title in a result: the ones the search
 * actually matched, rather than the first ones of the first verse.
 *
 * A search that finds a song by its words says nothing if the card then shows a
 * verse those words are not in — the reader is left to take the result on
 * trust. So the match decides which lines are shown, and is marked in them.
 *
 * The song is matched whole, not line by line, because the search does not see
 * a line break either: `normalizeSearchText` drops it along with the rest of the
 * punctuation, so "amenotce" matches across "Amen,\nOtče" and is marked on both
 * lines. Blank lines are dropped — in a preview of one or two lines, an empty
 * one is a line wasted.
 *
 * @param count how many lines the preview has room for
 * @param lead for a row that does not wrap: trim a matching line to this many
 * characters before the match, so the match is on screen. Leave it out where
 * the text wraps and the whole line is readable anyway.
 */
export function previewLinesAroundMatch(
	text: string,
	query: string | undefined,
	count: number,
	lead?: number
): HighlightPart[][] {
	const lines = text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line !== '')
	if (count <= 0 || lines.length === 0) return []

	const trimmed = query?.trim() ?? ''
	const plain = () =>
		lines.slice(0, count).map((line) => [{ text: line, match: false }])
	if (trimmed === '') return plain()

	const split = linesOf(splitByMatch(lines.join('\n'), trimmed))
	const at = split.findIndex((line) => line.some((part) => part.match))
	// matched by its title, then, and the song opens where it always did
	if (at < 0) return plain()

	// …and if the match is near the end, back up enough to fill the preview
	const start = Math.min(at, Math.max(0, split.length - count))
	const window = split.slice(start, start + count)

	return lead === undefined
		? window
		: window.map((line) => leadInTo(line, lead))
}
