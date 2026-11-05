/**
 * The first line of lyrics in a sheet, for a one-line list preview: chords
 * (`[C]`) and section markers (`{V1}`) taken out, blank lines skipped.
 */
export function firstLyricLine(sheetData: string): string {
	for (const raw of sheetData.split('\n')) {
		const line = raw
			.replace(/\{[^}]*\}/g, '')
			.replace(/\[[^\]]*\]/g, '')
			.replace(/\s+/g, ' ')
			.trim()
		if (line) return line
	}
	return ''
}
