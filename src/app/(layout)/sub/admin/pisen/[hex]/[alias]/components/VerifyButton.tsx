'use client'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { Button } from '@/common/ui'
import { ButtonGroup } from '@/common/ui/ButtonGroup'
import { BasicVariantPack } from '@/types/song'
import { useTranslations } from 'next-intl'

type VerifyButtonProps = {
	variant: BasicVariantPack
}

export default function VerifyButton(props: VerifyButtonProps) {
	const { songPublishingApi } = useApi()
	const t = useTranslations('admin')

	const setVerify = async (status: boolean | null) => {
		await songPublishingApi.verifyVariant({
			packGuid: props.variant.packGuid,
			verify: status,
		})

		window.location.reload()
	}
	return (
		<div>
			{props.variant?.verified !== null ? (
				<>
					<Button
						variant="contained"
						size="small"
						onClick={() => {
							setVerify(null)
						}}
					>
						{props.variant.verified ? t('verification.cancelVerification') : t('verification.cancelRejection')}
					</Button>
				</>
			) : (
				<>
					<ButtonGroup>
						<Button
							variant="contained"
							size="small"
							onClick={() => {
								setVerify(true)
							}}
						>
							{t('verification.verify')}
						</Button>
						<Button
							variant="contained"
							size="small"
							onClick={() => {
								setVerify(false)
							}}
						>
							{t('verification.reject')}
						</Button>
					</ButtonGroup>
				</>
			)}
		</div>
	)
}
