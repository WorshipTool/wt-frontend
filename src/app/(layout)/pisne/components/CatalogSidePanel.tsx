'use client'

import {
	SearchFilters,
	SongSort,
	hasAnyFilter,
} from '@/app/(layout)/pisne/catalog.types'
import { Box, Checkbox, Typography } from '@/common/ui'
import { FormControlLabel, Radio, RadioGroup } from '@/common/ui/mui'
import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'

/**
 * Height of a column's heading row, so both columns start on the same line.
 *
 * Tall enough for the search field, because the list's own heading line is
 * where the field rests — the panel's line is empty next to it and still has
 * to be the same line.
 */
const HEADING_HEIGHT = 52

/**
 * The line a column opens with — the small caps label, and whatever belongs on
 * the right of it (a count, the search field, a Clear button).
 *
 * Both columns of the catalog use it, which is the point: the panel used to
 * start straight into its controls and so sat visibly higher than the list
 * beside it.
 */
export function ColumnHeading({
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

type Props = {
	/** Searching shows filters; browsing shows the order to read the songbook in. */
	searching: boolean
	sort: SongSort
	onSortChange: (sort: SongSort) => void
	filters: SearchFilters
	onFiltersChange: (filters: SearchFilters) => void
	/** "Mine" and "favourites" are only a thing once there is a user. */
	loggedIn: boolean
}

/**
 * The catalog's side panel: the order while browsing, the narrowing while
 * searching — never both, because they answer different questions. Browsing the
 * whole songbook is about where you are in it; searching is about which of the
 * matches you want.
 */
export default function CatalogSidePanel({
	searching,
	sort,
	onSortChange,
	filters,
	onFiltersChange,
	loggedIn,
}: Props) {
	const t = useTranslations('songsList')

	if (!searching)
		return (
			<Box
				sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}
			>
				<ColumnHeading label={t('sort')} />
				<RadioGroup
					value={sort}
					onChange={(_, value) => onSortChange(value as SongSort)}
					sx={{ gap: 0.5 }}
				>
					<FormControlLabel
						value="abc"
						control={<Radio size="small" />}
						label={t('sortAlphabetical')}
						slotProps={{ typography: { fontSize: '0.875rem' } }}
					/>
					<FormControlLabel
						value="newest"
						control={<Radio size="small" />}
						label={t('sortNewest')}
						slotProps={{ typography: { fontSize: '0.875rem' } }}
					/>
				</RadioGroup>
			</Box>
		)

	const set = (key: keyof SearchFilters) => (checked: boolean) =>
		onFiltersChange({ ...filters, [key]: checked })

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}>
			<ColumnHeading label={t('filters')}>
				{hasAnyFilter(filters) && (
					<Box
						component="button"
						type="button"
						onClick={() => onFiltersChange({ mine: false, favourite: false, chords: false })}
						sx={{
							border: 0,
							background: 'transparent',
							padding: 0,
							cursor: 'pointer',
							font: 'inherit',
							fontSize: '0.75rem',
							color: 'primary.main',
						}}
					>
						{t('clearFilters')}
					</Box>
				)}
			</ColumnHeading>

			<Box
				sx={{
					bgcolor: 'background.paper',
					border: '1px solid',
					borderColor: 'grey.200',
					borderRadius: 3,
					paddingX: 2,
					paddingY: 1,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{loggedIn && (
					<Checkbox
						label={t('filterMine')}
						checked={filters.mine}
						onChange={(_, checked) => set('mine')(checked)}
					/>
				)}
				{loggedIn && (
					<Checkbox
						label={t('filterFavourite')}
						checked={filters.favourite}
						onChange={(_, checked) => set('favourite')(checked)}
					/>
				)}
				<Checkbox
					label={t('filterChords')}
					checked={filters.chords}
					onChange={(_, checked) => set('chords')(checked)}
				/>
			</Box>
		</Box>
	)
}
