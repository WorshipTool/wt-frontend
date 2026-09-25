import LeftPanel from '@/app/(layout)/playlist/[guid]/components/LeftPanel/LeftPanel'
import MiddlePanel from '@/app/(layout)/playlist/[guid]/components/MiddlePanel/MiddlePanel'
import PlaylistMobile from '@/app/(layout)/playlist/[guid]/components/PlaylistMobile'
import SongDropPlaylistContainer from '@/app/(layout)/playlist/[guid]/components/SongDropPlaylistContainer'
import TopPlaylistPanel from '@/app/(layout)/playlist/[guid]/components/TopPanel/TopPlaylistPanel'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { Box } from '@/common/ui'

export default function PlaylistPreview() {
	// Phones get the app-shell layout, which can do everything the three-panel
	// editor can — add, reorder, rename, remove. Everything wider keeps the
	// three-panel editor, including its left panel, which now shows at the same
	// width this switch happens (see PLAYLIST_WIDE_BREAKPOINT): a tablet gets the
	// desktop design, and there is no width left in between with neither.
	const phone = useIsPhone()

	if (phone) return <PlaylistMobile />

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
