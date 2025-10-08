'use client'
import { Box } from '@/common/ui'
import { Typography } from '@/common/ui/Typography'
import { ExpandMore } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

type MoreProps = {}

export default function More(props: MoreProps) {
	const tAbout = useTranslations('about')
	const onMoreClick = () => {
		const toY = window.innerHeight - 56

		window.scrollTo({
			top: toY,
			behavior: 'smooth',
		})
	}
	return (
		<Box
			display={'flex'}
			flexDirection={'column'}
			alignItems={'center'}
			sx={{
				gap: 1,
				'&:hover': {
					gap: 1.8,
					transform: 'translateY(2px)',
				},
				transition: 'all 0.3s',
				cursor: 'pointer',
			}}
			onClick={onMoreClick}
		>
			<Typography strong>{tAbout('more.label')}</Typography>
			<ExpandMore
				sx={{
					transform: 'scaleX(2) translateY(-10px)',
				}}
			/>
		</Box>
	)
}
