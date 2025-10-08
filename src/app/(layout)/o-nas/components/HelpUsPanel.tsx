'use client'
import { Box, Button, Typography } from '@/common/ui'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useTranslations } from 'next-intl'

export default function HelpUsPanel() {
	const navigate = useSmartNavigate()
	const tAbout = useTranslations('about')

	const onJoinClick = () => {
		navigate('contact', {
			wantToJoin: true,
		})
	}
	return (
		<Box
			display={'flex'}
			flexDirection={'column'}
			gap={2}
			flexWrap={'wrap'}
			flex={1}
		>
			<Box display={'flex'} flexDirection={'column'}>
				<Typography variant="h2" noWrap>
					{tAbout('helpPanel.title')}
				</Typography>
				<Typography variant="h4" color="grey.600">
					{tAbout('helpPanel.description')}
				</Typography>
			</Box>
			<Box display={'flex'}>
				<Button color={'primarygradient'} onClick={onJoinClick}>
					{tAbout('helpPanel.join')}
				</Button>
			</Box>
		</Box>
	)
}
