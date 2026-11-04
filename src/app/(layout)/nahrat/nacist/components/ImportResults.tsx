'use client'

import { MOBILE_NAV_BREAKPOINT } from '@/common/components/MobileAppTabBar/nav.constants'
import { Box, Button, Typography } from '@/common/ui'
import { RestartAltRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { StoredImportResult } from '../tech/importStorage'
import ImportedSongCard from './ImportedSongCard'

type ImportResultsProps = {
	result: StoredImportResult
	onCopy: (index: number) => void
	onEdit: (index: number) => void
	onReset: () => void
}

/**
 * "Našli jsme N písní" and one card per song.
 *
 * Phone: one column, "Načíst něco jiného" under the cards. Desktop: the
 * summary and that action share a header row, and the cards sit two to a row
 * so a song's preview reads at the width of a sheet, not of the page.
 */
export default function ImportResults(props: ImportResultsProps) {
	const t = useTranslations('upload.import.result')
	const count = props.result.songs.length

	const loadAnother = (
		<Button
			variant="outlined"
			onClick={props.onReset}
			startIcon={<RestartAltRounded />}
		>
			{t('loadAnother')}
		</Button>
	)

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
				<Box sx={{ minWidth: 0, flex: 1 }}>
					<Typography variant="h5" strong={600}>
						{t('found', { count })}
					</Typography>
					<Typography small color="grey.600" noWrap>
						{t('foundFrom', { count, source: props.result.source.label })}
					</Typography>
				</Box>
				<Box
					sx={(theme) => ({
						display: 'none',
						flexShrink: 0,
						[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { display: 'block' },
					})}
				>
					{loadAnother}
				</Box>
			</Box>

			<Box
				sx={(theme) => ({
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
						display: 'grid',
						gridTemplateColumns:
							count > 1 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
						alignItems: 'start',
					},
				})}
			>
				{props.result.songs.map((song, index) => (
					<ImportedSongCard
						key={`${song.source.index}-${index}`}
						song={song}
						saved={props.result.saved[index]}
						onCopy={() => props.onCopy(index)}
						onEdit={() => props.onEdit(index)}
					/>
				))}
			</Box>

			<Box
				sx={(theme) => ({
					alignSelf: 'center',
					[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { display: 'none' },
				})}
			>
				<Button variant="text" onClick={props.onReset} disableUppercase>
					{t('loadAnother')}
				</Button>
			</Box>
		</Box>
	)
}
