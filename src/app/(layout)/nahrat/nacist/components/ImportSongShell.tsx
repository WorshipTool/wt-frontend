'use client'

import { MobileAppHeader } from '@/common/components/MobileAppHeader'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { Box, Typography } from '@/common/ui'
import { useTranslations } from 'next-intl'

/**
 * The page's one phone/desktop branch: the app-shell header on a phone, the
 * desktop page title otherwise (the same shape as Moje písně). The content
 * beneath is shared.
 */
export default function ImportSongShell({
	children,
}: {
	children: React.ReactNode
}) {
	const t = useTranslations('upload.import')
	const phone = useIsPhone()

	if (phone) {
		return (
			<MobileAppHeader title={t('title')} backTo="addMenu">
				<Box sx={{ paddingTop: 1, paddingBottom: 2 }}>{children}</Box>
			</MobileAppHeader>
		)
	}

	return (
		<Box
			sx={{
				paddingTop: 7,
				paddingBottom: 4,
				display: 'flex',
				flexDirection: 'column',
				gap: 3,
			}}
		>
			<Typography variant="h4" strong={600}>
				{t('title')}
			</Typography>
			{children}
		</Box>
	)
}
