'use client'

import { useApi } from '@/api/tech-and-hooks/useApi'
import { useInnerPack } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import MenuItem from '@/common/components/Menu/MenuItem'
import Popup from '@/common/components/Popup/Popup'
import { Button } from '@/common/ui'
import { useApiState } from '@/tech/ApiState'
import { Publish } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { enqueueSnackbar } from 'notistack'
import { useState } from 'react'

export default function SendToApproval() {
	const [open, setOpen] = useState(false)
	const { packGuid } = useInnerPack()
	const tSend = useTranslations('songPage.sendToApproval')
	const tCommon = useTranslations('common')

	const { songPublishingApi } = useApi()

	const { fetchApiState, apiState } = useApiState()

	const send = async () => {
		await fetchApiState(async () =>
			songPublishingApi.sendPackToApproval({
				packGuid: packGuid,
			})
		)

		enqueueSnackbar(tSend('success'))
		setOpen(false)
		window.location.reload()
	}

	return (
		<>
			<MenuItem
				key={'send-to-approval item'}
				title={tSend('menuTitle')}
				icon={<Publish />}
				subtitle={tSend('menuSubtitle')}
				onClick={() => {
					setOpen(true)
				}}
			/>

			<Popup
				key={'send-to-approval popup'}
				open={open}
				onClose={() => setOpen(false)}
				title={tSend('dialogTitle')}
				onSubmit={send}
				actions={[
					<Button type="reset" outlined key={'cancel'}>
						{tCommon('cancel')}
					</Button>,
					<Button
						type="submit"
						color="primary"
						loading={apiState.loading}
						key={'send'}
					>
						{tSend('confirm')}
					</Button>,
				]}
			>
				{tSend('question')}
			</Popup>
		</>
	)
}
