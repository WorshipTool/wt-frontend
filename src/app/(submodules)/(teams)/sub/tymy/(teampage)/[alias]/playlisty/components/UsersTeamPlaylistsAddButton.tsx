import { PostCreatePlaylistResult } from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { Box, Clickable, IconButton, useTheme } from '@/common/ui'
import useCurrentPlaylist from '@/hooks/playlist/useCurrentPlaylist'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useApiState } from '@/tech/ApiState'
import { Add } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

export default function UsersTeamPlaylistsAddButton() {
	const t = useTranslations('teams.playlists')
	const { playlistEditingApi, teamEditingApi } = useApi()
	const { alias, guid } = useInnerTeam()

	const { turnOn } = useCurrentPlaylist()

	const navigate = useSmartNavigate()

	const theme = useTheme()

	const { fetchApiState, apiState } = useApiState<PostCreatePlaylistResult>()

	const onCreateClick = useCallback(() => {
		fetchApiState(
			async () => {
				const p = await playlistEditingApi.createPlaylist()

				await teamEditingApi.attachPlaylistToTeam({
					teamGuid: guid,
					playlistGuid: p,
				})

				return {
					guid: p,
				}
			},
			(d) => {
				turnOn(d.guid as PlaylistGuid)

				navigate('teamPlaylist', {
					guid: d.guid,
					alias,
				})
			}
		)
	}, [guid, navigate])
	return (
		<Clickable tooltip={t('createNew')} onClick={() => onCreateClick()}>
			<Box
				sx={{
					// padding: 2,
					borderRadius: 3,
					// bgcolor: 'grey.100',
					// border: '1px solid',
					borderColor: 'grey.400',
					// width: theme.spacing(6),
					height: theme.spacing(6),
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<IconButton variant="contained" color="grey.300">
					<Add />
				</IconButton>
			</Box>
		</Clickable>
		// <Box>
		// 	<Button
		// 		onClick={onCreateClick}
		// 		tooltip="Create playlist"
		// 		color="grey.300"
		// 		sx={{
		// 			height: theme.spacing(10),
		// 			aspectRatio: 1,
		// 			borderRadius: 3,
		// 		}}
		// 	>
		// 		<Add
		// 			color="inherit"
		// 			sx={{
		// 				color: 'grey.900',
		// 			}}
		// 		/>
		// 	</Button>
		// </Box>
	)
}
