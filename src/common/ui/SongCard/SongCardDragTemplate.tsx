import DragTemplate from '@/common/components/DragTemplate/DragTemplate'
import { SURFACE_SHADOW } from '@/common/constants/surfaces'
import { Box, Typography } from '@/common/ui'
import { forwardRef } from 'react'

type SongCardDragTemplateProps = {
	title: string
}

// `forwardRef` přijímá props a ref, který následně přesměrujeme na vnitřní element
const SongCardDragTemplate = forwardRef<
	HTMLDivElement,
	SongCardDragTemplateProps
>(function SongCardDragTemplate(props, ref) {
	return (
		<DragTemplate>
			<Box display={'flex'}>
				<Box
					bgcolor={'surface.card'}
					boxShadow={SURFACE_SHADOW.floating}
					borderRadius={'0.5rem'}
					padding={1}
					ref={ref}
				>
					<Typography variant="h6">{props.title}</Typography>
				</Box>
			</Box>
		</DragTemplate>
	)
})

export default SongCardDragTemplate
