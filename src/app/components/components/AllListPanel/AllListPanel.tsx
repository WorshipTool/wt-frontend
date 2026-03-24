'use client'
import { Box, Button, Typography } from '@/common/ui'
import { useTranslations } from 'next-intl'

export default function AllListPanel() {
	const tHome = useTranslations('home')
	return (
		<Box
			display={'flex'}
			flexDirection={'row'}
			alignItems={'center'}
			flexWrap={'wrap'}
			sx={{
				bgcolor: 'rgba(255, 255, 255, 0.85)',
				backdropFilter: 'blur(12px)',
				borderRadius: '16px',
				overflow: 'hidden',
				border: '1px solid',
				borderColor: 'grey.200',
				transition: 'box-shadow 0.3s ease, transform 0.2s ease',
				'&:hover': {
					boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
					transform: 'translateY(-1px)',
				},
			}}
		>
			<Button
				variant="text"
				sx={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					padding: 1.5,
					borderRadius: '16px',
				}}
				color="black"
				to="songsList"
			>
				<Typography small color="grey.400">
					{tHome('allList.browse')}
				</Typography>
				{tHome('allList.title')}
			</Button>
		</Box>
	)
}
