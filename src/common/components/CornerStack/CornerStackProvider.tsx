'use client'
import useBottomPanel from '@/app/providers/BottomPanelProvider'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box } from '@/common/ui'
import {
	CORNER_STACK_BOTTOM_RIGHT_ID,
	CORNER_STACK_GAP,
	CORNER_STACK_Z_INDEX,
} from './constants'

export {
	CORNER_STACK_BOTTOM_RIGHT_ID,
	CORNER_STACK_GAP,
	CORNER_STACK_Z_INDEX,
} from './constants'

/**
 * CornerStackProvider renders fixed containers at screen corners.
 * Elements from anywhere in the component tree can portal into these
 * containers via the <CornerStack> component and will be stacked
 * vertically without overlapping.
 *
 * The bottom-right container accounts for any bottom panel height
 * (e.g. player bar) so stacked elements are never hidden underneath.
 *
 * Items render bottom-to-top in the order they mount in the React tree.
 */
export default function CornerStackProvider() {
	const { height: bottomPanelHeight } = useBottomPanel()
	const isSmall = useDownSize('sm')
	const edgeOffset = isSmall ? 24 : 30

	return (
		<Box
			id={CORNER_STACK_BOTTOM_RIGHT_ID}
			sx={{
				position: 'fixed',
				bottom: bottomPanelHeight + edgeOffset,
				right: edgeOffset,
				display: 'flex',
				flexDirection: 'column-reverse',
				alignItems: 'flex-end',
				gap: `${CORNER_STACK_GAP}px`,
				pointerEvents: 'none',
				zIndex: CORNER_STACK_Z_INDEX,
			}}
		/>
	)
}
