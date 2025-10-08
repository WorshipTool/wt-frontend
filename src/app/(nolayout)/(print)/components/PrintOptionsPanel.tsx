'use client'
import { Checkbox } from '@/common/ui/Checkbox'
import { Card } from '@/ui/Card/Card'
import { useTranslations } from 'next-intl'

export default function PrintOptionsPanel() {
	const t = useTranslations('print')
	
	return (
		<Card
			title={t('options')}
			subtitle={t('advancedPrintSettings')}
			// icon={<Settings />}
			sx={{
				// backgroundColor: grey[100],
				borderWidth: 1,
				borderColor: 'black',
				borderStyle: 'solid',
				filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))',
			}}
		>
			{/* <Typography>ahoj</Typography> */}
			<Checkbox label={t('showChords')} checked />
		</Card>
	)
}
