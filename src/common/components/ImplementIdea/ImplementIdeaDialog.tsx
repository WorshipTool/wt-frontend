'use client'

import Popup from '@/common/components/Popup/Popup'
import { Box, Button, IconButton, TextField } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha, Tab, Tabs } from '@/common/ui/mui'
import { keyframes } from '@emotion/react'
import { Close, Lightbulb, OpenInNew, Refresh } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

type TaskStatus =
	| 'queued'
	| 'running'
	| 'retrying'
	| 'completed'
	| 'failed'
	| 'interrupted'

type PullRequest = {
	repo: string
	url: string
}

type Task = {
	taskId: string
	status: TaskStatus
	prompt: string
	title?: string
	branch?: string
	pullRequestNumber?: number
	pullRequests: PullRequest[]
	previewUrl?: string
	startedAt?: string
	completedAt?: string
}

type TaskGroup = {
	key: string
	pullRequestNumber: number | null
	branch: string | null
	pullRequests: PullRequest[]
	tasks: Task[]
}

type ImplementIdeaDialogProps = {
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
const PURPLE = '#9c27b0'
const PURPLE_DARK = '#7b1fa2'

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string }> = {
	queued:      { bg: alpha('#888888', 0.1), color: '#666'    },
	running:     { bg: alpha(BLUE, 0.12),     color: BLUE      },
	retrying:    { bg: '#fff3e0',             color: '#e65100' },
	completed:   { bg: '#e8f5e9',             color: '#2e7d32' },
	failed:      { bg: '#ffebee',             color: '#c62828' },
	interrupted: { bg: alpha('#888888', 0.1), color: '#666'    },
}

function extractPrNumber(prUrl: string): string | null {
	const match = prUrl.match(/\/pull\/(\d+)$/)
	return match ? match[1] : null
}

function extractGitHubPrInfo(prUrl: string): { owner: string; repo: string; number: string } | null {
	const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
	if (!match) return null
	return { owner: match[1], repo: match[2], number: match[3] }
}

async function checkPrMerged(prUrl: string): Promise<boolean> {
	const info = extractGitHubPrInfo(prUrl)
	if (!info) return false
	try {
		const res = await fetch(
			`https://api.github.com/repos/${info.owner}/${info.repo}/pulls/${info.number}/merge`,
			{ method: 'GET', headers: { Accept: 'application/vnd.github.v3+json' } }
		)
		return res.status === 204
	} catch {
		return false
	}
}

const PREVIEW_BASE_URL = 'https://preview.chvalotce.cz'

function getGroupKey(task: Task): string {
	// Primary: group by PR number from pullRequests URL
	if (task.pullRequests?.length > 0) {
		const prNumber = extractPrNumber(task.pullRequests[0].url)
		if (prNumber) return `pr:${prNumber}`
	}
	// Secondary: group by pullRequestNumber (for iteration tasks before PR info is updated)
	if (task.pullRequestNumber != null && task.pullRequestNumber > 0) {
		return `pr:${task.pullRequestNumber}`
	}
	// Tertiary: group by branch
	if (task.branch) {
		return `branch:${task.branch}`
	}
	// Fallback: standalone group per task
	return `task:${task.taskId}`
}

function groupTasks(tasks: Task[]): TaskGroup[] {
	// tasks is expected to be in newest-first order (already reversed from API response)
	// Map preserves insertion order, so groups are ordered by their newest task
	const groups = new Map<string, TaskGroup>()

	for (const task of tasks) {
		const key = getGroupKey(task)

		if (!groups.has(key)) {
			groups.set(key, {
				key,
				pullRequestNumber: null,
				branch: null,
				pullRequests: [],
				tasks: [],
			})
		}

		const group = groups.get(key)!
		group.tasks.push(task)

		// Merge PR info into group (deduplicated by URL)
		for (const pr of (task.pullRequests ?? [])) {
			if (!group.pullRequests.some(gpr => gpr.url === pr.url)) {
				group.pullRequests.push(pr)
			}
		}

		// Set pullRequestNumber from task if not already set
		if (!group.pullRequestNumber) {
			if (task.pullRequestNumber && task.pullRequestNumber > 0) {
				group.pullRequestNumber = task.pullRequestNumber
			} else if (task.pullRequests?.length > 0) {
				const num = extractPrNumber(task.pullRequests[0].url)
				if (num) group.pullRequestNumber = parseInt(num, 10)
			}
		}

		// Set branch if available and not yet set
		if (!group.branch && task.branch) {
			group.branch = task.branch
		}
	}

	return Array.from(groups.values())
}

