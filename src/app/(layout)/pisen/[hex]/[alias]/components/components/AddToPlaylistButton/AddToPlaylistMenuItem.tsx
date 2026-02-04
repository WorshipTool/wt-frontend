import PlaylistMenuItem from '@/common/components/Menu/SelectPlaylistMenu/PlaylistMenuItem'
import { Box, CircularProgress } from '@/common/ui'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { BasicVariantPack } from '@/types/song'
import { CheckCircle, PlaylistAdd } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect } from 'react'
import usePlaylistsGeneral from '../../../../../../../../hooks/playlist/usePlaylistsGeneral'

interface PlaylistMenuItemProps {
	variant: BasicVariantPack
	guid: PlaylistGuid
	title: string
}

export default function AddToPlaylistMenuItem({
	variant,
	guid: playlistGuid,
	title,
}: PlaylistMenuItemProps) {
	const {
		addVariantToPlaylist: addToPlaylist,
		removeVariantFromPlaylist: removeFromPlaylist,
	} = usePlaylistsGeneral()
	const { isVariantInPlaylist } = usePlaylistsGeneral()
	const { enqueueSnackbar } = useSnackbar()
	const t = useTranslations('playlist')

	const [loading, setLoading] = React.useState(true)
	const [isInPlaylist, setIsInPlaylist] = React.useState<boolean>(false)

	const reloadPlaylists = () => {
		return isVariantInPlaylist(variant.packGuid, playlistGuid).then((r) => {
			setIsInPlaylist(r)
		})
	}

	useEffect(() => {
		if (variant) {
			setLoading(true)
			reloadPlaylists().then(() => setLoading(false))
		}
	}, [variant])

	const addVariantToPlaylist = useCallback(
		(playlistGuid: PlaylistGuid) => {
			setLoading(true)

			try {
				addToPlaylist(variant.packGuid, playlistGuid).then(async (result) => {
					await reloadPlaylists()
					setLoading(false)
					enqueueSnackbar(t('songAddedToPlaylist'), {
						variant: 'success',
						autoHideDuration: 3000,
					})
				})
			} catch (e) {
				console.log(e)
			}
		},
		[variant.packGuid, playlistGuid, enqueueSnackbar, t]
	)

	const removeVariantFromPlaylist = useCallback(
		(playlistGuid: PlaylistGuid) => {
			setLoading(true)

			try {
				removeFromPlaylist(variant.packGuid, playlistGuid).then(
					async (result) => {
						await reloadPlaylists()
						setLoading(false)
					}
				)
			} catch (e) {
				console.log(e)
			}
		},
		[variant.packGuid, playlistGuid]
	)

	const onClick = useCallback(() => {
		if (!isInPlaylist) addVariantToPlaylist(playlistGuid)
		else removeVariantFromPlaylist(playlistGuid)
	}, [
		isInPlaylist,
		playlistGuid,
		addVariantToPlaylist,
		removeVariantFromPlaylist,
	])
	return (
		<PlaylistMenuItem
			guid={playlistGuid}
			title={title}
			onClick={onClick}
			icon={
				loading ? (
					<CircularProgress size={'1rem'} color="inherit" />
				) : !isInPlaylist ? (
					<PlaylistAdd fontSize="small" />
				) : (
					<Box color={'grey.800'}>
						<CheckCircle fontSize="small" color="inherit" />
					</Box>
				)
			}
		/>
	)
}
