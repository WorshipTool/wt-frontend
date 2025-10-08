import { VariantPackAlias } from '@/api/dtos'
import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { IconButton } from '@/common/ui/IconButton'
import { PlaylistItemGuid } from '@/interfaces/playlist/playlist.types'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { Add, Edit, Remove } from '@mui/icons-material'
import { Chord, Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

type TopPlaylistItemPanelProps = {
	itemGuid: PlaylistItemGuid
	packAlias: VariantPackAlias
	sheet: Sheet
	inEditMode: boolean
	setInEditMode: (value: boolean) => void
	onSave: () => void
	onCancel: () => void
	// rerender: () => void
	openButton?: React.ReactNode
}

export const TopPlaylistItemPanel = memo(function TopPlaylistItemPanel({
	...props
}: TopPlaylistItemPanelProps) {
	const { setItemKeyChord, removeItem, canUserEdit } = useInnerPlaylist()
	const tPlaylist = useTranslations('playlist')
	const tCommon = useTranslations('common')

	const transpose = async (value: number) => {
		const c = props.sheet.getKeyChord()

		const copyChord = c ? new Chord(c.toString()) : null
		copyChord?.transpose(value)

		if (copyChord) setItemKeyChord(props.itemGuid, copyChord)
	}

	const onRemove = async () => {
		removeItem(props.itemGuid)
	}

	return (
		<Box
			display={'flex'}
			flexDirection={'row'}
			justifyContent={'space-between'}
			sx={{
				zIndex: 1,
			}}
		>
			{canUserEdit ? (
				<Box
					display={{
						xs: 'none',
						sm: 'flex',
					}}
				>
					<IconButton
						onClick={() => {
							transpose(1)
						}}
						color="inherit"
						alt={tPlaylist('transpose.up')}
					>
						<Add />
					</IconButton>
					<IconButton
						onClick={() => {
							transpose(-1)
						}}
						color="inherit"
						alt={tPlaylist('transpose.down')}
					>
						<Remove />
					</IconButton>
				</Box>
			) : (
				<Box />
			)}
			<Box />

			<Box display={'flex'} flexDirection={'row'} gap={1} sx={{}}>
				{!props.inEditMode ? (
					!canUserEdit ? null : (
						<Button
							tooltip={tPlaylist('createEditForPlaylist')}
							variant="outlined"
							size="small"
							startIcon={<Edit />}
							onClick={() => {
								props.setInEditMode(true)
							}}
						>
							{tCommon('edit')}
						</Button>
					)
				) : (
					<>
						<Button
							size="small"
							variant="text"
							color="grey.800"
							onClick={props.onCancel}
							tooltip={tCommon('cancelCurrentEdits')}
						>
							{tCommon('cancel')}
						</Button>
						<Button
							size="small"
							onClick={props.onSave}
							tooltip={tCommon('saveCurrentState')}
						>
							{tCommon('save')}
						</Button>
					</>
				)}
				{canUserEdit && !props.inEditMode && (
					<Box
						display={{
							xs: 'none',
							sm: 'block',
						}}
					>
						<Button
							variant="text"
							color="error"
							onClick={onRemove}
							size="small"
						>
							{tPlaylist('removeFromPlaylist')}
						</Button>
					</Box>
				)}
				{!props.inEditMode &&
					(props.openButton || (
						<Button
							variant="text"
							to="variant"
							toParams={{
								...parseVariantAlias(props.packAlias),
							}}
							size="small"
						>
							{tCommon('open')}
						</Button>
					))}
			</Box>
		</Box>
	)
})

export default TopPlaylistItemPanel
