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
 * grouped rows the phone shows, read down one column and up the next — a row
 * across the whole block would be a title and a line of lyrics in a field of
 * nothing.
 *
 * Grouped under initials while it is alphabetical. Ordered by date it is not,
 * so the letters would be meaningless then and the rows come as one run.
 */
export default function SongsBrowseDesktop({
	items,
	columns: COLUMNS = 3,
	grouped = true,
}: {
	items: GetListSongData[]
	/** How many columns the page is read in — the width's call, so the caller's,
	 * and it has to agree with the page size or the columns come out ragged. */
	columns?: number
	grouped?: boolean
}) {
	// the page's songs cut into equal runs, each read top to bottom — a column
	// per run, its own letter headings inside it. Cutting by letter instead
	// would leave a page whose songs nearly all start with one letter as a full
	// column beside an empty one.
	const columns = useMemo(() => {
		if (!grouped) return []
		const perColumn = Math.ceil(items.length / COLUMNS)
		if (perColumn === 0) return []
		const runs: GetListSongData[][] = []
		for (let i = 0; i < items.length; i += perColumn)
			runs.push(items.slice(i, i + perColumn))
		// a letter split across the cut opens again at the top of the next column
		return runs.map((run) => groupByFirstLetter(run))
	}, [items, grouped])

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
		<Box sx={{ width: '100%', minWidth: 0, display: 'flex', gap: 3 }}>
			{columns.map((groups, columnIndex) => (
				<Box
					key={columnIndex}
					sx={{
						flex: 1,
						minWidth: 0,
						display: 'flex',
						flexDirection: 'column',
						gap: 2.5,
					}}
				>
					{groups.map((group, index) => (
						// a letter can open twice in one column (see groupByFirstLetter)
						<Box key={`${group.letter}-${index}`}>
							<LetterHeader letter={group.letter} />
							<SongGroup
								songs={group.items.map((s) =>
									mapBasicVariantPackApiToDto(s.main)
								)}
								previewLines={PREVIEW_LINES}
								withIcon={false}
							/>
						</Box>
					))}
				</Box>
			))}
		</Box>
	)
}
