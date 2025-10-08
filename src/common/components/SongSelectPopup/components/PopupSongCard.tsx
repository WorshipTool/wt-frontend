import { BasicVariantPack } from '@/api/dtos'
import { theme } from '@/common/constants/theme'
import { Box } from '@/common/ui'
import { IconButton } from '@/common/ui/IconButton'
import { alpha } from '@/common/ui/mui'
import { Typography } from '@/common/ui/Typography'
import DraggableSong from '@/hooks/dragsong/DraggableSong'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { OpenInNew } from '@mui/icons-material'
import { Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import { memo, useCallback } from 'react'

type PopupSongCardProps = {
	selected?: boolean
	song: BasicVariantPack
	onSelect: () => void
	onDeselect: () => void
}

const PopupSongCard = memo(function PopupSongCard(props: PopupSongCardProps) {
	const t = useTranslations('song')
	
	const onSongClick = useCallback(() => {
		if (props.selected) {
			props.onDeselect()
			return
		}
		props.onSelect()
	}, [props.selected, props.onSelect, props.onDeselect])

	const sheet = new Sheet(props.song.sheetData)

	return (
		<Box
			sx={{
				borderRadius: 3,
				minWidth: 150,
				maxWidth: 180,
				maxHeight: 130,
				borderStyle: 'solid',
				cursor: 'pointer',
				...(props.selected
					? {
							// Selected

							borderColor: 'primary.main',
							bgcolor: alpha(theme.palette.primary.main, 0.1),
							borderWidth: 2,
					  }
					: {
							// Not selected
							bgcolor: 'grey.100',
							borderColor: 'grey.200',
							borderWidth: 1,
					  }),
			}}
			onClick={onSongClick}
			position={'relative'}
			className="global-song-list-item"
		>
			<DraggableSong
				data={{
					packGuid: props.song.packGuid,
					alias: props.song.packAlias,
					title: props.song.title,
				}}
				style={{
					height: '100%',
					width: '100%',
				}}
			>
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						right: 0,
						borderRadius: 3,
						bgcolor: 'grey.100',
						padding: 1,
						pointerEvents: 'none',
					}}
					className="global-song-list-link-icon"
				>
					<IconButton
						size="small"
						to="variant"
						tooltip={t('openInNewWindow')}
						toParams={parseVariantAlias(props.song.packAlias)}
						target="_blank"
						sx={{
							pointerEvents: 'auto',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<OpenInNew
							sx={{
								fontSize: '1.1rem',
							}}
						/>
					</IconButton>
				</Box>
				<Box
					padding={2}
					display={'flex'}
					flexDirection={'column'}
					height={'calc(100% - 2*2*8px)'}
				>
					<Typography
						strong
						sx={{
							textOverflow: 'ellipsis',
							overflow: 'hidden',
							userSelect: 'none',
							display: '-webkit-box',
							WebkitBoxOrient: 'vertical',
							WebkitLineClamp: 2,
						}}
					>
						{props.song.title}
					</Typography>

					<Typography
						// size={'small'}
						sx={{
							textOverflow: 'ellipsis',
							overflow: 'hidden',
							userSelect: 'none',
							flex: 1,
						}}
					>
						{sheet.getSections()[0].text}
					</Typography>
				</Box>
			</DraggableSong>
		</Box>
	)
})

export default PopupSongCard
