import { BasicVariantPack } from '@/api/dtos'
import { SearchSongDto } from '@/api/dtos/song/song.search.dto'

/**
 * One line of a result list: a song on its own, or a song with its translations
 * gathered behind it.
 *
 * A search result already arrives grouped — every `found` in it is the same song
 * in a different translation — and this is the one rule that decides what that
 * grouping looks like, so a desktop card and a phone row can never disagree
 * about which songs belong together.
 */
export type SongResultEntry =
	| { kind: 'single'; pack: BasicVariantPack }
	| { kind: 'group'; packs: BasicVariantPack[]; original?: BasicVariantPack }

/**
 * @param grouped what the `group_translations` flag says. Off, every translation
 * stands on its own line, which is how the app behaved before grouping existed.
 */
export function groupSearchResults(
	results: SearchSongDto[],
	grouped: boolean
): SongResultEntry[] {
	return results.flatMap((result): SongResultEntry[] => {
		if (!grouped) return result.found.map((pack) => ({ kind: 'single', pack }))

		// Only what everyone can see is gathered. Your own unpublished copy of a
		// song is yours, and burying it inside a group of translations is how you
		// lose it — so it keeps a line of its own, above the group.
		const shared = result.found.filter((pack) => pack.public)
		const own = result.found.filter((pack) => !pack.public)

		return [
			...own.map((pack): SongResultEntry => ({ kind: 'single', pack })),
			...(shared.length > 0
				? [
						{
							kind: 'group',
							packs: shared,
							original: result.original,
						} as SongResultEntry,
					]
				: []),
		]
	})
}
