'use client'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { useInnerPack } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import Popup from '@/common/components/Popup/Popup'
import { Button } from '@/common/ui'
import { PackTranslationType } from '@/types/song'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function SetTranslationTypeAdminButton() {
	const [open, setOpen] = useState(false)
	const t = useTranslations('admin')

	const { enqueueSnackbar } = useSnackbar()
	const { packGuid } = useInnerPack()
	const { songManagementApi } = useApi()

	const OPTIONS: { label: string; value: PackTranslationType }[] = [
		{ label: t('translationType.original'), value: PackTranslationType.Original },
		{ label: t('translationType.translation'), value: PackTranslationType.Translation },
		{
			label: t('translationType.officialTranslation'),
			value: PackTranslationType.OfficialTranslation,
		},
		{ label: t('translationType.unknown'), value: PackTranslationType.Unknown },
	]

	const onOptionClick = async (value: PackTranslationType) => {
		await songManagementApi.setTranslationType({
			packGuid: packGuid,
			translationType: value,
		})
		const label = OPTIONS.find((o) => o.value === value)?.label || ''
		enqueueSnackbar(t('translationType.setTo', { type: label }))
		setOpen(false)
	}

	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				small
				sx={{
					width: 'fit-content',
				}}
			>
				{t('translationType.chooseType')}
			</Button>

			<Popup
				title={t('translationType.selectType')}
				open={open}
				onClose={() => setOpen(false)}
			>
				{OPTIONS.map((p) => {
					return (
						<Button
							key={p.value}
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
