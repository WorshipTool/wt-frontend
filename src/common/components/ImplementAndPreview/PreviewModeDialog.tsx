'use client'

import Popup from '@/common/components/Popup/Popup'
import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	TextField,
} from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha } from '@/common/ui/mui'
import { getPreviewPrNumber } from '@/tech/preview/previewMode'
import { keyframes } from '@emotion/react'
import { Close, OpenInNew, Refresh, Visibility } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import {
	BLUE,
	BLUE_DARK,
	STATUS_STYLE,
	bgMove,
	extractPrNumber,
	type PullRequest,
} from './shared'

type Task = {
	taskId: string
	status: string
	prompt: string
	title?: string
	parentTaskId: string | null
	chainId: string
	startedAt: string
	completedAt: string | null
	pullRequests: PullRequest[] | null
}

type PreviewContext = {
	chainId: string
	lastTaskId: string
}

type PreviewModeDialogProps = {
	open: boolean
	onClose: () => void
}

const progressSlide = keyframes`
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`

export function findPreviewContext(
	tasks: Task[],
	prNumber: string,
): PreviewContext | null {
	// Find a task whose PR matches our preview PR number
	const matchingTask = tasks.find((task) =>
		task.pullRequests?.some((pr) => extractPrNumber(pr.url) === prNumber),
	)
	if (!matchingTask) return null

	const { chainId } = matchingTask

	// Find all tasks in this chain, pick the latest one as lastTaskId
	const chainTasks = tasks
		.filter((t) => t.chainId === chainId)
		.sort(
			(a, b) =>
				new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
		)

	const lastTask = chainTasks[chainTasks.length - 1] ?? matchingTask

	return { chainId, lastTaskId: lastTask.taskId }
}

