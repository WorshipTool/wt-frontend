import { PlaylistItem } from '@/app/(layout)/playlist/[guid]/components/MiddlePanel/PlaylistItem'
import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { Box } from '@/common/ui'
import { useMemo } from 'react'

export default function MiddlePanel() {
	const { items, loading } = useInnerPlaylist()

	const itemsArr = useMemo(
		() =>
			items
				?.sort((a, b) => {
					return a.order - b.order
				})
				.map((item, index) => (
					// <div key={item.guid}>ahoj{item.guid}</div>
					<PlaylistItem key={item.guid} itemGuid={item.guid} />
				)),
		[items]
	)

	return (
		<Box
			flex={1}
			padding={2}
			position={'relative'}
			className="playlist-middle-song-list"
		>
			{/* no "use a computer" notice here any more: this panel only renders at
			    widths where the full editor is on screen, and below them the narrow
			    layout does the editing instead */}
			{loading || !items ? <>Načítání...</> : <>{itemsArr}</>}
		</Box>
	)
}
