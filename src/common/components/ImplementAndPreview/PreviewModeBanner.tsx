'use client'

import useBottomPanel from '@/app/providers/BottomPanelProvider'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box, Tooltip } from '@/common/ui'
import { alpha } from '@/common/ui/mui'
import { getPreviewPrNumber, getPreviewPrTitle } from '@/tech/preview/previewMode'
import { Visibility } from '@mui/icons-material'
import { keyframes } from '@emotion/react'
import { useTranslations } from 'next-intl'
import { BLUE } from './shared'

type PreviewModeBannerProps = {
	isAdmin: boolean
	onClick: () => void
}

const slideIn = keyframes`
  0%   { opacity: 0; transform: translateX(-40px) scale(0.8); }
  50%  { opacity: 1; transform: translateX(6px) scale(1.08); }
  70%  { transform: translateX(-2px) scale(0.98); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
`

const pulse = keyframes`
  0%, 100% { box-shadow: 0 4px 16px rgba(0,0,0,0.35), 0 0 0 0px rgba(0,133,255,0); transform: scale(1); }
  50%      { box-shadow: 0 4px 20px rgba(0,133,255,0.4), 0 0 0 5px rgba(0,133,255,0.12); transform: scale(1.03); }
`

export default function PreviewModeBanner({ isAdmin, onClick }: PreviewModeBannerProps) {
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
			sx={{
				position: 'fixed',
				bottom: offset + height,
				left: offset,
				zIndex: 1300,
			}}
		>
			<Tooltip
				title={isAdmin ? '' : t('loginTooltip')}
				placement="right"
			>
				<Box
					role="button"
					tabIndex={0}
					onClick={isAdmin ? onClick : undefined}
					onKeyDown={(e: React.KeyboardEvent) => {
						if (isAdmin && (e.key === 'Enter' || e.key === ' ')) {
							e.preventDefault()
							onClick()
						}
					}}
					aria-label={label}
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 0.75,
						bgcolor: BLUE,
						color: '#fff',
						padding: '5px 12px 5px 9px',
						borderRadius: 3,
						cursor: isAdmin ? 'pointer' : 'default',
						fontSize: '0.78rem',
						fontWeight: 600,
						boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
						animation: `${slideIn} 0.6s ease-out, ${pulse} 2.5s ease-in-out 0.8s infinite`,
						transition: 'background 0.15s, box-shadow 0.15s',
						'&:hover': isAdmin
							? {
									bgcolor: '#0070dd',
									boxShadow: '0 2px 12px rgba(0,133,255,0.5)',
								}
							: undefined,
						userSelect: 'none',
					}}
				>
					<Visibility sx={{ fontSize: 14 }} />
					{label}
				</Box>
			</Tooltip>
		</Box>
	)
}
