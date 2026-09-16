import { useServerApi } from '@/api/tech-and-hooks/useServerApi'
import TeamPlaylistClientProviders from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/playlist/[guid]/PlaylistClientProviders'
import { checkLayoutUserMembership } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/tech/layout.tech'
import { LayoutProps } from '@/common/types'
import { smartRedirect } from '@/routes/routes.tech.server'
import { generateSmartMetadata } from '@/tech/metadata/metadata'

export const generateMetadata = generateSmartMetadata(
	'teamPlaylist',
	async ({ params }) => {
		try {
			const api = await useServerApi()
			const playlist = await api.playlistGettingApi.getPlaylistDataByGuid(
				params.guid
			)
			if (playlist) {
				return {
					title: `${playlist.title} (Playlist)`,
				}
			}
		} catch (e) {
			return {
				title: 'Playlist',
			}
		}
		return {
			title: 'Playlist',
		}
	}
)

export default async function Layout(props: LayoutProps<'teamPlaylist'>) {
	const membershipCheck = await checkLayoutUserMembership(props.params.alias)
	if (!membershipCheck) {
		smartRedirect('playlist', { guid: props.params.guid })
	}

	const { playlistGettingApi } = await useServerApi()

	try {
		// Send tick to backend
		await playlistGettingApi.updatePlaylistOpenDate(props.params.guid)
	} catch (e) {}

	return (
		<TeamPlaylistClientProviders>{props.children}</TeamPlaylistClientProviders>
	)
}
