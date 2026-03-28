'use client'

import { Box } from '@/common/ui'
import { Skeleton } from '@/common/ui/mui/Skeleton'
import { styled } from '@mui/system'

const SkeletonCard = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.grey[100],
	borderRadius: 12,
	padding: 16,
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
	height: 180,
}))

export default function SongCardSkeleton() {
	return (
		<SkeletonCard>
			<Skeleton variant="text" width="75%" height={24} />
			<Skeleton variant="text" width="90%" height={16} />
			<Skeleton variant="text" width="85%" height={16} />
			<Skeleton variant="text" width="60%" height={16} />
			<Box sx={{ flex: 1 }} />
			<Box sx={{ display: 'flex', gap: 1 }}>
				<Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: 1 }} />
				<Skeleton variant="rounded" width={40} height={22} sx={{ borderRadius: 1 }} />
			</Box>
		</SkeletonCard>
	)
}
