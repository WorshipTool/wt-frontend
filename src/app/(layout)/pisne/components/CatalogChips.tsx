'use client'

import { SearchFilters, SongSort } from '@/app/(layout)/pisne/catalog.types'
import { Box, Typography } from '@/common/ui'
import { CloseRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

type ChipProps = {
	label: string
	active: boolean
	onClick: () => void
	/** An active filter can be taken off again, so it carries its own cross. */
	removable?: boolean
}

function Chip({ label, active, onClick, removable }: ChipProps) {
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
			sx={{
				flexShrink: 0,
				display: 'flex',
				alignItems: 'center',
				gap: 0.5,
				height: 34,
				paddingLeft: 1.75,
				paddingRight: active && removable ? 1.25 : 1.75,
				borderRadius: 17,
				border: '1px solid',
				borderColor: active ? 'primary.main' : 'grey.300',
				bgcolor: active ? 'primary.main' : 'background.paper',
				color: active ? 'primary.contrastText' : 'grey.700',
				font: 'inherit',
				fontSize: '0.8125rem',
				fontWeight: active ? 700 : 400,
				cursor: 'pointer',
			}}
		>
			{label}
			{active && removable && <CloseRounded sx={{ fontSize: 15 }} />}
		</Box>
	)
}

type Props = {
	/** Searching shows filters; browsing shows the order. */
	searching: boolean
	sort: SongSort
	onSortChange: (sort: SongSort) => void
	filters: SearchFilters
	onFiltersChange: (filters: SearchFilters) => void
	loggedIn: boolean
}

/**
 * The phone's version of the desktop side panel: one scrollable row of pills
 * under the search field. A panel has nowhere to go on a 390px screen, and a
 * sheet behind a button would hide the one thing these controls are for —
 * seeing what the list is currently doing.
 */
export default function CatalogChips({
	searching,
	sort,
	onSortChange,
	filters,
	onFiltersChange,
	loggedIn,
}: Props) {
	const t = useTranslations('songsList')

	const row = {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		// the pills run off the edge rather than wrapping: one line, swipeable
		overflowX: 'auto',
		paddingBottom: 0.25,
		'&::-webkit-scrollbar': { display: 'none' },
		scrollbarWidth: 'none',
	} as const

	if (!searching)
		return (
			<Box sx={row}>
				<Typography small color="grey.600" sx={{ flexShrink: 0 }}>
					{t('sort')}
				</Typography>
				<Chip
					label={t('sortAlphabetical')}
					active={sort === 'abc'}
					onClick={() => onSortChange('abc')}
				/>
				<Chip
					label={t('sortNewest')}
					active={sort === 'newest'}
					onClick={() => onSortChange('newest')}
				/>
			</Box>
		)

	const toggle = (key: keyof SearchFilters) => () =>
		onFiltersChange({ ...filters, [key]: !filters[key] })

	return (
		<Box sx={row}>
			<Chip
				label={t('filterChords')}
				active={filters.chords}
				onClick={toggle('chords')}
				removable
			/>
			{loggedIn && (
				<Chip
					label={t('filterMine')}
					active={filters.mine}
					onClick={toggle('mine')}
					removable
				/>
			)}
			{loggedIn && (
				<Chip
					label={t('filterFavourite')}
					active={filters.favourite}
					onClick={toggle('favourite')}
					removable
				/>
			)}
		</Box>
	)
}
