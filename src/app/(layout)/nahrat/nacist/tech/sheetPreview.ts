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

/**
 * Which found song is chosen when the list opens: the first one not saved yet,
 * so coming back from saving one moves on to the next; the first when all are.
 */
export function defaultSongIndex(
	count: number,
	saved: Record<number, unknown>,
): number {
	for (let i = 0; i < count; i++) if (!saved[i]) return i
	return 0
}
