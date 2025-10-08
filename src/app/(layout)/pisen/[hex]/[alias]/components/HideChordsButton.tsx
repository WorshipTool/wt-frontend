'use client'

import { Box, Button } from '@/common/ui'
import { useTranslations } from 'next-intl'

type HideChordsButtonProps = {
	hiddenValue: boolean
	onChange: (value: boolean) => void
}

export default function HideChordsButton(props: HideChordsButtonProps) {
	const tHide = useTranslations('songPage.hideChords')
	return (
		<Box sx={{ color: 'grey.500' }} display={'flex'}>
			<Button
				size="small"
				color="inherit"
				onClick={() => {
					props.onChange(!props.hiddenValue)
				}}
				variant="text"
			>
				{props.hiddenValue ? tHide('show') : tHide('hide')}
			</Button>
		</Box>
	)
}
