import { FavouriteItem } from '@/app/(layout)/ucet/oblibene/page'
import Menu from '@/common/components/Menu/Menu'
import { Box, Chip, IconButton, Tooltip, Typography } from '@/common/ui'
import DraggableSong from '@/hooks/dragsong/DraggableSong'
import { useFavourites } from '@/hooks/favourites/useFavourites'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import {
	KeyboardArrowLeft,
	MoreHoriz,
	PlaylistRemove,
} from '@mui/icons-material'
import { Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

type FavouritesRowItemProps = {
	data: FavouriteItem
	index: number
}

export default function FavouritesRowItem(props: FavouritesRowItemProps) {
	const t = useTranslations('favourites')
	const variantPack = props.data.data.pack

	const hintText = useMemo(() => {
		const sheet = new Sheet(variantPack.sheetData)
		return sheet.getSections()[0].text
	}, [variantPack])

	const navigate = useSmartNavigate()
	const onOpenClick = () => {
		if (props.data.teamAlias) {
			const variantAlias = parseVariantAlias(variantPack.packAlias)
			navigate('teamSong', {
				hex: variantAlias.hex,
				'title-alias': variantAlias.alias,
				alias: props.data.teamAlias,
				edit: false,
			})
		} else {
			navigate('variant', {
				...parseVariantAlias(variantPack.packAlias),
			})
		}
	}
	const [open, setOpen] = useState(false)
	const [anchor, setAnchor] = useState<null | HTMLElement>(null)

	const { remove, loading } = useFavourites()

	const onRemove = () => {
		remove(variantPack.packGuid)
	}
	return (
		<>
			<DraggableSong
				data={{
					packGuid: variantPack.packGuid,
					alias: variantPack.packAlias,
					title: variantPack.title,
				}}
			>
				<Box
					sx={{
						bgcolor: 'grey.100',
						borderRadius: 2,
						gap: 1,
						'&:hover': {
							bgcolor: 'grey.200',
						},
						'&:active': {
							bgcolor: 'grey.300',
						},
						transition: 'all 0.2s',
						userSelect: 'none',
						cursor: 'pointer',
						paddingRight: 2,
					}}
					display={'flex'}
					alignItems={'center'}
					justifyContent={'space-between'}
					onDoubleClick={onOpenClick}
				>
					<Box
						display={'flex'}
						alignItems={'center'}
						flex={1}
						sx={{
							padding: 2,
							paddingLeft: 4,
						}}
						onClick={onOpenClick}
					>
						<Typography
							sx={{
								paddingRight: 4,
								userSelect: 'none',
								// padding: 2,
							}}
						>
							{props.index + 1}
						</Typography>
						<Box display={'flex'} flexDirection={'column'}>
							<Box display={'flex'} gap={1}>
								<Typography strong>{variantPack.title}</Typography>
								{props.data.teamName && (
									<Tooltip label={t('songCreatedInTeam')}>
										<Chip
											label={props.data.teamName}
											size="small"
											color="primary"
										/>
									</Tooltip>
								)}
							</Box>
							<Typography
								color={'grey.600'}
								small
								thin
								sx={{
									userSelect: 'none',
								}}
							>
								{hintText.substring(0, 100)}
							</Typography>
						</Box>
					</Box>

					<IconButton
						disabled={loading}
						onClick={(e) => {
							e.stopPropagation()
							e.preventDefault()

							setOpen(true)
							setAnchor(e.currentTarget)
						}}
					>
						<MoreHoriz />
					</IconButton>
				</Box>
			</DraggableSong>
			<Menu
				open={open}
				anchor={anchor}
				onClose={() => setOpen(false)}
				items={[
					{
						title: t('open'),
						onClick: onOpenClick,
						icon: <KeyboardArrowLeft />,
					},
					{
						title: t('remove'),
						subtitle: t('removeFromFavourites'),
						onClick: onRemove,
						icon: <PlaylistRemove />,
						disabled: loading,
					},
				]}
			/>
		</>
	)
}
