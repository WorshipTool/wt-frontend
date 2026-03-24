'use client'
import { Box, Button, Typography, useTheme } from '@/common/ui'
import { useTranslations } from 'next-intl'

type AllListPanelProps = {
	isMobile?: boolean
}

export default function AllListPanel({ isMobile }: AllListPanelProps) {
	const tHome = useTranslations('home')
	const theme = useTheme()

	if (isMobile) {
		return (
			<Box
				data-testid="all-list-panel"
				sx={{
					borderRadius: 2,
					overflow: 'hidden',
					background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
				}}
			>
				<Button
					variant="text"
					sx={{
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						paddingY: 1.5,
						color: 'white',
						'&:hover': {
							backgroundColor: 'rgba(255,255,255,0.1)',
						},
					}}
					to="songsList"
				>
					<Typography
						small
						sx={{
							color: 'rgba(255,255,255,0.7)',
						}}
					>
						{tHome('allList.browse')}
					</Typography>
					<Typography
						strong
						sx={{
							color: 'white',
						}}
					>
						{tHome('allList.title')}
					</Typography>
				</Button>
			</Box>
		)
	}

	return (
		<Box
			data-testid="all-list-panel"
			display={'flex'}
			flexDirection={'row'}
			alignItems={'center'}
			flexWrap={'wrap'}
			sx={{
				bgcolor: 'grey.100',
				borderRadius: 2,
				overflow: 'hidden',
			}}
		>
			<Button
				variant="text"
				sx={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
				}}
				color="black"
				to="songsList"
			>
				<Typography small color="grey.500">
					{tHome('allList.browse')}
				</Typography>
				{tHome('allList.title')}
			</Button>
		</Box>
	)
}
