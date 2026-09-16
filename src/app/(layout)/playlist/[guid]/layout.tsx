'use server'
import { useServerApi } from '@/api/tech-and-hooks/useServerApi'
import { InnerPlaylistProvider } from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { checkLayoutUserMembership } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/tech/layout.tech'
import { useServerPathname } from '@/hooks/pathname/useServerPathname'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { smartRedirect } from '@/routes/routes.tech.server'
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

	let playlist
	try {
		playlist = await playlistGettingApi.getPlaylistDataByGuid(props.params.guid)
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

	const pathname = await useServerPathname()
	const afterGuid = pathname.split(`/${props.params.guid}`)[1] ?? ''
	const isSomethingAfter = afterGuid !== '' && afterGuid !== '/'

	// Members get the playlist inside the team page, everyone else reads it
	// here. Only members may be redirected, otherwise the team layout would
	// send them straight back and the two routes would loop.
	if (playlist.teamAlias && !isSomethingAfter) {
		const isMember = await checkLayoutUserMembership(playlist.teamAlias)
		if (isMember) {
			smartRedirect('teamPlaylist', {
				alias: playlist.teamAlias,
				guid: props.params.guid,
			})
		}
	}
	return (
		<InnerPlaylistProvider guid={props.params.guid as PlaylistGuid}>
			{props.children}
		</InnerPlaylistProvider>
	)
}
