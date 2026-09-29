'use client'
import { Box, IconButton } from '@/common/ui'
import { Typography } from '@/common/ui/Typography'
import { AddRounded, RemoveRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

/**
 * The widest note this can print, so the pill can hold room for it — see the
 * label's comment.
 */
const WIDEST_NOTE = 'H#'

type TransposePillProps = {
	/** The song's current key, or null when it has none to show. */
	keyNote: string | null
	onTranspose: (semitones: number) => void
	/** Greyed and unpressable — e.g. with the chords hidden, where a
	 * transposition would change nothing on screen. */
	disabled?: boolean
}

/**
 * `−  Tónina C  +` — how a song is transposed on a phone, wherever a phone lets
 * you: the song page's floating dock and the playlist's detail view.
 */
export default function TransposePill(props: TransposePillProps) {
	const t = useTranslations('songPage.transpose')

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 0.25,
				bgcolor: 'grey.100',
				borderRadius: 5,
				paddingX: 0.5,
				height: 42,
			}}
		>
			<IconButton
				tooltip={t('decrease')}
				onClick={() => props.onTranspose(-1)}
				disabled={props.disabled}
			>
				<RemoveRounded />
			</IconButton>
			{/* The label is what used to make the pill breathe: an accidental is nine
			    pixels of type, so the pill — and every control it pushes along the
			    dock — shifted a little each time you transposed, under the thumb
			    doing the transposing. The cell keeps the width of the widest label
			    this language can print and the real one is centred in it, so nothing
			    moves. A width in pixels would not do: the word is `Tónina` here,
			    `Tonacja` and `Key` in the other two catalogs. */}
			<Box
				sx={{
					display: 'grid',
					justifyItems: 'center',
					alignItems: 'center',
					minWidth: 54,
				}}
			>
				<Typography
					strong
					noWrap
					sx={{ gridArea: '1 / 1', visibility: 'hidden' }}
				>
					{t('keyWithNote', { note: WIDEST_NOTE })}
				</Typography>
				<Typography
					strong
					noWrap
					color={props.disabled ? 'grey.400' : undefined}
					sx={{ gridArea: '1 / 1' }}
				>
					{props.keyNote ? t('keyWithNote', { note: props.keyNote }) : t('title')}
				</Typography>
			</Box>
			<IconButton
				tooltip={t('increase')}
				onClick={() => props.onTranspose(1)}
				disabled={props.disabled}
			>
				<AddRounded />
			</IconButton>
		</Box>
	)
}
