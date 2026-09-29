import { BasicVariantPack } from '@/api/dtos'
import { theme } from '@/common/constants/theme'
import { Box } from '@/common/ui'
import { IconButton } from '@/common/ui/IconButton'
import { alpha } from '@/common/ui/mui'
import { Typography } from '@/common/ui/Typography'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { Check, OpenInNew } from '@mui/icons-material'
import { Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import { memo, useCallback } from 'react'

type PopupSongRowProps = {
	selected?: boolean
	song: BasicVariantPack
	onSelect: () => void
	onDeselect: () => void
}

/** Enough for a finger, with two lines of text in it. */
const ROW_MIN_HEIGHT = 52

/**
 * One song in the picker, as a row.
 *
 * The card this replaces on narrow screens is 150–180px wide, so a phone showed
 * two and a half of them and the rest had to be scrolled sideways past the edge
 * of the sheet — songs nobody knew were there. Stacked rows put the whole
 * offering under each other, where a list is read.
 *
 * Chosen is the desktop card's colour — the brand blue at a tenth — plus a tick
 * and a blue title, and no border: rows are joined into one block by their
 * dividers, and a border around one of them breaks the block apart. The tick
 * carries the choice where the tint is too faint to (in sunlight, in a dark
 * theme, at an angle).
 */
const PopupSongRow = memo(function PopupSongRow(props: PopupSongRowProps) {
	const t = useTranslations('song')

	const onRowClick = useCallback(() => {
		if (props.selected) {
			props.onDeselect()
			return
		}
		props.onSelect()
	}, [props.selected, props.onSelect, props.onDeselect])

	const sheet = new Sheet(props.song.sheetData)
	const firstLine = (sheet.getSections()[0]?.text || '').split('\n')[0]

	return (
		<Box
			className="global-song-list-item"
			onClick={onRowClick}
			sx={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'stretch',
				minHeight: `${ROW_MIN_HEIGHT}px`,
				cursor: 'pointer',
				userSelect: 'none',
				bgcolor: props.selected
					? alpha(theme.palette.primary.main, 0.1)
					: 'background.paper',
				borderBottom: '1px solid',
				borderBottomColor: 'grey.200',
				'&:last-of-type': {
					borderBottom: 'none',
				},
			}}
		>
			<Box
				sx={{
					flex: 1,
					minWidth: 0,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					paddingX: 2,
					paddingY: 1,
				}}
			>
				<Typography
					strong
					noWrap
					color={props.selected ? 'primary.main' : undefined}
				>
					{props.song.title}
				</Typography>
				{firstLine && (
					<Typography size={'small'} color="grey.600" noWrap>
						{firstLine}
					</Typography>
				)}
			</Box>

			{props.selected && (
				<Box
					sx={{
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
						color: 'primary.main',
						paddingRight: 1,
					}}
				>
					<Check fontSize="small" />
				</Box>
			)}

			{/* Its own column with a line down its left: the row picks the song, this
			    opens it, and a phone has no hover to tell the two apart. */}
			<Box
				sx={{
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					paddingX: 0.5,
					borderLeft: '1px solid',
					borderLeftColor: 'grey.200',
				}}
			>
				<IconButton
					size="small"
					to="variant"
					tooltip={t('openInNewWindow')}
					toParams={parseVariantAlias(props.song.packAlias)}
					target="_blank"
					onClick={(e) => e.stopPropagation()}
				>
					<OpenInNew
						sx={{
							fontSize: '1.1rem',
						}}
					/>
				</IconButton>
			</Box>
		</Box>
	)
})

export default PopupSongRow
