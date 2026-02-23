'use client'

import Popup from '@/common/components/Popup/Popup'
import { Box, Button, IconButton, TextField } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha, Tab, Tabs } from '@/common/ui/mui'
import { keyframes } from '@emotion/react'
import { Close, Lightbulb, OpenInNew } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
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
	pullRequests: PullRequest[]
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

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string; label: string }> = {
	queued:      { bg: alpha('#888888', 0.1), color: '#666',    label: 'Queued'      },
	running:     { bg: alpha(BLUE, 0.12),     color: BLUE,      label: 'Running'     },
	retrying:    { bg: '#fff3e0',             color: '#e65100', label: 'Retrying'    },
	completed:   { bg: '#e8f5e9',             color: '#2e7d32', label: 'Completed'   },
	failed:      { bg: '#ffebee',             color: '#c62828', label: 'Failed'      },
	interrupted: { bg: alpha('#888888', 0.1), color: '#666',    label: 'Interrupted' },
}

function extractPrNumber(prUrl: string): string | null {
	const match = prUrl.match(/\/pull\/(\d+)$/)
	return match ? match[1] : null
}

function getPreviewUrl(prUrl: string): string | null {
	const base = process.env.NEXT_PUBLIC_PREVIEW_BASE_URL
	if (!base) return null
	const prNumber = extractPrNumber(prUrl)
	if (!prNumber) return null
	return `${base}/pr-${prNumber}`
}

export default function ImplementIdeaDialog({
	open,
	onClose,
}: ImplementIdeaDialogProps) {
	const [message, setMessage] = useState('')
	const [loading, setLoading] = useState(false)
	const [tasks, setTasks] = useState<Task[]>([])
	const [tasksLoaded, setTasksLoaded] = useState(false)
	const [activeTab, setActiveTab] = useState(0)
	const { enqueueSnackbar } = useSnackbar()

	const url = process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL
	const urlMissing = !url

	const fetchTasks = () => {
		if (!url) return
		fetch(url, { method: 'GET' })
			.then((res) => res.json())
			.then((data: { tasks: Task[] }) => {
				setTasks([...(data.tasks ?? [])].reverse())
				setTasksLoaded(true)
			})
			.catch(() => {
				setTasksLoaded(true)
			})
	}

	useEffect(() => {
		if (!open) return
		fetchTasks()
	}, [open])

	useEffect(() => {
		if (open && activeTab === 1) fetchTasks()
	}, [activeTab])

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
			enqueueSnackbar('Idea submitted!', { variant: 'success' })
			setMessage('')
			setActiveTab(1)
			fetchTasks()
		} catch {
			enqueueSnackbar('Failed to submit idea.', { variant: 'error' })
		} finally {
			setLoading(false)
		}
	}

	const inProgressCount = tasks.filter(
		(t) => t.status === 'running' || t.status === 'retrying'
	).length
	const queuedCount = tasks.filter((t) => t.status === 'queued').length

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
							Implement an idea
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
					<Tab label="Submit idea" />
					<Tab
						label={
							tasksLoaded && (inProgressCount > 0 || queuedCount > 0)
								? `Recent ideas (${inProgressCount + queuedCount} active)`
								: 'Recent ideas'
						}
					/>
				</Tabs>

				<Gap value={2} />

				{/* Tab 0 — Submit */}
				{activeTab === 0 && (
					<>
						<Typography variant="h4" strong sx={{ letterSpacing: '0.02em' }}>
							What would you like to build?
						</Typography>
						<Gap value={0.5} />
						<Typography variant="subtitle1" strong={300} color="grey.600">
							Describe your idea and it will be implemented automatically.
						</Typography>

						<Gap value={2} />

						<Box
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
								placeholder="Describe your idea..."
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

						<Gap value={2} />

						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<Button
								color="primarygradient"
								type="submit"
								loading={loading}
								disabled={!message.trim() || urlMissing}
								sx={{ borderRadius: 3, paddingX: 5, opacity: 0.9 }}
							>
								Submit idea
							</Button>
						</Box>

						<Gap value={1} />
					</>
				)}

				{/* Tab 1 — Recent ideas */}
				{activeTab === 1 && (
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
								Loading...
							</Typography>
						)}

						{tasksLoaded && tasks.length === 0 && (
							<Typography variant="normal" size="0.85rem" color="grey.500" align="center">
								No ideas submitted yet.
							</Typography>
						)}

						{tasks.map((task) => {
							const style = STATUS_STYLE[task.status]
							const pr = task.pullRequests?.[0]
							const previewUrl = pr ? getPreviewUrl(pr.url) : null

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
											flexShrink: 0,
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
										{style.label}
									</Box>

									{/* Prompt */}
									<Typography
										variant="normal"
										size="0.82rem"
										color="grey.800"
										sx={{ flex: 1, lineHeight: 1.4 }}
									>
										{task.prompt?.length > 120
											? task.prompt.slice(0, 120) + '…'
											: task.prompt}
									</Typography>

									{/* Action buttons */}
									{pr && (
										<Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
											{previewUrl && (
												<a
													href={previewUrl}
													target="_blank"
													rel="noopener noreferrer"
													title="Open preview"
													style={{ display: 'flex', alignItems: 'center' }}
												>
													<OpenInNew sx={{ fontSize: 16, color: BLUE }} />
												</a>
											)}
											<a
												href={pr.url}
												target="_blank"
												rel="noopener noreferrer"
												title="View GitHub PR"
												style={{ display: 'flex', alignItems: 'center' }}
											>
												<OpenInNew sx={{ fontSize: 14, color: '#666' }} />
											</a>
										</Box>
									)}
								</Box>
							)
						})}

						<Gap value={0.5} />
					</Box>
				)}
			</Box>
		</Popup>
	)
}
