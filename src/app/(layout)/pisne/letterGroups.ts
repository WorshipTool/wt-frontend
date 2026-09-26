import { GetListSongData } from '@/api/generated'

/** First letter of a song title, upper-cased for a section header. */
export function firstLetter(title: string): string {
	return (title.trim().charAt(0) || '#').toLocaleUpperCase('cs')
}

export type LetterGroup = {
	letter: string
	items: GetListSongData[]
}

/**
 * Split an alphabetical page of songs into consecutive first-letter sections,
 * so each new starting letter gets a header.
 *
 * Consecutive runs, not a map: the backend returns the list sorted, and two
 * runs of the same letter on one page are possible (mixed collation, or two
 * untitled songs both landing on '#'). Grouping into a map would silently pull
 * those together and break the order the list arrived in.
 */
export function groupByFirstLetter(items: GetListSongData[]): LetterGroup[] {
	const groups: LetterGroup[] = []
	for (const song of items) {
		const letter = firstLetter(song.main.title)
		const last = groups[groups.length - 1]
		if (last && last.letter === letter) last.items.push(song)
		else groups.push({ letter, items: [song] })
	}
	return groups
}
