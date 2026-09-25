'use client'

import { mapBasicVariantPackApiToDto } from '@/api/dtos/song/song.map'
import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import { GetListSongData } from '@/api/generated'
import { groupByFirstLetter } from '@/app/(layout)/pisne/letterGroups'
import SmartSongListCards from '@/common/components/songLists/SongListCards/SmartSongListCards'
import { Box, Typography } from '@/common/ui'
import { useMemo } from 'react'

/**
 * How many song cards stand side by side. Three, where search results take
 * four or five: browsing is reading, so a card is wide enough for its lyric
 * preview to be worth the space it takes.
 */
const CARD_COLUMNS = { xs: 1, sm: 2, lg: 3 }

/** A list entry in the shape the app's song cards read. */
const toCard = (s: GetListSongData): SearchSongDto => ({
	original: s.original ? mapBasicVariantPackApiToDto(s.original) : undefined,
	found: [mapBasicVariantPackApiToDto(s.main)],
})

/**
 * A section's initial. Big enough to be the thing you scan for, with a rule
 * running off it so the cards under it read as one section rather than as a
 * grid that happens to have a letter above it.
 */
function LetterHeader({ letter }: { letter: string }) {
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 1.5,
				paddingLeft: 0.5,
				paddingBottom: 1,
			}}
		>
			<Typography variant="h6" strong={800} color="grey.700">
				{letter}
			</Typography>
			<Box sx={{ flex: 1, height: '1px', bgcolor: 'grey.300' }} />
		</Box>
	)
}

/**
 * The catalog's browse body on a desktop: the songbook in order, under its
 * initials.
 *
 * The cards are the ones search results use, so the screen keeps one way of
 * showing a song whichever half of the catalog you are in — only wider, and
 * gathered under the letter they start with. It used to be a three-column grid
 * of numbered grey strips, which read as a table of contents rather than as
 * songs.
 */
export default function SongsBrowseDesktop({
	items,
}: {
	items: GetListSongData[]
}) {
	const groups = useMemo(() => groupByFirstLetter(items), [items])

	return (
		<Box
			sx={{
				width: '100%',
				minWidth: 0,
				display: 'flex',
				flexDirection: 'column',
				gap: 3,
			}}
		>
			{groups.map((group, index) => (
				// a letter can open twice on one page (see groupByFirstLetter)
				<Box key={`${group.letter}-${index}`}>
					<LetterHeader letter={group.letter} />
					<SmartSongListCards
						data={group.items.map(toCard)}
						columns={CARD_COLUMNS}
					/>
				</Box>
			))}
		</Box>
	)
}
