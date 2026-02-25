'use client'

import useBottomPanel from '@/app/providers/BottomPanelProvider'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box } from '@/common/ui'
import { alpha } from '@/common/ui/mui'
import { getPreviewPrNumber, getPreviewPrTitle } from '@/tech/preview/previewMode'
import { Visibility } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

type PreviewModeBannerProps = {
	onClick: () => void
}

const BLUE = '#0085FF'

export default function PreviewModeBanner({ onClick }: PreviewModeBannerProps) {
	const t = useTranslations('previewMode')
	const { height } = useBottomPanel()
	const isSmall = useDownSize('sm')
	const offset = isSmall ? 24 : 32

	const prTitle = getPreviewPrTitle()
	const prNumber = getPreviewPrNumber()
	const label = prTitle
		? t('bannerLabel', { title: prTitle })
		: prNumber
			? t('bannerLabelPr', { prNumber })
			: 'Preview'

	return (
		<Box
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e: React.KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onClick()
				}
			}}
			aria-label={label}
			sx={{
				position: 'fixed',
				bottom: offset + height,
				left: offset,
				display: 'flex',
				alignItems: 'center',
				gap: 0.75,
				bgcolor: alpha(BLUE, 0.12),
				color: BLUE,
				border: '1.5px solid',
				borderColor: alpha(BLUE, 0.3),
				padding: '5px 12px 5px 9px',
				borderRadius: 3,
				cursor: 'pointer',
				fontSize: '0.78rem',
				fontWeight: 600,
				backdropFilter: 'blur(4px)',
				transition: 'background 0.15s, border-color 0.15s',
				'&:hover': {
					bgcolor: alpha(BLUE, 0.2),
					borderColor: alpha(BLUE, 0.5),
				},
				userSelect: 'none',
				zIndex: 1300,
			}}
		>
			<Visibility sx={{ fontSize: 14 }} />
			{label}
		</Box>
	)
}
