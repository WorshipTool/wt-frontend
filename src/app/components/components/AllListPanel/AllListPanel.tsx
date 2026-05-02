'use client'
import { Box, Button, Typography, useTheme } from '@/common/ui'
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded'
import QueueMusicRounded from '@mui/icons-material/QueueMusicRounded'
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
					borderRadius: 3,
					overflow: 'hidden',
					background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.dark}10 100%)`,
					border: '1px solid',
					borderColor: `${theme.palette.primary.main}20`,
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
						gap: 1.5,
						'&:hover': {
							backgroundColor: `${theme.palette.primary.main}08`,
						},
						'&:active': {
							backgroundColor: `${theme.palette.primary.main}12`,
						},
					}}
					to="songsList"
				>
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: 2,
							background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0,
						}}
					>
						<QueueMusicRounded
							sx={{ color: 'white', fontSize: '1.25rem' }}
						/>
					</Box>

					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
							flex: 1,
							minWidth: 0,
						}}
					>
						<Typography
							strong
							sx={{
								color: 'grey.900',
								fontSize: '0.9rem',
							}}
						>
							{tHome('allList.title')}
						</Typography>
						<Typography
							sx={{
								color: 'grey.500',
								fontSize: '0.75rem',
							}}
						>
							{tHome('allList.browse')}
						</Typography>
					</Box>

					<KeyboardArrowRightRounded
						sx={{
							color: theme.palette.grey[400],
							fontSize: '1.5rem',
							flexShrink: 0,
						}}
					/>
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
