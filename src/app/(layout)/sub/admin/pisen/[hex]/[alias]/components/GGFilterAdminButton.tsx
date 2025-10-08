'use client'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { useInnerPack } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import Popup from '@/common/components/Popup/Popup'
import { Button } from '@/common/ui'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

export default function GGFilterAdminButton() {
	const [open, setOpen] = useState(false)
	const t = useTranslations('admin.filter')

	const { enqueueSnackbar } = useSnackbar()
	const { packGuid } = useInnerPack()
	const { songManagementApi } = useApi()

	const OPTIONS: { label: string; value: boolean | null }[] = [
		{ label: t('valid'), value: true },
		{ label: t('invalid'), value: false },
		{ label: t('automatic'), value: null },
	]

	const onOptionClick = async (value: boolean | null) => {
		if (value === null) {
			await songManagementApi.setFilterStatusToAutoForPack(packGuid)
		} else {
			await songManagementApi.setFilterStatusForPack(packGuid, value)
		}
		const label = OPTIONS.find((o) => o.value === value)?.label || ''
		enqueueSnackbar(t('filterSetTo', { label }))
		setOpen(false)
	}

	return (
		<>
			<Button
				// title={'(GG) Validace obsahu'}
				// subtitle="Choose whether the song should be filtered"
				onClick={() => setOpen(true)}
				small
				sx={{
					width: 'fit-content',
				}}
			>
				{t('buttonTitle')}
			</Button>

			<Popup
				title={t('popupTitle')}
				open={open}
				onClose={() => setOpen(false)}
			>
				{OPTIONS.map((p) => {
					return (
						<Button
							key={p.label}
							onClick={() => {
								onOptionClick(p.value)
							}}
							size="small"
							color="secondary"
						>
							{p.label}
						</Button>
					)
				})}
			</Popup>
		</>
	)
}
