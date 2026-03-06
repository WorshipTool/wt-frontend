'use client'

import Popup from '@/common/components/Popup/Popup'
import { Box, Button, IconButton, TextField } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha, Tab, Tabs } from '@/common/ui/mui'
import { Close, Lightbulb, OpenInNew, Refresh } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import {
	BLUE,
	BLUE_DARK,
	PURPLE,
	PURPLE_DARK,
	STATUS_STYLE,
	bgMove,
	extractPrNumber,
	type PullRequest,
	type TaskStatus,
} from './shared'

type Task = {
	taskId: string
	status: TaskStatus
	prompt: string
	title?: string
	chainId?: string
	startedAt?: string
	completedAt?: string | null
	pullRequests: PullRequest[] | null
	previewUrl?: string
	/** When chain-deduped, holds the newest task's status */
	displayStatus?: TaskStatus
}

type ImplementIdeaDialogProps = {
	open: boolean
	onClose: () => void
}

const PREVIEW_BASE_URL = process.env.NEXT_PUBLIC_PREVIEW_BASE_URL

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
	const [filterOpenPr, setFilterOpenPr] = useState(false)
	const { enqueueSnackbar } = useSnackbar()

	const url = process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL
	const urlMissing = !url

	const fetchTasks = async () => {
		if (!url) return
		try {
			const res = await fetch(url, { method: 'GET' })
			const data: { tasks: Task[] } = await res.json()
			const rawTasks = [...(data.tasks ?? [])].reverse()
			// Pick the oldest (original) task per chain, but use the newest task's status
			const oldestByChain = new Map<string, Task>()
			const newestByChain = new Map<string, Task>()
			for (const task of rawTasks) {
				if (!task.chainId) continue
				const curTime = new Date(task.startedAt ?? task.completedAt ?? 0).getTime()

				const prevOldest = oldestByChain.get(task.chainId)
				if (!prevOldest) {
					oldestByChain.set(task.chainId, task)
				} else {
					const prevTime = new Date(prevOldest.startedAt ?? prevOldest.completedAt ?? 0).getTime()
					if (curTime < prevTime) {
						oldestByChain.set(task.chainId, task)
					}
				}

				const prevNewest = newestByChain.get(task.chainId)
				if (!prevNewest) {
					newestByChain.set(task.chainId, task)
				} else {
					const prevTime = new Date(prevNewest.startedAt ?? prevNewest.completedAt ?? 0).getTime()
					if (curTime > prevTime) {
						newestByChain.set(task.chainId, task)
					}
				}
			}
			// Enrich oldest task with data from the chain
			for (const [chainId, oldest] of oldestByChain) {
				const newest = newestByChain.get(chainId)
				if (newest && newest !== oldest) {
					oldest.displayStatus = newest.status
				}
				// Inherit PRs/previewUrl from newest task that has them
				if (!oldest.pullRequests?.length) {
					const withPr = rawTasks
						.filter((t) => t.chainId === chainId && t.pullRequests?.length)
						.sort((a, b) =>
							new Date(b.startedAt ?? b.completedAt ?? 0).getTime() -
							new Date(a.startedAt ?? a.completedAt ?? 0).getTime()
						)[0]
					if (withPr) {
						oldest.pullRequests = withPr.pullRequests
						oldest.previewUrl = oldest.previewUrl ?? withPr.previewUrl
					}
				}
			}
			const newTasks = rawTasks.filter((task) => {
				if (!task.chainId) return true
				return oldestByChain.get(task.chainId) === task
			})
			setTasks(newTasks)
			setTasksLoaded(true)

			// Check merge status for completed tasks with PRs
			const completedWithPr = newTasks.filter(
				(task) => (task.displayStatus ?? task.status) === 'completed' && (task.pullRequests?.length ?? 0) > 0
			)
			if (completedWithPr.length > 0) {
				const checks = await Promise.all(
					completedWithPr.map(async (task) => {
						const pr = task.pullRequests![0]
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

	const ACTIVE_STATUSES: TaskStatus[] = ['running', 'starting', 'retrying']
	const inProgressCount = tasks.filter(
		(t) => ACTIVE_STATUSES.includes((t.displayStatus ?? t.status) as TaskStatus)
	).length
	const queuedCount = tasks.filter((t) => (t.displayStatus ?? t.status) === 'queued').length

	const displayedTasks = filterOpenPr
		? tasks.filter((task) => {
				const pr = task.pullRequests?.[0]
				return pr && pr.state === 'open' && !mergedPrUrls.has(pr.url)
		  })
		: tasks

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

				{/* Tab 1 — Recent ideas */}
				{activeTab === 1 && (
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 1,
						}}
					>
						{/* Toolbar: filter + refresh */}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								gap: 1,
								mb: 0.25,
							}}
						>
							{/* Filter toggle chip */}
							<Box
								onClick={() => setFilterOpenPr((v) => !v)}
								aria-pressed={filterOpenPr}
								role="button"
								sx={{
									display: 'inline-flex',
									alignItems: 'center',
									cursor: 'pointer',
									px: 1,
									py: 0.3,
									borderRadius: 1.5,
									fontSize: '0.72rem',
									fontWeight: 600,
									border: '1px solid',
									bgcolor: filterOpenPr ? alpha(BLUE, 0.12) : 'transparent',
									borderColor: filterOpenPr ? alpha(BLUE, 0.3) : alpha('#000', 0.12),
									color: filterOpenPr ? BLUE : 'grey.500',
									transition: 'all 0.15s',
									userSelect: 'none',
									'&:hover': {
										borderColor: alpha(BLUE, 0.3),
										bgcolor: filterOpenPr ? alpha(BLUE, 0.16) : alpha(BLUE, 0.04),
									},
								}}
							>
								{t('filterOpenPr')}
							</Box>

							{/* Countdown + refresh */}
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

							{tasksLoaded && tasks.length > 0 && displayedTasks.length === 0 && (
								<Typography variant="normal" size="0.85rem" color="grey.500" align="center">
									{t('noIdeasWithOpenPr')}
								</Typography>
							)}

							{displayedTasks.map((task) => {
							const effectiveStatus = task.displayStatus ?? task.status
							const style = STATUS_STYLE[effectiveStatus]
							const pr = task.pullRequests?.[0]
							const prNumber = pr ? extractPrNumber(pr.url) : null
							const previewUrl = task.previewUrl ?? (PREVIEW_BASE_URL && prNumber ? `${PREVIEW_BASE_URL}/pr-${prNumber}` : null)

							const isCompletedNoPr = effectiveStatus === 'completed' && !pr
							const isMerged = effectiveStatus === 'completed' && !!pr && mergedPrUrls.has(pr.url)
							const isDisabled = isCompletedNoPr || isMerged

							// Preview URL is only valid for non-merged tasks
							const openUrl = isDisabled
								? null
								: effectiveStatus === 'completed'
									? (previewUrl ?? null)
									: (previewUrl ?? pr?.url ?? null)

							return (
								<Box
									key={task.taskId}
									onClick={() => openUrl && window.open(openUrl, '_blank')}
									title={openUrl ? 'Open in new tab' : undefined}
									sx={{
										display: 'flex',
										alignItems: 'flex-start',
										gap: 1.5,
										p: 1.5,
										borderRadius: 2,
										bgcolor: isMerged
											? alpha(PURPLE, 0.06)
											: isCompletedNoPr
												? alpha('#000', 0.03)
												: 'rgba(255,255,255,0.6)',
										border: '1px solid',
										borderColor: isMerged
											? alpha(PURPLE, 0.2)
											: alpha('#000', 0.06),
										opacity: isCompletedNoPr ? 0.55 : 1,
										cursor: openUrl ? 'pointer' : 'default',
										transition: 'background 0.15s, border-color 0.15s',
										'&:hover': openUrl ? {
											bgcolor: 'rgba(255,255,255,0.9)',
											borderColor: alpha(BLUE, 0.25),
										} : undefined,
									}}
								>
									{/* Status chip + merged badge */}
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
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
											}}
										>
											{effectiveStatus}
										</Box>
										{isMerged && (
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
												}}
											>
												{t('merged')}
											</Box>
										)}
									</Box>

									{/* Prompt + no-PR notice */}
									<Box sx={{ flex: 1 }}>
										<Typography
											variant="normal"
											size="0.82rem"
											color="grey.800"
											sx={{ lineHeight: 1.4 }}
										>
											{(() => {
												const text = task.title ?? task.prompt
												return text?.length > 120 ? text.slice(0, 120) + '…' : text
											})()}
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

									{/* Action buttons */}
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0, alignItems: 'flex-end' }}>
										{effectiveStatus === 'completed' && pr && pr.state === 'open' && (
											<a
												href={openUrl!}
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
										{pr && pr.state === 'open' && (
											<a
												href={pr.url}
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
														color: isMerged ? PURPLE_DARK : '#666',
														fontSize: '0.7rem',
														fontWeight: 600,
														bgcolor: isMerged ? alpha(PURPLE, 0.08) : alpha('#000', 0.04),
														border: '1px solid',
														borderColor: isMerged ? alpha(PURPLE, 0.2) : alpha('#000', 0.1),
														px: 0.75,
														py: 0.25,
														borderRadius: 1,
														whiteSpace: 'nowrap',
														transition: 'background 0.15s',
														'&:hover': { bgcolor: isMerged ? alpha(PURPLE, 0.15) : alpha('#000', 0.08) },
													}}
												>
													<OpenInNew sx={{ fontSize: 11 }} />
													PR
												</Box>
											</a>
										)}
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
