'use client'

import Popup from '@/common/components/Popup/Popup'
import { Box, Button, IconButton, TextField } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha, Tab, Tabs } from '@/common/ui/mui'
import { keyframes } from '@emotion/react'
import { Close, Refresh, Visibility } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { getPreviewPrNumber } from '@/tech/preview/previewMode'

type TaskStatus =
	| 'queued'
	| 'running'
	| 'retrying'
	| 'completed'
	| 'failed'
	| 'interrupted'

type HistoryTask = {
	taskId: string
	status: TaskStatus
	prompt: string
	pullRequestNumber?: number
	pullRequests: { repo: string; url: string }[]
	startedAt?: string
}

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

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string }> = {
	queued:      { bg: alpha('#888888', 0.1), color: '#666'    },
	running:     { bg: alpha(BLUE, 0.12),     color: BLUE      },
	retrying:    { bg: '#fff3e0',             color: '#e65100' },
	completed:   { bg: '#e8f5e9',             color: '#2e7d32' },
	failed:      { bg: '#ffebee',             color: '#c62828' },
	interrupted: { bg: alpha('#888888', 0.1), color: '#666'    },
}

const POLL_INTERVAL_MS = 30_000
const POLL_INTERVAL_S = POLL_INTERVAL_MS / 1000

const prNumberStr = getPreviewPrNumber()
const prNumber = prNumberStr ? parseInt(prNumberStr, 10) : null

export default function PreviewModeDialog({ open, onClose }: PreviewModeDialogProps) {
	const t = useTranslations('previewMode')
	const [activeTab, setActiveTab] = useState(0)
	const [message, setMessage] = useState('')
	const [loading, setLoading] = useState(false)
	const [historyTasks, setHistoryTasks] = useState<HistoryTask[]>([])
	const [historyLoaded, setHistoryLoaded] = useState(false)
	const [countdown, setCountdown] = useState(POLL_INTERVAL_S)
	const { enqueueSnackbar } = useSnackbar()

	const url = process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL
	const urlMissing = !url

	const fetchHistory = async () => {
		if (!url || prNumber == null) return
		try {
			const res = await fetch(url, { method: 'GET' })
			const data: { tasks: HistoryTask[] } = await res.json()
			const allTasks = [...(data.tasks ?? [])].reverse()

			// Filter to tasks associated with the current preview's PR
			const prTasks = allTasks.filter((task) => {
				if (task.pullRequestNumber === prNumber) return true
				return task.pullRequests?.some((pr) => {
					const match = pr.url.match(/\/pull\/(\d+)$/)
					return match ? match[1] === prNumberStr : false
				}) ?? false
			})

			setHistoryTasks(prTasks)
			setHistoryLoaded(true)
		} catch {
			setHistoryLoaded(true)
		}
	}

	useEffect(() => {
		if (!open || activeTab !== 1) return
		fetchHistory()
		setCountdown(POLL_INTERVAL_S)
	}, [open, activeTab])

	useEffect(() => {
		if (!open) return
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					if (activeTab === 1) fetchHistory()
					return POLL_INTERVAL_S
				}
				return prev - 1
			})
		}, 1000)
		return () => clearInterval(timer)
	}, [open, activeTab])

	const handleRefresh = () => {
		fetchHistory()
		setCountdown(POLL_INTERVAL_S)
	}

	const handleClose = () => {
		setMessage('')
		setActiveTab(0)
		onClose()
	}

	const handleSubmit = async () => {
		if (!message.trim() || loading || urlMissing) return

		setLoading(true)
		try {
			const body: Record<string, unknown> = { message }
			if (prNumber != null) body.pullRequestNumber = prNumber

			await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})
			enqueueSnackbar(t('changeSubmitted'), { variant: 'success' })
			setMessage('')
			setActiveTab(1)
			fetchHistory()
		} catch {
			enqueueSnackbar(t('submitFailed'), { variant: 'error' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<Popup
			open={open}
			onClose={handleClose}
			onSubmit={activeTab === 0 ? handleSubmit : undefined}
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
							onKeyDown={(e: React.KeyboardEvent) => {
								if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
									e.preventDefault()
									handleSubmit()
								}
							}}
							sx={{
								border: '1.5px solid',
								borderColor: urlMissing ? 'error.light' : alpha(BLUE, 0.45),
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
								disabled={urlMissing}
							/>
						</Box>

						{urlMissing && (
							<>
								<Gap value={0.5} />
								<Typography variant="normal" size="0.75rem" color="error">
									NEXT_PUBLIC_IMPLEMENT_IDEA_URL is not set
								</Typography>
							</>
						)}

						<Gap value={0.5} />
						<Typography variant="normal" size="0.72rem" color="grey.400" sx={{ textAlign: 'right' }}>
							Ctrl+Enter to submit
						</Typography>

						<Gap value={1} />

						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<Button
								color="primarygradient"
								type="submit"
								loading={loading}
								disabled={!message.trim() || urlMissing}
								sx={{ borderRadius: 3, paddingX: 5, opacity: 0.9 }}
							>
								{t('submitButton')}
							</Button>
						</Box>

						<Gap value={1} />
					</>
				)}

				{/* Tab 1 — Change history */}
				{activeTab === 1 && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						{/* Refresh bar */}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'flex-end',
								gap: 1,
								mb: 0.25,
							}}
						>
							<Typography variant="normal" size="0.72rem" color="grey.400">
								{t('nextRefreshIn', { seconds: String(countdown) })}
							</Typography>
							<IconButton
								small
								onClick={handleRefresh}
								aria-label={t('refreshHistory')}
							>
								<Refresh fontSize="inherit" />
							</IconButton>
						</Box>

						<Box
							sx={{
								maxHeight: '50vh',
								overflowY: 'auto',
								display: 'flex',
								flexDirection: 'column',
								gap: 1,
							}}
						>
							{!historyLoaded && (
								<Typography variant="normal" size="0.85rem" color="grey.500" align="center">
									{t('loading')}
								</Typography>
							)}

							{historyLoaded && historyTasks.length === 0 && (
								<Typography variant="normal" size="0.85rem" color="grey.500" align="center">
									{t('noHistory')}
								</Typography>
							)}

							{historyTasks.map((task) => {
								const style = STATUS_STYLE[task.status]
								return (
									<Box
										key={task.taskId}
										sx={{
											display: 'flex',
											alignItems: 'flex-start',
											gap: 1.5,
											p: 1.5,
											borderRadius: 2,
											bgcolor: 'rgba(255,255,255,0.6)',
											border: '1px solid',
											borderColor: alpha('#000', 0.06),
										}}
									>
										{/* Status chip */}
										<Box
											sx={{
												bgcolor: style.bg,
												color: style.color,
												px: 1,
												py: 0.25,
												borderRadius: 1,
												fontSize: '0.7rem',
												fontWeight: 600,
												whiteSpace: 'nowrap',
												mt: 0.25,
												flexShrink: 0,
											}}
										>
											{task.status}
										</Box>

										{/* Prompt */}
										<Box sx={{ flex: 1 }}>
											<Typography
												variant="normal"
												size="0.82rem"
												color="grey.800"
												sx={{ lineHeight: 1.4 }}
											>
												{task.prompt?.length > 120
													? task.prompt.slice(0, 120) + '…'
													: task.prompt}
											</Typography>
										</Box>
									</Box>
								)
							})}
						</Box>

						<Gap value={1} />
					</Box>
				)}
			</Box>
		</Popup>
	)
}
