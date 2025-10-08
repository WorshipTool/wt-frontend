'use client'
import { useInnerPack } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import VerifyButton from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/VerifyButton'
import Popup from '@/common/components/Popup/Popup'
import { Button, Typography } from '@/common/ui'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function AdminVerifyButton() {
	const t = useTranslations('admin')
	const variant = useInnerPack()
	const [verifyPopupOpen, setVerifyPopupOpen] = useState(false)
	return (
		<>
			<Button
				small
				color="success"
				onClick={() => setVerifyPopupOpen(true)}
				sx={{
					width: 'fit-content',
				}}
			>
				{t('songAdmin.manageVerification')}
			</Button>

			<Popup
				open={verifyPopupOpen}
				onClose={() => setVerifyPopupOpen(false)}
				title={t('songAdmin.manualVerification')}
				subtitle={variant.title}
				actions={[
					<Button key={'cancel'} type="reset" size="small" variant="text">
						{t('songAdmin.cancel')}
					</Button>,
					<VerifyButton variant={variant} key={'action'} />,
				]}
				width={300}
			>
				{variant.verified !== null ? (
					<>
						{variant.verified ? (
							<Typography>{t('songAdmin.songManuallyVerified')}</Typography>
						) : (
							<Typography>{t('songAdmin.songManuallyRejected')}</Typography>
						)}
					</>
				) : (
					<>
						<Typography>{t('songAdmin.songNotManuallyVerified')}</Typography>
					</>
				)}
			</Popup>
		</>
	)
}
