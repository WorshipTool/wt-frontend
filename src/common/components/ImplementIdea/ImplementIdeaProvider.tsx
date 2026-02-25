'use client'

import AdminOption from '@/common/components/admin/AdminOption'
import { FRONTEND_URL } from '@/api/constants'
import { useImplementKosmickey } from '@/hooks/useImplementKosmickey/useImplementKosmickey'
import useAuth from '@/hooks/auth/useAuth'
import { deriveBasePath } from '@/tech/url/basePath'
import { isPreviewMode } from '@/tech/preview/previewMode'
import { Lightbulb } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'
import ImplementIdeaDialog from './ImplementIdeaDialog'
import PreviewModeBanner from './PreviewModeBanner'
import PreviewModeDialog from './PreviewModeDialog'

const POLL_INTERVAL_MS = 60_000
const INITIAL_HASH = process.env.NEXT_PUBLIC_BUILD_HASH
const previewMode = isPreviewMode()

export default function ImplementIdeaProvider() {
	const [open, setOpen] = useState(false)
	const { isAdmin } = useAuth()
	const { enqueueSnackbar } = useSnackbar()
	const notifiedRef = useRef(false)

	useImplementKosmickey(() => {
		setOpen(true)
	})

	useEffect(() => {
		if (!INITIAL_HASH) return

		const basePath = deriveBasePath(FRONTEND_URL)
		const url = `${basePath}/api/build-id`

		const check = async () => {
			if (notifiedRef.current) return
			try {
				const res = await fetch(url, { cache: 'no-store' })
				const { hash } = await res.json()
				if (hash && hash !== INITIAL_HASH) {
					notifiedRef.current = true
					enqueueSnackbar('A new version is available.', {
						variant: 'info',
						persist: true,
						action: () => (
							<span
								onClick={() => window.location.reload()}
								style={{ cursor: 'pointer', fontWeight: 600, marginRight: 8 }}
							>
								Reload
							</span>
						),
					})
				}
			} catch {
				// Network errors are non-critical, will retry next interval
			}
		}

		const interval = setInterval(check, POLL_INTERVAL_MS)
		return () => clearInterval(interval)
	}, [])

	return (
		<>
			{!previewMode && isAdmin() && (
				<AdminOption
					icon={<Lightbulb />}
					title="Submit an idea"
					subtitle="Open the idea submission dialog"
					onClick={() => setOpen(true)}
					stayOpenedOnClick={false}
				/>
			)}
			{previewMode && isAdmin() && (
				<PreviewModeBanner onClick={() => setOpen(true)} />
			)}
			{previewMode ? (
				<PreviewModeDialog open={open} onClose={() => setOpen(false)} />
			) : (
				<ImplementIdeaDialog open={open} onClose={() => setOpen(false)} />
			)}
		</>
	)
}
