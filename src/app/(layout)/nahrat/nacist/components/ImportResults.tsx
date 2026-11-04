'use client'

import { MOBILE_NAV_BREAKPOINT } from '@/common/components/MobileAppTabBar/nav.constants'
import { Box, Button, Typography } from '@/common/ui'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { StoredImportResult } from '../tech/importStorage'
import { defaultSongIndex } from '../tech/sheetPreview'
import ImportedSongCard from './ImportedSongCard'
import ImportedSongList from './ImportedSongList'

type ImportResultsProps = {
	result: StoredImportResult
	/** Continue with this song — into the editor. */
	onContinue: (index: number) => void
	onReset: () => void
}

/**
 * The found songs; the user picks one and continues with it.
 *
 * One song is shown straight away. Several are a list to choose from with
 * the chosen one's preview: beside the list on a desktop (master–detail),
 * under it on a phone. The first song not saved yet starts chosen.
 */
export default function ImportResults(props: ImportResultsProps) {
	const t = useTranslations('upload.import.result')
	const { songs, saved } = props.result
	const count = songs.length
	const [selected, setSelected] = useState(() => defaultSongIndex(count, saved))
	const previewRef = useRef<HTMLDivElement>(null)

	const select = (index: number) => {
		setSelected(index)
		// on a phone the preview is under the list: bring its top into view
		requestAnimationFrame(() =>
			previewRef.current?.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth',
			}),
		)
	}

	const preview = (
		<Box ref={previewRef} sx={{ minWidth: 0 }}>
			<ImportedSongCard
				key={selected}
				song={songs[selected]}
				saved={saved[selected]}
				onContinue={() => props.onContinue(selected)}
			/>
		</Box>
	)

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

			{count > 1 ? (
				<Box
					sx={(theme) => ({
						display: 'flex',
						flexDirection: 'column',
						gap: 2,
						[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
							display: 'grid',
							gridTemplateColumns: 'minmax(240px, 2fr) minmax(0, 3fr)',
							alignItems: 'start',
						},
					})}
				>
					<ImportedSongList
						songs={songs}
						saved={saved}
						selected={selected}
						onSelect={select}
					/>
					{preview}
				</Box>
			) : (
				preview
			)}

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
