'use client'

import AdminOption from '@/common/components/admin/AdminOption'
import { useImplementKosmickey } from '@/hooks/useImplementKosmickey/useImplementKosmickey'
import useAuth from '@/hooks/auth/useAuth'
import { isPreviewMode } from '@/tech/preview/previewMode'
import { Lightbulb } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import PreviewModeBanner from './PreviewModeBanner'

const ImplementIdeaDialog = dynamic(() => import('./ImplementIdeaDialog'), {
	ssr: false,
})
const PreviewModeDialog = dynamic(() => import('./PreviewModeDialog'), {
	ssr: false,
})

const previewMode = isPreviewMode()

export default function ImplementIdeaProvider() {
	const [open, setOpen] = useState(false)
	const { isAdmin } = useAuth()
	const t = useTranslations('implementIdea')

	useImplementKosmickey(() => {
		setOpen(true)
	})

	return (
		<>
			{!previewMode && isAdmin() && (
				<AdminOption
					icon={<Lightbulb />}
					title={t('adminMenuTitle')}
					subtitle={t('adminMenuSubtitle')}
					onClick={() => setOpen(true)}
					stayOpenedOnClick={false}
				/>
			)}
			{previewMode && (
				<PreviewModeBanner isAdmin={isAdmin()} onClick={() => setOpen(true)} />
			)}
			{previewMode && isAdmin() && (
				<PreviewModeDialog open={open} onClose={() => setOpen(false)} />
			)}
			{!previewMode && (
				<ImplementIdeaDialog open={open} onClose={() => setOpen(false)} />
			)}
		</>
	)
}
