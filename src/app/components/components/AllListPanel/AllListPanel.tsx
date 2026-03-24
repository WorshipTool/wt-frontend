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
					borderRadius: 2.5,
					overflow: 'hidden',
					backgroundColor: 'white',
					border: '1px solid',
					borderColor: 'grey.200',
					boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
				}}
			>
				<Button
					variant="text"
					sx={{
						width: '100%',
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						paddingY: 2,
						paddingX: 2.5,
						color: theme.palette.primary.main,
						'&:hover': {
							backgroundColor: theme.palette.grey[50],
						},
					}}
					to="songsList"
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
						}}
					>
						<Typography
							small
							sx={{
								color: 'grey.500',
							}}
						>
							{tHome('allList.browse')}
						</Typography>
						<Typography
							strong
							sx={{
								color: 'grey.900',
							}}
						>
							{tHome('allList.title')}
						</Typography>
					</Box>
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: '50%',
							background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
							fontSize: '1.2rem',
							flexShrink: 0,
						}}
					>
						→
					</Box>
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
