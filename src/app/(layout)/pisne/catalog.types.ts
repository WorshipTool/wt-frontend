/** How the songbook is ordered while browsing it. */
export type SongSort = 'abc' | 'newest'

/**
 * What a search is narrowed to. All three are off by default: a search asks
 * the whole songbook unless you say otherwise.
 */
export type SearchFilters = {
	/** Songs this user added. */
	mine: boolean
	/** Songs this user marked as a favourite. */
	favourite: boolean
	/** Songs that carry chords — the backend's own search parameter. */
	chords: boolean
}

export const NO_FILTERS: SearchFilters = {
	mine: false,
	favourite: false,
	chords: false,
}

export function hasAnyFilter(filters: SearchFilters): boolean {
	return filters.mine || filters.favourite || filters.chords
}
