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
				bgcolor: 'rgba(255, 255, 255, 0.92)',
				backdropFilter: 'blur(16px)',
				borderRadius: '18px',
				overflow: 'hidden',
				border: '1px solid',
				borderColor: 'rgba(0, 133, 255, 0.08)',
				transition: 'box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
				'&:hover': {
					boxShadow: '0 8px 32px rgba(0, 133, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
					transform: 'translateY(-3px)',
					borderColor: 'rgba(0, 133, 255, 0.15)',
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
