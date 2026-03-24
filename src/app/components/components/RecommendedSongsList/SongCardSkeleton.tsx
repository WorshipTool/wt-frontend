import { Box } from '@/common/ui'
import { Skeleton } from '@/common/ui/mui/Skeleton'

export default function SongCardSkeleton() {
	return (
		<Box
			sx={{
				height: 200,
				backgroundColor: 'rgba(255, 255, 255, 0.7)',
				backdropFilter: 'blur(8px)',
				borderRadius: '16px',
				padding: 2.5,
				border: '1px solid',
				borderColor: 'grey.200',
			}}
		>
			<Skeleton
				width={'60%'}
				height={'2rem'}
				sx={{ borderRadius: '8px' }}
			/>

			{Array.from({ length: 5 }).map((_, i) => (
				<Skeleton
					key={i}
					width={80 + '%'}
					height={'1.5rem'}
					sx={{ borderRadius: '6px' }}
				/>
			))}
		</Box>
	)
}
