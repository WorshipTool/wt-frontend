'use server'
import { useServerApi } from '@/api/tech-and-hooks/useServerApi'
import { InnerPlaylistProvider } from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { generateSmartMetadata } from '@/tech/metadata/metadata'
import { notFound } from 'next/navigation'
import { LayoutProps, MetadataProps } from '../../../../common/types'

export const generateMetadata = generateSmartMetadata(
	'playlist',
	async ({ params }: MetadataProps<'playlist'>) => {
		const { playlistGettingApi } = await useServerApi()
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

	try {
		await playlistGettingApi.getPlaylistDataByGuid(props.params.guid)
	} catch (e) {
		notFound()
	}

	try {
		// Send tick to backend
		await playlistGettingApi.updatePlaylistOpenDate(props.params.guid)
	} catch (e) {
		console.log('Please log-in')
		// console.error(e)
	}

	return (
		<InnerPlaylistProvider guid={props.params.guid as PlaylistGuid}>
			{props.children}
		</InnerPlaylistProvider>
	)
}
