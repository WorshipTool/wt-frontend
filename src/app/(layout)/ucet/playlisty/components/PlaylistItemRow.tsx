import { PlaylistData } from '@/api/generated'
import { PlaylistOrderOptions } from '@/app/(layout)/ucet/playlisty/components/PlaylistsOrderSelect'
import Menu from '@/common/components/Menu/Menu'
import Popup from '@/common/components/Popup/Popup'
import { Box, Tooltip, useTheme } from '@/common/ui'
import { SURFACE_CARD_SX, SURFACE_SHADOW } from '@/common/constants/surfaces'
import { Button } from '@/common/ui/Button'
import { IconButton } from '@/common/ui/IconButton'
import { Link } from '@/common/ui/Link/Link'
import { Chip } from '@/common/ui/mui'
import { Typography } from '@/common/ui/Typography'
import useCurrentPlaylist from '@/hooks/playlist/useCurrentPlaylist'
import usePlaylistsGeneral from '@/hooks/playlist/usePlaylistsGeneral'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { getSmartDateAgoString } from '@/tech/date/date.tech'
import { czechConjugation } from '@/tech/string/string.tech'
import { Delete, KeyboardArrowLeft, MoreHoriz } from '@mui/icons-material'
import { useState } from 'react'

type PlaylistItemRowProps = {
	data: PlaylistData
	selected?: boolean
	onSelect?: () => void
	sortKey: PlaylistOrderOptions
	selectable?: boolean
}

export default function PlaylistItemRow({
	data,
	...props
}: PlaylistItemRowProps) {
	const [openDialog, setOpenDialog] = useState(false)

	const [openMenu, setOpenMenu] = useState(false)
	const [anchor, setAnchor] = useState<null | HTMLElement>(null)

	const { isOn, guid: currentPlaylistGuid, turnOff } = useCurrentPlaylist()

	const { deletePlaylist: deleteByGuid } = usePlaylistsGeneral()

	const askToDeletePlaylist = async (guid: PlaylistGuid, title: string) => {
		setOpenDialog(true)
	}
	const deletePlaylist = async (guid: PlaylistGuid) => {
		if (currentPlaylistGuid === guid) turnOff()
		deleteByGuid(guid)
	}

	const createdAt = new Date(data.createdAt)
	const updatedAt = new Date(data.updatedAt)
	const openedAt = data.openedAt ? new Date(data.openedAt) : null

	const showDate =
		props.sortKey === 'createdAt'
			? createdAt
			: props.sortKey === 'updatedAt'
			? updatedAt
			: props.sortKey === 'openedAt'
			? openedAt
			: null

	const navigate = useSmartNavigate()

	const theme = useTheme()
	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					// alignItems: 'center',
					position: 'relative',
					justifyContent: 'space-between',
					...SURFACE_CARD_SX,
					outline: '1px solid',
					outlineColor: 'transparent',
					borderRadius: 2,
					gap: 2,

					'&:hover': {
						borderColor: 'grey.300',
						boxShadow: SURFACE_SHADOW.raised,
					},
					...(props.selectable &&
						props.selected && {
							// outlineColor: theme.palette.primary.main,

							bgcolor: 'surface.sunken',
							'&:hover': {
								bgcolor: 'surface.sunken',
							},
						}),

					'&:active': {
						bgcolor: 'surface.sunken',
					},
					transition: 'all 0.2s',
				}}
				onClick={() => {
					if (!props.selectable) return
					props.onSelect?.()
				}}
				onDoubleClick={() => {
					navigate('playlist', { guid: data.guid })
				}}
			>
				<Box
					display={'flex'}
					flexDirection={'row'}
					alignItems={'center'}
					gap={1}
					flex={1}
					onClick={() => {
						navigate('playlist', { guid: data.guid })
					}}
					sx={{
						cursor: 'pointer',

						paddingLeft: 1,
					}}
				>
					<Link
						to="playlist"
						params={{
							guid: data.guid,
						}}
					>
						<Typography
							strong={500}
							sx={{
								marginLeft: 1,
							}}
						>
							{data.title}
						</Typography>
					</Link>
					<Box>
						{data.teamName ? (
							<Tooltip title={`Playlist vytvořen v rámci týmu`}>
								<Chip label={data.teamName} color="primary" size="small" />
							</Tooltip>
						) : (
							<></>
						)}
					</Box>
				</Box>

				<Box display={'flex'} alignItems={'center'}>
					{isOn && currentPlaylistGuid == data.guid ? (
						<Chip label={'Aktivní'} size="small" color="secondary" />
					) : (
						<></>
					)}
				</Box>

				<Box
					display={'flex'}
					gap={4}
					alignItems={'center'}
					sx={{
						paddingRight: 1,
						paddingY: 0.5,
					}}
				>
					<Typography
						color="grey.500"
						thin
						sx={{
							width: '100px',
							userSelect: 'none',
						}}
					>
						{data.itemsCount > 0 ? data.itemsCount : 'Žádná'}{' '}
						{czechConjugation('píseň', 'písně', 'písní', data.itemsCount)}
					</Typography>

					<Typography
						color="grey.500"
						thin
						sx={{
							width: '150px',
							userSelect: 'none',
						}}
					>
						{showDate ? getSmartDateAgoString(showDate) : null}
					</Typography>

					<IconButton
						onClick={(e) => {
							setAnchor(e.currentTarget)
							setOpenMenu(true)
						}}
					>
						<MoreHoriz fontSize="inherit" />
					</IconButton>
				</Box>
			</Box>
			<Popup
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				title="Opravdu chcete odstranit playlist?"
				width={400}
				actions={
					<>
						<Button variant="outlined" type="reset">
							Zrušit
						</Button>
						<Button
							onClick={() => {
								deletePlaylist(data.guid as PlaylistGuid)
								setOpenDialog(false)
							}}
							color="error"
							variant="contained"
						>
							Smazat
						</Button>
					</>
				}
			>
				<Typography>
					Chcete opravdu smazat playlist <strong>{data.title}</strong>? Tato
					akce je nevratná.
				</Typography>
			</Popup>

			<Menu
				open={openMenu}
				onClose={() => setOpenMenu(false)}
				anchor={anchor}
				items={[
					{
						title: 'Otevřít',
						onClick: () => {
							navigate('playlist', { guid: data.guid })
						},
						icon: <KeyboardArrowLeft />,
					},
					{
						title: <Typography color="error">Smazat</Typography>,
						icon: <Delete color="error" />,

						onClick: () => {
							askToDeletePlaylist(data.guid as PlaylistGuid, data.title)
							return false
						},
						hidden: Boolean(data.teamName),
					},
				]}
			/>
		</>
	)
}
