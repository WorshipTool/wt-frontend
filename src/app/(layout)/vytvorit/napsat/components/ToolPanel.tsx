import { SECTION_MARKS } from '@/common/components/SheetEditor/sections.constants'
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
	// wrap on narrow screens (phone editor) so the insert controls never
	// overflow the viewport; desktop has room and stays a single row
	flexWrap: 'wrap',
	rowGap: theme.spacing(1),
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
				{SECTION_MARKS.map((s) => (
					<Button
						key={s.mark}
						onClick={() => {
							onNewSection(s.mark)
						}}
						variant="contained"
						size="small"
						color={s.color}
						tooltip={t(s.tooltipKey)}
					>
						{t(s.labelKey)}
					</Button>
				))}
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
