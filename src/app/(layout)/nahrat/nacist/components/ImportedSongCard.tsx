'use client'

import { GeneralParserSong } from '@/api/general-parser/generalParser'
import SheetDisplay from '@/common/components/SheetDisplay/SheetDisplay'
import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { Box, Typography } from '@/common/ui'
import { CustomChip } from '@/common/ui/CustomChip/CustomChip'
import { WarningAmberRounded } from '@mui/icons-material'
import { Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

/** Below this the song gets a "check it" chip. The number itself is never shown. */
export const NEEDS_CHECK_BELOW = 0.7

type ImportedSongCardProps = {
	song: GeneralParserSong
}

/**
 * The chosen song's preview: its title and the whole sheet, rendered the way
 * the song page renders it (chords above the words), always in full. It has no buttons — the one way on, "Pokračovat s touto písní", sits
 * outside it (see ImportResults) and always means the song shown here. The
 * raw sheet text is never offered: the editor is where it gets touched.
 */
export default function ImportedSongCard(props: ImportedSongCardProps) {
	const t = useTranslations('upload.import.result')
	const sheet = useMemo(
		() => new Sheet(props.song.sheetData),
		[props.song.sheetData],
	)
	const needsCheck = props.song.confidence < NEEDS_CHECK_BELOW

	return (
		<Box sx={SURFACE_CARD_SX}>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: 1,
					paddingX: 2,
					paddingTop: 2,
					paddingBottom: 1,
				}}
			>
				<Typography variant="h6" strong={600} sx={{ flex: 1, minWidth: 0 }}>
					{props.song.title || t('untitled')}
				</Typography>
				{needsCheck && (
					<CustomChip
						color="warning.dark"
						icon={<WarningAmberRounded />}
						label={t('needsCheck')}
					/>
				)}
			</Box>

			{needsCheck && (
				<Typography
					small
					color="grey.700"
					sx={{ paddingX: 2, paddingBottom: 1 }}
				>
					{t('needsCheckHint')}
				</Typography>
			)}

			<Box sx={{ paddingX: 2, paddingBottom: 2 }}>
				<SheetDisplay sheet={sheet} hideChords={false} variant="default" />
			</Box>
		</Box>
	)
}
