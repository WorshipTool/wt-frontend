import { useApi } from '@/api/tech-and-hooks/useApi'
import { MySongsOrderOptions } from '@/app/(layout)/ucet/pisne/components/MySongListOrderSelect'
import Menu from '@/common/components/Menu/Menu'
import Popup from '@/common/components/Popup/Popup'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { IconButton } from '@/common/ui/IconButton'
import HeartLikeButton from '@/common/ui/SongCard/components/HeartLikeButton'
import { Typography } from '@/common/ui/Typography'
import DraggableSong from '@/hooks/dragsong/DraggableSong'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useApiState } from '@/tech/ApiState'
import { getSmartDateAgoString } from '@/tech/date/date.tech'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { Delete, KeyboardArrowLeft, MoreHoriz } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { Sheet } from '@pepavlin/sheet-api'
import { useState } from 'react'
import { BasicVariantPack } from '../../../../../api/dtos'
import { Link } from '../../../../../common/ui/Link/Link'

interface MySongItemProps {
	variant: BasicVariantPack
	index: number

	sortKey: MySongsOrderOptions
	onDelete: () => void
}

export default function MySongItem(props: MySongItemProps) {
	const t = useTranslations('mySongs')
	const [openMenu, setOpenMenu] = useState(false)
	const [anchor, setAnchor] = useState<null | HTMLElement>(null)

	const [openDialog, setOpenDialog] = useState(false)

	const getHintText = () => {
		const sheet = new Sheet(props.variant.sheetData)
		return sheet.getSections()[0].text
	}

	const variantParams = {
		...parseVariantAlias(props.variant.packAlias),
		title: props.variant.title,
	}

	const showDate =
		props.sortKey === 'createdAt'
			? props.variant.createdAt
			: props.sortKey === 'updatedAt'
			? props.variant.updatedAt
			: null
	const showDateString = showDate ? getSmartDateAgoString(showDate) : null

	const navigate = useSmartNavigate()
	const openVariant = () => {
		navigate('variant', variantParams)
	}

	const { songDeletingApi } = useApi()
	const { fetchApiState, apiState } = useApiState()

	const deleteSong = () => {
		fetchApiState(
			async () => {
				return await songDeletingApi._delete(props.variant.packGuid)
			},
			() => {
				props.onDelete()
			}
		)
	}

	const canDelete = !props.variant.public

	return (
		<>
			<DraggableSong
				data={{
					packGuid: props.variant.packGuid,
					alias: props.variant.packAlias,
					title: props.variant.title,
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						gap: 4,
						paddingRight: 2,
						alignItems: 'center',
						// backgroundColor: props.index % 2 == 0 ? '#e0e0e0' : '#e6e6e6',
						bgcolor: 'grey.100',
						borderRadius: 2,
						// cursor: 'pointer',
						'&:hover': {
							bgcolor: 'grey.200',
						},
						'&:active': {
							bgcolor: 'grey.300',
						},
						transition: 'all 0.2s',
					}}
					onDoubleClick={openVariant}
				>
					<Box
						display={'flex'}
						gap={4}
						flex={1}
						alignItems={'center'}
						sx={{
							cursor: 'pointer',
							padding: 2,
							paddingLeft: 4,
						}}
						onClick={openVariant}
					>
						<Typography>{props.index + 1}</Typography>
						<Box flex={1}>
							<Link to="variant" params={variantParams}>
								<Typography
									strong={500}
									sx={{
										textOverflow: 'ellipsis',
										overflow: 'hidden',
										whiteSpace: 'nowrap',
									}}
								>
									{props.variant.title}
								</Typography>
							</Link>
							<Typography
								size={'small'}
								sx={{
									display: {
										xs: 'none',
										sm: 'none',
										md: 'block',
									},
									textOverflow: 'ellipsis',
									overflow: 'hidden',
									whiteSpace: 'nowrap',
									maxWidth: 400,
								}}
								thin
								color="grey.700"
							>
								{getHintText().substring(0, 100)}...
							</Typography>
						</Box>
					</Box>
					<Box>
						<HeartLikeButton
							packGuid={props.variant.packGuid}
							unmountIfNotVisible
							hideIfNot
						/>
					</Box>
					<Typography
						thin
						color="grey.500"
						noWrap
						sx={{
							width: 150,
						}}
					>
						{showDateString}
					</Typography>
					<Box
						display={{
							xs: 'none',
							sm: 'block',
						}}
					>
						<Typography thin color="grey.500">
							{props.variant.public ? t('public') : t('private')}
						</Typography>
					</Box>

					<IconButton
						onClick={(e) => {
							setAnchor(e.currentTarget)
							setOpenMenu(true)
							e.stopPropagation()
							e.preventDefault()
						}}
					>
						<MoreHoriz />
					</IconButton>
				</Box>
			</DraggableSong>
			<Menu
				open={openMenu}
				anchor={anchor}
				onClose={() => setOpenMenu(false)}
				items={[
					{
						title: t('open'),
						onClick: () => {
							openVariant()
						},
						icon: <KeyboardArrowLeft />,
					},
					{
						title: <Typography color="error">{t('delete')}</Typography>,
						onClick: () => {
							setOpenDialog(true)
						},
						icon: <Delete color="error" />,
						hidden: !canDelete,
					},
				]}
			/>

			<Popup
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				title={t('deleteDialog.title')}
				width={400}
				actions={
					<>
						<Button variant="outlined" type="reset" disabled={apiState.loading}>
							{t('deleteDialog.cancel')}
						</Button>
						<Button
							loading={apiState.loading}
							onClick={() => {
								deleteSong()
								setOpenDialog(false)
							}}
							color="error"
							variant="contained"
						>
							{t('deleteDialog.delete')}
						</Button>
					</>
				}
			>
				<Typography>
					{t('deleteDialog.confirmMessage', { title: props.variant.title })}
				</Typography>
			</Popup>
		</>
	)
}
