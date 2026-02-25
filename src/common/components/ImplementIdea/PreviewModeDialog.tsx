'use client'

import Popup from '@/common/components/Popup/Popup'
import { Box, Button, IconButton, TextField } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha, Tab, Tabs } from '@/common/ui/mui'
import { keyframes } from '@emotion/react'
import { Close, Refresh, Visibility } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type PreviewModeDialogProps = {
	open: boolean
	onClose: () => void
}

const bgMove = keyframes`
  0%   { transform: translate3d(-120px, -80px, 0) scale(1)    rotate(-3deg); }
  50%  { transform: translate3d(120px,   80px, 0) scale(1.12) rotate(4deg);  }
  100% { transform: translate3d(-120px, -80px, 0) scale(1)    rotate(-3deg); }
`

const BLUE = '#0085FF'
const BLUE_DARK = '#0060cc'

export default function PreviewModeDialog({ open, onClose }: PreviewModeDialogProps) {
	const t = useTranslations('previewMode')
	const [activeTab, setActiveTab] = useState(0)
	const [message, setMessage] = useState('')

	const handleClose = () => {
		setMessage('')
		setActiveTab(0)
		onClose()
	}

	return (
		<Popup
			open={open}
			onClose={handleClose}
			width={520}
			sx={{
				position: 'relative',
				overflow: 'hidden',
				'&::before': {
					content: '""',
					position: 'absolute',
					inset: -140,
					background: `
						radial-gradient(420px 320px at 50% 50%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 35%, transparent 70%),
						radial-gradient(520px 420px at 15% 25%, ${BLUE}55 0%, transparent 65%),
						radial-gradient(480px 380px at 85% 20%, ${BLUE}22 0%, transparent 65%),
						radial-gradient(520px 420px at 60% 85%, ${BLUE}33 0%, transparent 70%)
					`,
					zIndex: 0,
					filter: 'blur(22px)',
					pointerEvents: 'none',
					willChange: 'transform',
					transform: 'translate3d(0,0,0)',
					animation: `${bgMove} 8s ease-in-out infinite`,
				},
			}}
		>
			<Box sx={{ zIndex: 1 }}>
				{/* Header */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 0.75,
							bgcolor: alpha(BLUE, 0.18),
							color: BLUE_DARK,
							padding: '3px 10px 3px 8px',
							borderRadius: 2,
						}}
					>
						<Visibility sx={{ fontSize: 15 }} />
						<Typography variant="subtitle1" strong={600}>
							{t('dialogTitle')}
						</Typography>
					</Box>
					<IconButton small onClick={handleClose}>
						<Close fontSize="inherit" />
					</IconButton>
				</Box>

				<Gap value={1.5} />

				{/* Tabs */}
				<Tabs
					value={activeTab}
					onChange={(_, v) => setActiveTab(v)}
					sx={{
						minHeight: 36,
						'& .MuiTabs-indicator': { backgroundColor: BLUE },
						'& .MuiTab-root': { minHeight: 36, fontSize: '0.8rem', textTransform: 'none', padding: '6px 12px' },
						'& .Mui-selected': { color: `${BLUE} !important` },
					}}
				>
					<Tab label={t('updateTab')} />
					<Tab label={t('historyTab')} />
				</Tabs>

				<Gap value={2} />

				{/* Tab 0 — Update preview */}
				{activeTab === 0 && (
					<>
						<Typography variant="h4" strong sx={{ letterSpacing: '0.02em' }}>
							{t('updateHeading')}
						</Typography>
						<Gap value={0.5} />
						<Typography variant="subtitle1" strong={300} color="grey.600">
							{t('updateSubtitle')}
						</Typography>

						<Gap value={2} />

						<Box
							sx={{
								border: '1.5px solid',
								borderColor: alpha(BLUE, 0.45),
								borderRadius: 2,
								px: 1.5,
								py: 1,
								bgcolor: 'rgba(255,255,255,0.55)',
								transition: 'border-color 0.2s',
								'&:focus-within': { borderColor: BLUE },
							}}
						>
							<TextField
								value={message}
								onChange={setMessage}
								placeholder={t('updatePlaceholder')}
								multiline
								autoFocus
								sx={{ minHeight: 80 }}
							/>
						</Box>

						<Gap value={1} />

						<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
							<Button
								color="primarygradient"
								type="button"
								disabled
								sx={{ borderRadius: 3, paddingX: 5, opacity: 0.5 }}
							>
								{t('submitButton')}
							</Button>
							<Typography variant="normal" size="0.72rem" color="grey.400">
								{t('submitComingSoon')}
							</Typography>
						</Box>

						<Gap value={1} />
					</>
				)}

				{/* Tab 1 — History */}
				{activeTab === 1 && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'flex-end',
								gap: 1,
								mb: 0.25,
							}}
						>
							<IconButton small disabled aria-label={t('refreshHistory')}>
								<Refresh fontSize="inherit" />
							</IconButton>
						</Box>

						<Typography variant="normal" size="0.85rem" color="grey.500" align="center">
							{t('noHistory')}
						</Typography>

						<Gap value={1} />
					</Box>
				)}
			</Box>
		</Popup>
	)
}
