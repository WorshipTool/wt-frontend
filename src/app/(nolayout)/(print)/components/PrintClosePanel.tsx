'use client'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Typography } from '@/common/ui/Typography'
import { Close, Info } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

export default function PrintClosePanel() {
	const t = useTranslations('print')
	const height = 56
	return (
		<>
			<Box height={height} />
			<Box
				sx={{
					height: height,
					bgcolor: 'white',
					position: 'fixed',
					left: 0,
					right: 0,
					bottom: 0,
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'start',
					alignItems: 'center',
					paddingX: 2,
					filter: 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.5))',
					zIndex: 1,
				}}
			>
				<Box
					flex={2}
					sx={{
						display: 'flex',
						justifyContent: 'start',
						alignItems: 'center',
						flexDirection: 'row',
						gap: 1,
					}}
				>
					<Info color="secondary" />
					<Typography>{t('afterPrintingCanClose')}</Typography>
				</Box>
				<Box
					flex={1}
					sx={{
						display: 'flex',
						justifyContent: 'end',
					}}
				>
					<Button
						endIcon={<Close />}
						onClick={() => window.close()}
						// size="small"
						variant="outlined"
						color="inherit"
					>
						{t('closeAndGoBack')}
					</Button>
				</Box>
			</Box>
		</>
	)
}
