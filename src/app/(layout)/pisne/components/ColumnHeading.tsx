'use client'

import { Box, Typography } from '@/common/ui'
import { ReactNode } from 'react'

/**
 * Height of a column's heading row, so both columns start on the same line.
 *
 * Tall enough for the search field, because the list's own heading line is
 * where the field rests — the column beside it is empty next to it and still
 * has to be the same line.
 */
const HEADING_HEIGHT = 52

/**
 * The line a column of the catalog opens with — the small caps label, whatever
 * belongs to it (a count), and whatever sits at the end of the line (the search
 * field, a page).
 */
export default function ColumnHeading({
	label,
	meta,
	children,
}: {
	label: string
	/** Belongs to the label and stays beside it — a count, a note. */
	meta?: ReactNode
	children?: ReactNode
}) {
	return (
		<Box
			sx={{
				height: HEADING_HEIGHT,
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				flexShrink: 0,
			}}
		>
			<Typography small strong={800} uppercase color="grey.700">
				{label}
			</Typography>
			{meta}
			<Box sx={{ flexGrow: 1 }} />
			{children}
		</Box>
	)
}
