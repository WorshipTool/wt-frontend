import LeftPanel from '@/app/(layout)/playlist/[guid]/components/LeftPanel/LeftPanel'
import MiddlePanel from '@/app/(layout)/playlist/[guid]/components/MiddlePanel/MiddlePanel'
import PlaylistMobile from '@/app/(layout)/playlist/[guid]/components/PlaylistMobile'
import SongDropPlaylistContainer from '@/app/(layout)/playlist/[guid]/components/SongDropPlaylistContainer'
import TopPlaylistPanel from '@/app/(layout)/playlist/[guid]/components/TopPanel/TopPlaylistPanel'
import { PLAYLIST_WIDE_BREAKPOINT } from '@/app/(layout)/playlist/[guid]/playlist.constants'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box } from '@/common/ui'

export default function PlaylistPreview() {
	// Narrow screens get the app-shell layout, which can do everything the
	// three-panel editor can — add, reorder, rename, remove. It takes over
	// exactly where the three-panel editor's left panel gives up, so there is no
	// width left in between where the playlist is read-only.
	const narrow = useDownSize(PLAYLIST_WIDE_BREAKPOINT)

	if (narrow) return <PlaylistMobile />

	return (
		<SongDropPlaylistContainer>
			<Box position={'relative'}>
				<TopPlaylistPanel />

				<Box
					display={'flex'}
					flexDirection={'row'}
					position={'relative'}
					minHeight={'calc(100vh - 140px)'}
				>
					<LeftPanel />
					<MiddlePanel />
					{/* <RightPanel /> */}
				</Box>
			</Box>
		</SongDropPlaylistContainer>
	)
}
