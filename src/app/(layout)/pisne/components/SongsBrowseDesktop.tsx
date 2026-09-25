'use client'

import { mapBasicVariantPackApiToDto } from '@/api/dtos/song/song.map'
import { GetListSongData } from '@/api/generated'
import { groupByFirstLetter } from '@/app/(layout)/pisne/letterGroups'
import { Box, Typography } from '@/common/ui'
import { SongGroup } from '@/common/ui/GroupList'
import { useMemo } from 'react'

/** Lyric preview lines on a browse row — one, since a page holds many. */
const PREVIEW_LINES = 1

/**
 * A section's initial, with a rule running off it so the rows under it read as
 * one section rather than as a list that happens to have a letter above it.
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
 * The catalog's browse body on a desktop: the songbook in order, in the same
 * grouped rows the phone shows — one column, wide enough to read a title and
 * the line under it without either being cut.
 *
 * Grouped under initials while it is alphabetical. Ordered by date it is not,
 * so the letters would be meaningless then and the rows come as one run.
 */
export default function SongsBrowseDesktop({
	items,
	grouped = true,
}: {
	items: GetListSongData[]
	grouped?: boolean
}) {
	const groups = useMemo(
		() => (grouped ? groupByFirstLetter(items) : []),
		[items, grouped]
	)

	if (!grouped)
		return (
			<Box sx={{ width: '100%', minWidth: 0 }}>
				<SongGroup
					songs={items.map((s) => mapBasicVariantPackApiToDto(s.main))}
					previewLines={PREVIEW_LINES}
					withIcon={false}
				/>
			</Box>
		)

	return (
		<Box
			sx={{
				width: '100%',
				minWidth: 0,
				display: 'flex',
				flexDirection: 'column',
				gap: 2.5,
			}}
		>
			{groups.map((group, index) => (
				// a letter can open twice on one page (see groupByFirstLetter)
				<Box key={`${group.letter}-${index}`}>
					<LetterHeader letter={group.letter} />
					<SongGroup
						songs={group.items.map((s) => mapBasicVariantPackApiToDto(s.main))}
						previewLines={PREVIEW_LINES}
						withIcon={false}
					/>
				</Box>
			))}
		</Box>
	)
}
