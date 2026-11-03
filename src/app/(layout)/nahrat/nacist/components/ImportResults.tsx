'use client'

import { Box, Button, Typography } from '@/common/ui'
import { useTranslations } from 'next-intl'
import { StoredImportResult } from '../tech/importStorage'
import ImportedSongCard from './ImportedSongCard'

type ImportResultsProps = {
	result: StoredImportResult
	onCopy: (index: number) => void
	onEdit: (index: number) => void
	onReset: () => void
}

/** "Našli jsme N písní" and one card per song. */
export default function ImportResults(props: ImportResultsProps) {
	const t = useTranslations('upload.import.result')
	const count = props.result.songs.length

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box sx={{ minWidth: 0 }}>
				<Typography variant="h5" strong={600}>
					{t('found', { count })}
				</Typography>
				<Typography small color="grey.600" noWrap>
					{t('foundFrom', { count, source: props.result.source.label })}
				</Typography>
			</Box>

			{props.result.songs.map((song, index) => (
				<ImportedSongCard
					key={`${song.source.index}-${index}`}
					song={song}
					saved={props.result.saved[index]}
					onCopy={() => props.onCopy(index)}
					onEdit={() => props.onEdit(index)}
				/>
			))}

			<Button
				variant="text"
				onClick={props.onReset}
				disableUppercase
				sx={{ alignSelf: 'center' }}
			>
				{t('loadAnother')}
			</Button>
		</Box>
	)
}
