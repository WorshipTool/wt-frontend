'use client'

import { GeneralParserSong } from '@/api/general-parser/generalParser'
import SheetDisplay from '@/common/components/SheetDisplay/SheetDisplay'
import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { Box, Button, Typography } from '@/common/ui'
import { CustomChip } from '@/common/ui/CustomChip/CustomChip'
import {
	CheckRounded,
	ContentCopyRounded,
	WarningAmberRounded,
} from '@mui/icons-material'
import { Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SavedSong } from '../tech/importStorage'

/** Below this the song gets a "check it" chip. The number itself is never shown. */
export const NEEDS_CHECK_BELOW = 0.7

/** How much of the sheet the collapsed preview shows — a verse or so. */
const PREVIEW_HEIGHT = 220

type ImportedSongCardProps = {
	song: GeneralParserSong
	saved?: SavedSong
	onCopy: () => void
	onEdit: () => void
}

/**
 * One found song: its title, the first lines rendered the way the song page
 * renders a sheet (chords above the words), "rozbalit" for the rest, and the
 * two things to do with it. Saved songs trade "Upravit a uložit" for a link
 * to the saved song.
 */
export default function ImportedSongCard(props: ImportedSongCardProps) {
	const t = useTranslations('upload.import.result')
	const sheet = useMemo(() => new Sheet(props.song.sheetData), [props.song.sheetData])
	const needsCheck = props.song.confidence < NEEDS_CHECK_BELOW

	const [expanded, setExpanded] = useState(false)
	const [overflows, setOverflows] = useState(false)
	const previewRef = useRef<HTMLDivElement>(null)

	useLayoutEffect(() => {
		const el = previewRef.current
		if (el) setOverflows(el.scrollHeight > PREVIEW_HEIGHT + 1)
	}, [sheet])

	const collapsed = overflows && !expanded

	return (
		<Box sx={{ ...SURFACE_CARD_SX, overflow: 'hidden' }}>
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
				{props.saved ? (
					<CustomChip
						color="success.dark"
						icon={<CheckRounded />}
						label={t('saved')}
					/>
				) : (
					needsCheck && (
						<CustomChip
							color="warning.dark"
							icon={<WarningAmberRounded />}
							label={t('needsCheck')}
						/>
					)
				)}
			</Box>

			{needsCheck && !props.saved && (
				<Typography small color="grey.700" sx={{ paddingX: 2, paddingBottom: 1 }}>
					{t('needsCheckHint')}
				</Typography>
			)}

			<Box
				ref={previewRef}
				sx={(theme) => ({
					position: 'relative',
					paddingX: 2,
					maxHeight: collapsed ? PREVIEW_HEIGHT : 'none',
					overflow: 'hidden',
					'&::after': collapsed
						? {
								content: '""',
								position: 'absolute',
								left: 0,
								right: 0,
								bottom: 0,
								height: theme.spacing(6),
								background: `linear-gradient(transparent, ${theme.palette.surface.card})`,
						  }
						: undefined,
				})}
			>
				<SheetDisplay sheet={sheet} hideChords={false} variant="default" />
			</Box>

			{overflows && (
				<Box sx={{ paddingX: 1, display: 'flex' }}>
					<Button
						variant="text"
						size="small"
						onClick={() => setExpanded((e) => !e)}
						disableUppercase
					>
						{expanded ? t('collapse') : t('expand')}
					</Button>
				</Box>
			)}

			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 1,
					padding: 2,
					paddingTop: 1,
					'& > *': { flex: 1 },
				}}
			>
				<Button
					variant="outlined"
					startIcon={<ContentCopyRounded />}
					onClick={props.onCopy}
				>
					{t('copy')}
				</Button>
				{props.saved ? (
					<Button
						variant="outlined"
						to="variant"
						toParams={{ hex: props.saved.hex, alias: props.saved.alias }}
					>
						{t('open')}
					</Button>
				) : (
					<Button onClick={props.onEdit}>{t('editAndSave')}</Button>
				)}
			</Box>
		</Box>
	)
}
