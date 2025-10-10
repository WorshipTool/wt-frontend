import { PresentationPlaylistCards } from '@/app/(layout)/playlist/[guid]/prezentace/PresentationPlaylistCards'
import { Box } from '@/common/ui'

export default function Page() {
	return (
		<Box
			sx={{
				position: 'fixed',
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
				zIndex: 2,
			}}
		>
			<PresentationPlaylistCards />
		</Box>
	)
}
