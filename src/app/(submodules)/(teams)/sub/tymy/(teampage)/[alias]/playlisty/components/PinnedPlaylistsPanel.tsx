import { PlaylistData } from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import TeamPlaylistSelect from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TeamPlaylistSelect/TeamPlaylistSelect'
import PinnedPlaylistPanelItem from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/playlisty/components/PinnedPlaylistPanelItem'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { TeamPermissions } from '@/app/(submodules)/(teams)/sub/tymy/tech'
import { Box, useTheme } from '@/common/ui'
import { Clickable } from '@/common/ui/Clickable'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { usePermission } from '@/hooks/permissions/usePermission'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useApiState, useApiStateEffect } from '@/tech/ApiState'
import { PushPin } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'

export default function PinnedPlaylistsPanel() {
	const t = useTranslations('teams.playlists')
	const [open, setOpen] = useState(false)
	const [anchor, setAnchor] = useState<HTMLElement | null>(null)

	const { guid: teamGuid, alias: teamAlias } = useInnerTeam()

	const { teamPlaylistsApi } = useApi()
	const { fetchApiState: fetchPinApiState, apiState: pinApiState } =
		useApiState()

	const handleOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
		setAnchor(e.currentTarget)
		setOpen(true)
	}, [])

	const startIcon = useMemo(() => <PushPin />, [])

	const [{ data: pinnedPlaylists, loading: pinnedPlaylistsLoading }, reload] =
		useApiStateEffect(async () => {
			const result = await teamPlaylistsApi.getPinnedPlaylistsToTeam(teamGuid)
			return result.playlists
		}, [teamGuid])

	const onPlaylistSelect = useCallback(
		(data: PlaylistData) => {
			setOpen(false)

			fetchPinApiState(
				async () => {
					return teamPlaylistsApi.pinPlaylistToTeam({
						teamGuid: teamGuid,
						playlistGuid: data.guid,
					})
				},
				() => reload()
			)
		},
		[teamGuid, reload]
	)

	const onRemove = useCallback(
		(playlistGuid: string) => {
			fetchPinApiState(
				async () => {
					return teamPlaylistsApi.unpinPlaylistFromTeam({
						teamGuid: teamGuid,
						playlistGuid: playlistGuid,
					})
				},
				() => reload()
			)
		},
		[teamGuid, reload]
	)

	const filterFunc = useCallback(
		(playlist: PlaylistData) => {
			// Remove already added
			return !pinnedPlaylists?.some((p) => p.guid === playlist.guid)
		},
		[pinnedPlaylists]
	)

	const navigate = useSmartNavigate()

	const hasPermissionToAdd = usePermission<TeamPermissions>(
		'team.pin_playlist',
		{ teamGuid }
	)

	const theme = useTheme()

	return !hasPermissionToAdd && pinnedPlaylists?.length === 0 ? null : (
		<Box display={'flex'} flexDirection={'column'}>
			{/* <Box
				display={'flex'}
				flexDirection={'row'}
				justifyContent={'space-between'}
			>
				<Typography variant="h6">Připnuté playlisty</Typography>
				{/* <Box display={'flex'}>
					{hasPermissionToAdd && (
						<Button
							variant="outlined"
							onClick={handleOpen}
							startIcon={startIcon}
							loading={pinApiState.loading}
							size="small"
						>
							Připnout playlist
						</Button>
					)}
				</Box> 
			</Box>
			<Gap /> */}
			<Box display={'flex'} flexDirection={'row'} gap={1} flexWrap={'wrap'}>
				{pinnedPlaylists?.map((playlist) => (
					<PinnedPlaylistPanelItem
						data={playlist as PlaylistData}
						onRemove={() => onRemove(playlist.guid)}
						key={playlist.guid}
					/>
				))}
				{/* {pinnedPlaylists?.length === 0 && (
					<Typography italic color="grey.700">
						Žádné připnuté playlisty
					</Typography>
				)} */}
				{hasPermissionToAdd && !pinApiState.loading && (
					<Clickable tooltip={t('pinNewPlaylist')} onClick={handleOpen}>
						<Box
							sx={{
								width: theme.spacing(22),
								aspectRatio: '3/2',
								bgcolor: 'grey.300',
								borderRadius: 3,
								display: 'flex',
								flexDirection: 'row',
								gap: 1,
								justifyContent: 'center',
								alignItems: 'center',
								color: 'grey.700',
							}}
						>
							<PushPin />
							<Typography>{t('pinPlaylist')}</Typography>
						</Box>
					</Clickable>
				)}
			</Box>
			<Gap />

			<TeamPlaylistSelect
				open={open}
				onClose={() => setOpen(false)}
				anchor={anchor}
				onSelect={onPlaylistSelect}
				filterFunc={filterFunc}
				// anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
			/>
		</Box>
	)
}
