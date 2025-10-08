import { PlaylistData } from '@/api/generated'
import Menu from '@/common/components/Menu/Menu'
import PlaylistMenuItem from '@/common/components/Menu/SelectPlaylistMenu/PlaylistMenuItem'
import Popup from '@/common/components/Popup/Popup'
import { Box, CircularProgress, Divider, useTheme } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { ListItemIcon, ListItemText, MenuItem } from '@/common/ui/mui'
import { Typography } from '@/common/ui/Typography'
import { useUsersPlaylists } from '@/hooks/playlist/useUsersPlaylists'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { MoreHoriz } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

type SelectPlaylistMenuProps = {
	open: boolean
	onClose: () => void
	anchor: HTMLElement | null
	onPlaylistClick?: (guid: PlaylistGuid) => void

	itemComponent?: (props: PlaylistData) => JSX.Element
}
const MAX_PLAYLIST_COUNT = 4

export default function SelectPlaylistMenu(props: SelectPlaylistMenuProps) {
	const t = useTranslations('playlist')
	
	// Playlist list
	const { playlists: _playlists, loading } = useUsersPlaylists()
	const playlists = _playlists?.sort((a, b) =>
		a.updatedAt > b.updatedAt ? -1 : 1
	)
	// Dialog state
	const [popupOpen, setPopupOpen] = useState(false)

	useEffect(() => {
		if (!props.open) setPopupOpen(false)
	}, [props.open])

	const theme = useTheme()

	const onPlaylistClick = useCallback(
		(guid: PlaylistGuid) => {
			props.onPlaylistClick?.(guid)
		},
		[props.onPlaylistClick]
	)

	const component = useCallback(
		(p: PlaylistData) => {
			return (
				props.itemComponent?.(p) || (
					<PlaylistMenuItem
						key={p.guid}
						guid={p.guid as PlaylistGuid}
						title={p.title}
						icon={<Typography>{p.title.at(0)?.toUpperCase()}</Typography>}
						onClick={() => onPlaylistClick(p.guid as PlaylistGuid)}
					/>
				)
			)
		},
		[props.itemComponent, onPlaylistClick]
	)

	return (
		<>
			<Menu
				anchor={props.anchor}
				// anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				open={props.open}
				onClose={props.onClose}
			>
				{loading ? (
					<MenuItem disabled key={'loading-aoihh'}>
						<ListItemIcon>
							<CircularProgress size={`1rem`} color="inherit" />
						</ListItemIcon>
						<ListItemText>{t('loading')}</ListItemText>
					</MenuItem>
				) : (
					playlists?.length === 0 && (
						<MenuItem disabled key={'no-playlists-title-aflkj'}>
							<ListItemText>{t('noPlaylists')}</ListItemText>
						</MenuItem>
					)
				)}
				{playlists?.slice(0, MAX_PLAYLIST_COUNT).map((p, i) => {
					return component(p)
				})}
				{playlists &&
					playlists.length > MAX_PLAYLIST_COUNT && [
						<div
							key={'div-with-divider'}
							style={{
								paddingTop: theme.spacing(1),
								paddingBottom: theme.spacing(1),
							}}
						>
							<Divider />
						</div>,

						<MenuItem onClick={() => setPopupOpen(true)} key={'more-titel'}>
							<ListItemIcon>
								<MoreHoriz fontSize="small" />
							</ListItemIcon>
							<ListItemText>{t('more')}</ListItemText>
						</MenuItem>,
					]}
			</Menu>
			<Popup
				open={popupOpen}
				onClose={() => setPopupOpen(false)}
				title={t('addToPlaylist')}
				subtitle={t('selectPlaylistFromList')}
				actions={
					<>
						<Box />
						<Button
							onClick={() => setPopupOpen(false)}
							variant="text"
							color="grey.700"
						>
							{t('close')}
						</Button>
					</>
				}
			>
				<Box
					maxHeight={'50vh'}
					sx={{
						overflowY: 'auto',
					}}
					className={'stylized-scrollbar'}
				>
					{playlists?.map((p, i) => {
						return component(p)
					})}
				</Box>
			</Popup>
		</>
	)
}
