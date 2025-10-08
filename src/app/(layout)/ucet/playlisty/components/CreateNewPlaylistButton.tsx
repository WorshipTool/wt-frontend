import { Button } from '@/common/ui/Button'
import useCurrentPlaylist from '@/hooks/playlist/useCurrentPlaylist'
import usePlaylistsGeneral from '@/hooks/playlist/usePlaylistsGeneral'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useApiState } from '@/tech/ApiState'
import { Add } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

export default function CreateNewPlaylistButton() {
	const { turnOn } = useCurrentPlaylist()
	const tPlaylist = useTranslations('playlist')

	const { createPlaylist: createWithoutName } = usePlaylistsGeneral()
	const navigate = useSmartNavigate()

	const { fetchApiState, apiState } = useApiState<PlaylistGuid>()

	const createPlaylist = async () => {
		fetchApiState(
			async () => {
				return await createWithoutName()
			},
			(result) => {
				navigate('playlist', {
					guid: result,
				})
				turnOn(result)
			}
		)
	}
	return (
		<Button
			loading={apiState.loading}
			startIcon={<Add />}
			variant="contained"
			onClick={createPlaylist}
			color="primarygradient"
			tooltip={tPlaylist('createNewPlaylist')}
			sx={{
				height: '100%',
			}}
		>
			{tPlaylist('create')}
		</Button>
	)
}