function formatDuration(seconds: number): string {
	if (seconds < 60) return `${seconds}s`
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function formatTime(iso: string): string {
	const d = new Date(iso)
	return d.toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

const POLL_INTERVAL_MS = 15_000

export default function PreviewModeDialog({
	open,
	onClose,
}: PreviewModeDialogProps) {
	const t = useTranslations('previewMode')
	const { enqueueSnackbar } = useSnackbar()
	const [message, setMessage] = useState('')
	const [previewCtx, setPreviewCtx] = useState<PreviewContext | null>(null)
	const [chainTasks, setChainTasks] = useState<Task[]>([])
	const [initialLoading, setInitialLoading] = useState(true)
	const [loading, setLoading] = useState(false)
	const [submitting, setSubmitting] = useState(false)

	const url = process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL
	const prNumber = getPreviewPrNumber()

	const BUSY_STATUSES = ['running', 'queued', 'retrying', 'starting']
	const isBusy =
		chainTasks.length > 0 && BUSY_STATUSES.includes(chainTasks[0].status)

	// Find the PR URL from chain tasks matching the current preview PR
	const prUrl = chainTasks
		.flatMap((t) => t.pullRequests ?? [])
		.find((pr) => extractPrNumber(pr.url) === prNumber)?.url ?? null

	const fetchTasks = async () => {
		if (!url || !prNumber) return
		setLoading(true)
		try {
			const res = await fetch(url, { method: 'GET' })
			const data: { tasks: Task[] } = await res.json()
			const allTasks = data.tasks ?? []
			const ctx = findPreviewContext(allTasks, prNumber)
			setPreviewCtx(ctx)
			if (ctx) {
				const filtered = allTasks
					.filter((t) => t.chainId === ctx.chainId)
					.sort(
						(a, b) =>
							new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
					)
				setChainTasks(filtered)
			} else {
				setChainTasks([])
			}
		} catch {
			// Network errors are non-critical
		} finally {
			setLoading(false)
			setInitialLoading(false)
		}
	}

	// Initial fetch + reset on open
	useEffect(() => {
		if (!open) {
			setInitialLoading(true)
			return
		}
		fetchTasks()
	}, [open])

	// Auto-polling
	useEffect(() => {
		if (!open) return
		const timer = setInterval(fetchTasks, POLL_INTERVAL_MS)
		return () => clearInterval(timer)
	}, [open, url, prNumber])

	const handleSubmit = async () => {
		if (!message.trim() || submitting || isBusy || !url || !prNumber) return
		setSubmitting(true)
		try {
			await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: message.trim(),
					continueInPRNumber: Number(prNumber),
				}),
			})
			enqueueSnackbar(t('submitSuccess'), { variant: 'success' })
			setMessage('')
			fetchTasks()
		} catch {
			enqueueSnackbar(t('submitError'), { variant: 'error' })
		} finally {
			setSubmitting(false)
		}
	}

	const handleClose = () => {
		if (submitting) return
		setMessage('')
		onClose()
	}

	return (
		<Popup
			open={open}
			onClose={handleClose}
			onSubmit={handleSubmit}
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
			<Box sx={{ zIndex: 1, alignSelf: 'stretch' }}>
				{/* Header */}
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
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
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						{prUrl && (
							<a
								href={prUrl}
								target="_blank"
								rel="noopener noreferrer"
								style={{ textDecoration: 'none' }}
							>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 0.4,
										color: BLUE,
										fontSize: '0.7rem',
										fontWeight: 700,
										bgcolor: alpha(BLUE, 0.1),
										border: '1px solid',
										borderColor: alpha(BLUE, 0.25),
										px: 0.75,
										py: 0.25,
										borderRadius: 1,
										whiteSpace: 'nowrap',
										transition: 'background 0.15s',
										'&:hover': { bgcolor: alpha(BLUE, 0.18) },
									}}
								>
									<OpenInNew sx={{ fontSize: 11 }} />
									PR
								</Box>
							</a>
						)}
						<IconButton small onClick={handleClose}>
							<Close fontSize="inherit" />
						</IconButton>
					</Box>
				</Box>

				{initialLoading && (
					<>
						<Gap value={4} />
						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<CircularProgress size={28} sx={{ color: BLUE }} />
						</Box>
						<Gap value={4} />
					</>
				)}

				{!initialLoading && !previewCtx && (
					<>
						<Gap value={3} />
						<Typography
							variant="normal"
							size="0.85rem"
							color="grey.500"
							align="center"
						>
							{t('noChainFound')}
						</Typography>
						<Gap value={3} />
					</>
				)}

				{!initialLoading && previewCtx && (
					<>
						<Gap value={1.5} />

						{/* Update input or busy indicator */}
						{isBusy ? (
							<Box
								data-testid="busy-indicator"
								sx={{
									border: '1.5px solid',
									borderColor: alpha(BLUE, 0.3),
									borderRadius: 2,
									p: 2.5,
									bgcolor: 'rgba(255,255,255,0.55)',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: 1.5,
									overflow: 'hidden',
								}}
							>
								<Typography
									variant="normal"
									size="0.85rem"
									color="grey.600"
									align="center"
								>
									{t('taskRunning')}
								</Typography>
								<Box
									sx={{
										width: '100%',
										height: 3,
										borderRadius: 2,
										bgcolor: alpha(BLUE, 0.1),
										overflow: 'hidden',
										position: 'relative',
									}}
								>
									<Box
										sx={{
											position: 'absolute',
											inset: 0,
											width: '50%',
											bgcolor: BLUE,
											borderRadius: 2,
											animation: `${progressSlide} 1.8s ease-in-out infinite`,
										}}
									/>
								</Box>
							</Box>
						) : (
							<>
								<Typography
									variant="h4"
									strong
									sx={{ letterSpacing: '0.02em' }}
								>
									{t('updateHeading')}
								</Typography>
								<Gap value={0.5} />
								<Typography variant="subtitle1" strong={300} color="grey.600">
									{t('updateSubtitle')}
								</Typography>

								<Gap value={1.5} />

								<Box
									onKeyDown={(e: React.KeyboardEvent) => {
										if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
											e.preventDefault()
											handleSubmit()
										}
									}}
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
										disabled={submitting}
										sx={{ minHeight: 80 }}
									/>
								</Box>

								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										mt: 0.5,
									}}
								>
									<Typography variant="normal" size="0.72rem" color="grey.400">
										Ctrl+Enter
									</Typography>
									<Box sx={{ flex: 1 }} />
									<Button
										color="primarygradient"
										type="button"
										loading={submitting}
										disabled={!message.trim() || !prNumber}
										onClick={handleSubmit}
										sx={{ borderRadius: 3, opacity: 0.9 }}
									>
										{t('submitButton')}
									</Button>
								</Box>
							</>
						)}

						{/* History */}
						{chainTasks.length > 0 && (
							<>
								<Gap value={2} />
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<Typography variant="subtitle1" strong={600} color="grey.600">
										{t('historyTab')}
									</Typography>
									<IconButton
										small
										onClick={fetchTasks}
										disabled={loading}
										aria-label={t('refreshHistory')}
									>
										<Refresh fontSize="inherit" />
									</IconButton>
								</Box>

								<Gap value={0.75} />

								<Box
									sx={{
										maxHeight: '40vh',
										overflowY: 'auto',
										display: 'flex',
										flexDirection: 'column',
										gap: 0.75,
									}}
								>
									{chainTasks.map((task) => {
										const style =
											STATUS_STYLE[task.status] ?? STATUS_STYLE.queued
										return (
											<Box
												key={task.taskId}
												sx={{
													display: 'flex',
													alignItems: 'flex-start',
													gap: 1.5,
													p: 1.25,
													borderRadius: 2,
													bgcolor: 'rgba(255,255,255,0.6)',
													border: '1px solid',
													borderColor: alpha('#000', 0.06),
												}}
											>
												<Box
													sx={{
														bgcolor: style.bg,
														color: style.color,
														px: 1,
														py: 0.25,
														borderRadius: 1,
														fontSize: '0.68rem',
														fontWeight: 600,
														whiteSpace: 'nowrap',
														mt: 0.25,
														flexShrink: 0,
														display: 'flex',
														alignItems: 'center',
														gap: 0.5,
													}}
												>
													{task.status === 'running' && (
														<CircularProgress size={10} sx={{ color: BLUE }} />
													)}
													{task.status}
												</Box>

												<Box sx={{ flex: 1, minWidth: 0 }}>
													<Typography
														variant="normal"
														size="0.8rem"
														color="grey.800"
														sx={{ lineHeight: 1.4 }}
													>
														{task.title ?? task.prompt}
													</Typography>
													<Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
														<Typography
															variant="normal"
															size="0.68rem"
															color="grey.400"
														>
															{formatTime(task.startedAt)}
														</Typography>
														{task.completedAt && task.startedAt && (
															<Typography
																variant="normal"
																size="0.68rem"
																color="grey.400"
															>
																⏱{' '}
																{formatDuration(
																	Math.round(
																		(new Date(task.completedAt).getTime() -
																			new Date(task.startedAt).getTime()) /
																			1000,
																	),
																)}
															</Typography>
														)}
													</Box>
												</Box>
											</Box>
										)
									})}
								</Box>
							</>
						)}

						<Gap value={1} />
					</>
				)}
			</Box>
		</Popup>
	)
}
