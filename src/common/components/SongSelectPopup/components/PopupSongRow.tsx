import { BasicVariantPack } from '@/api/dtos'
import { theme } from '@/common/constants/theme'
import { Box } from '@/common/ui'
import { FLAT_ROW_SX, SongLeadingIcon } from '@/common/ui/GroupList'
import { IconButton } from '@/common/ui/IconButton'
import { alpha } from '@/common/ui/mui'
import { SongVariantCard } from '@/common/ui/SongCard'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { CheckRounded, OpenInNewRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { memo, useCallback } from 'react'

/**
 * What one row occupies: the leading tile (40px) with the dense row's padding,
 * plus the hairline under it. The sheet caps its list by this, so the two have
 * to agree — measured on a phone, not guessed.
 */
export const POPUP_ROW_HEIGHT = 63

type PopupSongRowProps = {
	selected?: boolean
	song: BasicVariantPack
	onSelect: () => void
	onDeselect: () => void
}

/**
 * One song in the picker, as a row of the app's grouped list.
 *
 * The card this replaces on narrow screens is 150–180px wide, so a phone showed
 * two and a half of them and the rest had to be scrolled sideways past the edge
 * of the sheet — songs nobody knew were there. Stacked rows put the whole
 * offering under each other, where a list is read, and it is the catalogue's own
 * row so the picker reads as part of the app rather than as a panel borrowed
 * from a desktop.
 *
 * Chosen is the desktop card's colour — the brand blue at a tenth — plus a
 * tick, and no border: rows are joined into one block by their dividers, and a
 * border around one of them breaks the block apart. The tick carries the choice
 * where the tint is too faint to (in sunlight, in a dark theme, at an angle).
 *
 * The card's own `selectable` is not used: it tints only the text column, which
 * inside a row leaves the note tile and the icons outside the fill. Disabling
 * the link through `toLinkProps` stops the row navigating just as well, and the
 * fill is then the whole row's to give.
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

	const tint = alpha(theme.palette.primary.main, 0.1)

	return (
		<SongVariantCard
			data={props.song}
			dense
			previewLines={1}
			toLinkProps={() => null}
			onClick={onRowClick}
			leadingIcon={<SongLeadingIcon />}
			trailingIcon={
				<Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={1}>
					{props.selected && (
						<CheckRounded fontSize="small" sx={{ color: 'primary.main' }} />
					)}
					{/* Its own button, not part of the row: the row picks the song, this
					    opens it, and a phone has no hover to tell the two apart. */}
					<IconButton
						size="small"
						to="variant"
						tooltip={t('openInNewWindow')}
						toParams={parseVariantAlias(props.song.packAlias)}
						target="_blank"
						onClick={(e) => e.stopPropagation()}
					>
						<OpenInNewRounded sx={{ fontSize: '1.1rem' }} />
					</IconButton>
				</Box>
			}
			sx={{
				...FLAT_ROW_SX,
				...(props.selected && {
					bgcolor: tint,
					'&:hover': { bgcolor: tint },
					'&:active': { bgcolor: tint },
				}),
			}}
		/>
	)
})

export default PopupSongRow
