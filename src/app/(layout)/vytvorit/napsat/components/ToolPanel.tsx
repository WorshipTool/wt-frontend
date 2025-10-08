import { Box, Button, ButtonGroup, Typography } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import { AutofpsSelect } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

const Container = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.grey[200],
	boxShadow: `0px 0px 2px ${theme.palette.grey[500]}`,
	borderRadius: 6,
	padding: theme.spacing(1),
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: theme.spacing(1),
	// color: theme.palette.primary.contrastText,
}))

interface ToolPaneProps {
	onNewSection: (name: string) => void
	onNewChord: () => void
}

export default function ToolPanel({ onNewSection, onNewChord }: ToolPaneProps) {
	const t = useTranslations('songEditor')
	
	return (
		<Container>
			<Typography strong>{t('mark')}</Typography>

			<ButtonGroup>
				<Button
					onClick={() => {
						onNewSection('S')
					}}
					variant="contained"
					size="small"
					tooltip={t('markVerse')}
				>
					{t('verse')}
				</Button>
				<Button
					onClick={() => {
						onNewSection('R')
					}}
					variant="contained"
					size="small"
					color="success"
					tooltip={t('markChorus')}
				>
					{t('chorus')}
				</Button>
				<Button
					onClick={() => {
						onNewSection('B')
					}}
					variant="contained"
					size="small"
					color="secondary"
					tooltip={t('markBridge')}
				>
					{t('bridge')}
				</Button>
			</ButtonGroup>
			<Box flex={1} />
			<Button
				variant="outlined"
				onClick={() => {
					onNewChord()
				}}
				size="small"
				startIcon={<AutofpsSelect />}
			>
				{t('insertChord')}
			</Button>
		</Container>
	)
}