const POLL_INTERVAL_MS = 30_000
const POLL_INTERVAL_S = POLL_INTERVAL_MS / 1000

export default function ImplementIdeaDialog({
	open,
	onClose,
}: ImplementIdeaDialogProps) {
	const t = useTranslations('implementIdea')
	const [message, setMessage] = useState('')
	const [loading, setLoading] = useState(false)
	const [tasks, setTasks] = useState<Task[]>([])
	const [tasksLoaded, setTasksLoaded] = useState(false)
	const [activeTab, setActiveTab] = useState(0)
	const [countdown, setCountdown] = useState(POLL_INTERVAL_S)
	const [mergedPrUrls, setMergedPrUrls] = useState<Set<string>>(new Set())
	const { enqueueSnackbar } = useSnackbar()

	const url = process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL
	const urlMissing = !url

	const fetchTasks = async () => {
		if (!url) return
		try {
			const res = await fetch(url, { method: 'GET' })
			const data: { tasks: Task[] } = await res.json()
			const newTasks = [...(data.tasks ?? [])].reverse()
			setTasks(newTasks)
			setTasksLoaded(true)

			// Check merge status for completed tasks with PRs
			const completedWithPr = newTasks.filter(
				(task) => task.status === 'completed' && task.pullRequests?.length > 0
			)
			if (completedWithPr.length > 0) {
				const checks = await Promise.all(
					completedWithPr.map(async (task) => {
						const pr = task.pullRequests[0]
						const merged = await checkPrMerged(pr.url)
						return { prUrl: pr.url, merged }
					})
				)
				setMergedPrUrls((prev) => {
					const next = new Set(prev)
					checks.forEach(({ prUrl, merged }) => {
						if (merged) next.add(prUrl)
						else next.delete(prUrl)
					})
					return next
				})
			}
		} catch {
			setTasksLoaded(true)
		}
	}

	useEffect(() => {
		if (!open) return
		fetchTasks()
		setCountdown(POLL_INTERVAL_S)
	}, [open])

	useEffect(() => {
		if (open && activeTab === 1) {
			fetchTasks()
			setCountdown(POLL_INTERVAL_S)
		}
	}, [activeTab])

	useEffect(() => {
		if (!open) return
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					fetchTasks()
					return POLL_INTERVAL_S
				}
				return prev - 1
			})
		}, 1000)
		return () => clearInterval(timer)
	}, [open])

	const handleRefresh = () => {
		fetchTasks()
		setCountdown(POLL_INTERVAL_S)
	}

	const handleClose = () => {
		if (loading) return
		setMessage('')
		setActiveTab(0)
		onClose()
	}

	const handleSubmit = async () => {
		if (!message.trim() || loading || urlMissing) return

		setLoading(true)
		try {
			await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message }),
			})
			enqueueSnackbar(t('ideaSubmitted'), { variant: 'success' })
			setMessage('')
			setActiveTab(1)
			fetchTasks()
		} catch {
			enqueueSnackbar(t('submitFailed'), { variant: 'error' })
		} finally {
			setLoading(false)
		}
	}

	const inProgressCount = tasks.filter(
		(t) => t.status === 'running' || t.status === 'retrying'
	).length
	const queuedCount = tasks.filter((t) => t.status === 'queued').length

	const groups = groupTasks(tasks)

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
						<Lightbulb sx={{ fontSize: 15 }} />
						<Typography variant="subtitle1" strong={600}>
							{t('title')}
						</Typography>
					</Box>
					<IconButton small onClick={handleClose} disabled={loading}>
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
					<Tab label={t('submitIdeaTab')} />
					<Tab
						label={
							tasksLoaded && (inProgressCount > 0 || queuedCount > 0)
								? t('recentIdeasTabActive', { count: String(inProgressCount + queuedCount) })
								: t('recentIdeasTab')
						}
					/>
				</Tabs>

				<Gap value={2} />

				{/* Tab 0 — Submit */}
				{activeTab === 0 && (
					<>
						<Typography variant="h4" strong sx={{ letterSpacing: '0.02em' }}>
							{t('heading')}
						</Typography>
						<Gap value={0.5} />
						<Typography variant="subtitle1" strong={300} color="grey.600">
							{t('subtitle')}
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
								placeholder={t('placeholder')}
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

				{/* Tab 1 — Recent ideas (grouped by PR / branch) */}
				{activeTab === 1 && (
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 1,
						}}
					>
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
								aria-label={t('refreshButton')}
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
							{!tasksLoaded && (
								<Typography variant="normal" size="0.85rem" color="grey.500" align="center">
									{t('loading')}
								</Typography>
							)}

							{tasksLoaded && tasks.length === 0 && (
								<Typography variant="normal" size="0.85rem" color="grey.500" align="center">
									{t('noIdeas')}
								</Typography>
							)}

							{groups.map((group) => {
								const mainPr = group.pullRequests[0]
								const prNumber = mainPr
									? extractPrNumber(mainPr.url)
									: (group.pullRequestNumber != null ? String(group.pullRequestNumber) : null)

								// Use the first completed task's previewUrl, or derive from PR number
								const latestPreviewTask = group.tasks.find(t => t.previewUrl && t.status === 'completed')
								const groupPreviewUrl = latestPreviewTask?.previewUrl
									?? (prNumber ? `${PREVIEW_BASE_URL}/pr-${prNumber}` : null)

								const isGroupMerged = mainPr ? mergedPrUrls.has(mainPr.url) : false
								const hasCompletedWithPr = group.tasks.some(t => t.status === 'completed') && prNumber != null
								const showPreviewButton = !isGroupMerged && hasCompletedWithPr && groupPreviewUrl != null

								// URL opened when clicking the group container
								const openUrl = isGroupMerged
									? null
									: groupPreviewUrl != null
										? groupPreviewUrl
										: (mainPr ? mainPr.url : null)

								const showGroupHeader = !!(group.branch || mainPr || isGroupMerged)

								return (
									<Box
										key={group.key}
										sx={{
											borderRadius: 2,
											border: '1px solid',
											borderColor: isGroupMerged
												? alpha(PURPLE, 0.2)
												: alpha('#000', 0.06),
											bgcolor: isGroupMerged
												? alpha(PURPLE, 0.06)
												: 'rgba(255,255,255,0.6)',
											overflow: 'hidden',
										}}
									>
										{/* Group header — shows branch/PR info + action buttons */}
										{showGroupHeader && (
											<Box
												sx={{
													display: 'flex',
													alignItems: 'center',
													gap: 1,
													px: 1.5,
													py: 0.75,
													borderBottom: `1px solid ${isGroupMerged ? alpha(PURPLE, 0.1) : alpha('#000', 0.06)}`,
													bgcolor: isGroupMerged ? alpha(PURPLE, 0.04) : alpha('#000', 0.02),
												}}
											>
												{/* Branch name + merged badge */}
												<Box sx={{ flex: 1, display: 'flex', gap: 0.75, alignItems: 'center', minWidth: 0 }}>
													{group.branch && (
														<Typography
															variant="normal"
															size="0.7rem"
															color="grey.500"
															sx={{
																fontFamily: 'monospace',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																whiteSpace: 'nowrap',
															}}
														>
															{group.branch}
														</Typography>
													)}
													{isGroupMerged && (
														<Box
															sx={{
																bgcolor: alpha(PURPLE, 0.12),
																color: PURPLE_DARK,
																px: 1,
																py: 0.25,
																borderRadius: 1,
																fontSize: '0.65rem',
																fontWeight: 600,
																whiteSpace: 'nowrap',
																flexShrink: 0,
															}}
														>
															{t('merged')}
														</Box>
													)}
												</Box>

												{/* Action buttons: Preview + PR link */}
												<Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
													{showPreviewButton && groupPreviewUrl && (
														<a
															href={groupPreviewUrl}
															target="_blank"
															rel="noopener noreferrer"
															title="Open preview"
															style={{ textDecoration: 'none' }}
															onClick={(e) => e.stopPropagation()}
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
																Preview
															</Box>
														</a>
													)}
													{mainPr && (
														<a
															href={mainPr.url}
															target="_blank"
															rel="noopener noreferrer"
															title="View GitHub PR"
															style={{ textDecoration: 'none' }}
															onClick={(e) => e.stopPropagation()}
														>
															<Box
																sx={{
																	display: 'flex',
																	alignItems: 'center',
																	gap: 0.4,
																	color: isGroupMerged ? PURPLE_DARK : '#666',
																	fontSize: '0.7rem',
																	fontWeight: 600,
																	bgcolor: isGroupMerged ? alpha(PURPLE, 0.08) : alpha('#000', 0.04),
																	border: '1px solid',
																	borderColor: isGroupMerged ? alpha(PURPLE, 0.2) : alpha('#000', 0.1),
																	px: 0.75,
																	py: 0.25,
																	borderRadius: 1,
																	whiteSpace: 'nowrap',
																	transition: 'background 0.15s',
																	'&:hover': {
																		bgcolor: isGroupMerged ? alpha(PURPLE, 0.15) : alpha('#000', 0.08),
																	},
																}}
															>
																<OpenInNew sx={{ fontSize: 11 }} />
																{prNumber ? `PR #${prNumber}` : 'PR'}
															</Box>
														</a>
													)}
												</Box>
											</Box>
										)}

										{/* Tasks within the group (iterations) */}
										<Box
											onClick={() => openUrl && window.open(openUrl, '_blank')}
											title={openUrl ? 'Open in new tab' : undefined}
											sx={{
												cursor: openUrl ? 'pointer' : 'default',
												'&:hover': openUrl ? {
													bgcolor: 'rgba(255,255,255,0.3)',
												} : undefined,
												transition: 'background 0.15s',
											}}
										>
											{group.tasks.map((task, idx) => {
												const style = STATUS_STYLE[task.status]
												const isCompletedNoPr = task.status === 'completed'
													&& !task.pullRequests?.length
													&& !task.pullRequestNumber

												return (
													<Box
														key={task.taskId}
														sx={{
															display: 'flex',
															alignItems: 'flex-start',
															gap: 1.5,
															p: 1.5,
															borderTop: idx > 0 ? `1px solid ${alpha('#000', 0.05)}` : 'none',
															opacity: isCompletedNoPr ? 0.55 : 1,
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
															{t(`status.${task.status}`)}
														</Box>

														{/* Prompt + no-PR notice */}
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
															{isCompletedNoPr && (
																<Typography
																	variant="normal"
																	size="0.72rem"
																	color="grey.400"
																	sx={{ display: 'block', mt: 0.5 }}
																>
																	{t('noPr')}
																</Typography>
															)}
														</Box>
													</Box>
												)
											})}
										</Box>
									</Box>
								)
							})}

							<Gap value={0.5} />
						</Box>
					</Box>
				)}
			</Box>
		</Popup>
	)
}
