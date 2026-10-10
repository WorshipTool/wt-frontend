import { Box, Typography } from '@/common/ui'
import { Skeleton } from '@/common/ui/mui/Skeleton'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { DragIndicatorRounded } from '@mui/icons-material'
import { styled } from '@mui/system'
import { PointerEvent, useMemo } from 'react'
import { Link } from '../../../../../../common/ui/Link/Link'
import { PlaylistItemGuid } from '../../../../../../interfaces/playlist/playlist.types'
import useInnerPlaylist from '../../hooks/useInnerPlaylist'

const PanelItemContainer = styled(Box)(({ theme }) => ({
	// a row inside the white sidebar: outlined, tinted on hover
	backgroundColor: theme.palette.surface.card,
	border: `1px solid ${theme.palette.surface.border}`,
	borderRadius: 8,
	display: 'flex',
	flexDirection: 'row',
	'&:hover': {
		backgroundColor: theme.palette.surface.shell,
		borderColor: theme.palette.grey[300],
	},
	cursor: 'pointer',
	justifyContent: 'center',
	alignItems: 'center',
	paddingRight: 7,
	scrollMarginTop: theme.spacing(0.5),
}))

const StyledPanelButton = styled(Typography)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	flex: 1,
	padding: 9,
	paddingLeft: 0,
}))

interface PanelItemProps {
	itemGuid: PlaylistItemGuid
	itemIndex: number
	/** Makes the item reorderable by touch: shows a drag handle on devices without hover. */
	onDragHandlePointerDown?: (e: PointerEvent<HTMLElement>) => void
}

export default function PanelItem({
	itemGuid,
	itemIndex,
	onDragHandlePointerDown,
}: PanelItemProps) {
	const { loading, items } = useInnerPlaylist()

	const item = useMemo(() => {
		return items.find((i) => i.guid === itemGuid)!
	}, [items, itemGuid])

	const onPanelItemClickCall = (guid: string) => {
		const el = document.getElementById('playlistItem_' + guid)
		el?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		})
	}

	return !item ? (
		<></>
	) : (
		<Link
			to="variant"
			params={{
				...parseVariantAlias(item.pack.packAlias),
			}}
			onlyWithShift
		>
			<PanelItemContainer id={'panelItem_' + item.guid}>
				{!loading ? (
					<>
						{onDragHandlePointerDown && (
							<Box
								onPointerDown={onDragHandlePointerDown}
								sx={{
									display: 'none',
									'@media (hover: none)': { display: 'flex' },
									alignSelf: 'stretch',
									alignItems: 'center',
									paddingLeft: 1,
									color: 'grey.400',
									cursor: 'grab',
									touchAction: 'none',
								}}
							>
								<DragIndicatorRounded fontSize="small" />
							</Box>
						)}
						<Typography
							sx={{
								padding: '9px',
								paddingLeft: '14px',
							}}
							strong={900}
						>
							{itemIndex + 1}.
						</Typography>
						<StyledPanelButton onClick={() => onPanelItemClickCall(item.guid)}>
							{item.pack.title}
						</StyledPanelButton>
					</>
				) : (
					<Skeleton
						variant="text"
						width={200}
						sx={{ marginLeft: 2 }}
						key={'skelet' + item.guid}
					></Skeleton>
				)}
			</PanelItemContainer>
		</Link>
	)
}
