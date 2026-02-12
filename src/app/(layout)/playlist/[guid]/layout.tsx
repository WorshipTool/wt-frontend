'use server'
import { useServerApi } from '@/api/tech-and-hooks/useServerApi'
import { InnerPlaylistProvider } from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { useServerPathname } from '@/hooks/pathname/useServerPathname'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { smartRedirect } from '@/routes/routes.tech.server'
import { generateSmartMetadata } from '@/tech/metadata/metadata'
import { LayoutProps, MetadataProps } from '../../../../common/types'

export const generateMetadata = generateSmartMetadata(
	'playlist',
	async (props: MetadataProps<'playlist'>) => {
		const { playlistGettingApi } = await useServerApi()
		const params = await props.params
		try {
			const playlist = await playlistGettingApi.getPlaylistDataByGuid(
				params.guid
			)

			const title = playlist ? playlist.title + ' (Playlist)' : 'Playlist'
			return {
				title: title,
			}
		} catch (e) {
			return {
				title: 'Playlist',
			}
		}
	}
)

export default async function Layout(props: LayoutProps<'playlist'>) {
	const { playlistGettingApi } = await useServerApi()
	const params = await props.params
	const playlist = await playlistGettingApi.getPlaylistDataByGuid(
		params.guid
	)

	try {
		// Send tick to backend
		await playlistGettingApi.updatePlaylistOpenDate(params.guid)
	} catch (e) {
		console.log('Please log-in')
		// console.error(e)
	}

	const pathname = await useServerPathname()
	const afterPlaylist = pathname.split('playlist')[1]
	const isSomethingAfter = afterPlaylist.split('/').length > 2

	if (playlist.teamAlias && !isSomethingAfter) {
		smartRedirect('teamPlaylist', {
			alias: playlist.teamAlias,
			guid: params.guid,
		})
	}
	return (
		<InnerPlaylistProvider guid={params.guid as PlaylistGuid}>
			{props.children}
		</InnerPlaylistProvider>
	)
}
