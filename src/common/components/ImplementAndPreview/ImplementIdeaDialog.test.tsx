import '@testing-library/jest-dom'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import React from 'react'

// Must be set before module import — PREVIEW_BASE_URL is captured at load time
process.env.NEXT_PUBLIC_PREVIEW_BASE_URL = 'https://preview.chvalotce.cz'

import ImplementIdeaDialog from './ImplementIdeaDialog'

jest.mock('next-intl', () => ({
	useTranslations: () => {
		const t = (key: string, params?: Record<string, unknown>) => {
			if (params && typeof params.count !== 'undefined') {
				return `${key}:${params.count}`
			}
			if (params && typeof params.seconds !== 'undefined') {
				return `${key}:${params.seconds}`
			}
			return key
		}
		return t
	},
}))

jest.mock('notistack', () => ({
	useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

jest.mock('../Popup/Popup', () => ({
	__esModule: true,
	default: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
		open ? <div data-testid="popup">{children}</div> : null,
}))

jest.mock('../../ui', () => ({
	Box: ({ children, onClick, title, onKeyDown, role, 'aria-pressed': ariaPressed }: { children: React.ReactNode; onClick?: () => void; title?: string; onKeyDown?: React.KeyboardEventHandler; sx?: unknown; role?: string; 'aria-pressed'?: boolean }) => (
		<div onClick={onClick} title={title} onKeyDown={onKeyDown} role={role} aria-pressed={ariaPressed}>{children}</div>
	),
	Button: ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
		<button disabled={disabled}>{children}</button>
	),
	TextField: ({ disabled, onChange, value }: { disabled?: boolean; onChange?: (v: string) => void; value?: string }) => (
		<input data-testid="text-field" disabled={disabled} value={value} onChange={e => onChange?.(e.target.value)} />
	),
	IconButton: ({ children, onClick, 'aria-label': ariaLabel, title }: { children: React.ReactNode; onClick?: () => void; 'aria-label'?: string; title?: string }) => (
		<button onClick={onClick} aria-label={ariaLabel} title={title}>{children}</button>
	),
}))

jest.mock('../../ui/Typography', () => ({
	Typography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

jest.mock('../../ui/Gap', () => ({ Gap: () => null }))
jest.mock('../../ui/mui', () => ({
	alpha: () => 'rgba(0,0,0,0.1)',
	Tab: ({ label, onClick }: { label: React.ReactNode; onClick?: () => void }) => (
		<button role="tab" onClick={onClick}>{label}</button>
	),
	Tabs: ({ children, onChange }: { children: React.ReactNode; onChange?: (e: unknown, v: number) => void }) => (
		<div role="tablist">
			{React.Children.map(children as React.ReactElement[], (child, i) =>
				React.cloneElement(child, { onClick: () => onChange?.(null, i) })
			)}
		</div>
	),
}))

jest.mock('@mui/material', () => ({}))

jest.mock('@mui/icons-material', () => ({
	Lightbulb: () => null,
	Close: () => null,
	OpenInNew: () => <span>open</span>,
	Refresh: () => <span>refresh-icon</span>,
}))

const MOCK_URL = 'https://example.com/webhook'

const MOCK_TASKS = [
	{ taskId: '1', status: 'running', prompt: 'Add dark mode', pullRequests: [] },
	{ taskId: '2', status: 'queued', prompt: 'Fix login bug', pullRequests: [] },
	{
		taskId: '3',
		status: 'completed',
		prompt: 'Refactor auth service with better error handling and logging',
		pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/42', state: 'open' }],
		previewUrl: 'https://preview.chvalotce.cz/pr-42',
	},
]

const MOCK_TASK_WITH_DIRECT_PREVIEW_URL = {
	taskId: '4',
	status: 'completed',
	prompt: 'Add search feature',
	pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/55', state: 'open' }],
	previewUrl: 'https://direct-preview.example.com/pr-55',
}

// Helper: mock GitHub merge API to return "not merged" (404)
function mockGitHubNotMerged() {
	return jest.fn().mockResolvedValue({ status: 404 })
}

// Helper: mock GitHub merge API to return "merged" (204)
function mockGitHubMerged() {
	return jest.fn().mockResolvedValue({ status: 204 })
}

describe('ImplementIdeaDialog', () => {
	const defaultProps = { open: true, onClose: jest.fn() }

	beforeEach(() => {
		jest.clearAllMocks()
		global.fetch = jest.fn()
		window.open = jest.fn()
	})

	afterEach(() => {
		const env = process.env as Record<string, string | undefined>
		delete env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL
	})

	describe('Task counts display', () => {
		it('shows active count in tab label after fetching tasks', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: MOCK_TASKS }),
				})
				.mockResolvedValue({ status: 404 }) // GitHub API: not merged

			render(<ImplementIdeaDialog {...defaultProps} />)

			await waitFor(() => {
				// Mock returns 'recentIdeasTabActive:2' for t('recentIdeasTabActive', { count: 2 })
				expect(screen.getByText(/recentIdeasTabActive:2/)).toBeInTheDocument()
			})
		})

		it('does not show active count when no active tasks', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
				})
				.mockResolvedValue({ status: 404 }) // GitHub API: not merged

			render(<ImplementIdeaDialog {...defaultProps} />)

			await waitFor(() => {
				expect(screen.getByText('recentIdeasTab')).toBeInTheDocument()
			})
		})
	})

	describe('Recent ideas tab', () => {
		it('shows task list when switching to recent ideas tab', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValue({
					json: () => Promise.resolve({ tasks: MOCK_TASKS }),
				})

			render(<ImplementIdeaDialog {...defaultProps} />)

			await waitFor(() => screen.getByText(/recentIdeasTabActive/))

			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.getByText('Add dark mode')).toBeInTheDocument()
			expect(screen.getByText('Fix login bug')).toBeInTheDocument()
		})

		it('shows tasks in reversed order (newest first)', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValue({
					json: () => Promise.resolve({ tasks: MOCK_TASKS }),
				})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTabActive/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			const items = screen.getAllByText(/mode|bug|auth/i)
			expect(items[0]).toHaveTextContent(/auth/i)
		})

		it('truncates long prompts to 120 chars', async () => {
			const longPrompt = 'A'.repeat(130)
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({
					tasks: [{ taskId: '1', status: 'running', prompt: longPrompt, pullRequests: [] }],
				}),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTabActive/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.getByText('A'.repeat(120) + '…')).toBeInTheDocument()
		})

		it('shows empty state when no tasks', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.getByText('noIdeas')).toBeInTheDocument()
		})

		it('shows preview link for completed task with previewUrl (not merged)', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
				})
				.mockResolvedValue({ status: 404 }) // GitHub API: not merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const links = screen.getAllByRole('link')
			const hrefs = links.map(l => l.getAttribute('href'))
			expect(hrefs).toContain('https://preview.chvalotce.cz/pr-42')
			expect(hrefs).toContain('https://github.com/org/repo/pull/42')
			expect(screen.getByTitle('Open preview')).toBeInTheDocument()
			expect(screen.getByTitle('View GitHub PR')).toBeInTheDocument()
		})

		it('uses task.previewUrl directly when provided, ignoring env var', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			// task.previewUrl is used directly
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASK_WITH_DIRECT_PREVIEW_URL] }),
				})
				.mockResolvedValue({ status: 404 }) // GitHub API: not merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const links = screen.getAllByRole('link')
			const hrefs = links.map(l => l.getAttribute('href'))
			expect(hrefs).toContain('https://direct-preview.example.com/pr-55')
			expect(screen.getByTitle('Open preview')).toBeInTheDocument()
		})

		it('prefers task.previewUrl over hardcoded-URL-generated preview URL', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASK_WITH_DIRECT_PREVIEW_URL] }),
				})
				.mockResolvedValue({ status: 404 }) // GitHub API: not merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const links = screen.getAllByRole('link')
			const hrefs = links.map(l => l.getAttribute('href'))
			// Should use the direct URL, not the generated one
			expect(hrefs).toContain('https://direct-preview.example.com/pr-55')
			expect(hrefs).not.toContain('https://preview.chvalotce.cz/pr-55')
		})

		it('does not show preview link for non-completed tasks even when previewUrl is available', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const runningTaskWithPr = {
				taskId: '5',
				status: 'running',
				prompt: 'Work in progress',
				pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/99', state: 'open' }],
			}
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [runningTaskWithPr] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.queryByTitle('Open preview')).not.toBeInTheDocument()
			expect(screen.getByTitle('View GitHub PR')).toBeInTheDocument()
		})

		it('shows preview URL from task.previewUrl when task has PR (not merged)', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
				})
				.mockResolvedValue({ status: 404 }) // GitHub API: not merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const links = screen.queryAllByRole('link')
			const hrefs = links.map(l => l.getAttribute('href'))
			expect(hrefs).toContain('https://preview.chvalotce.cz/pr-42')
			expect(hrefs).toContain('https://github.com/org/repo/pull/42')
			expect(screen.getByTitle('Open preview')).toBeInTheDocument()
			expect(screen.getByTitle('View GitHub PR')).toBeInTheDocument()
		})

		it('does not show preview link for completed task with no PR even when previewUrl is set', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const completedNoPr = {
				taskId: '10',
				status: 'completed',
				prompt: 'Direct deploy idea',
				pullRequests: [],
				previewUrl: 'https://dev.example.com/idea',
			}
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [completedNoPr] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.queryByTitle('Open preview')).not.toBeInTheDocument()
			expect(screen.queryByTitle('View GitHub PR')).not.toBeInTheDocument()
		})

		it('does not show preview link for completed task with no PR and no previewUrl', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const completedNoUrl = {
				taskId: '11',
				status: 'completed',
				prompt: 'No URL idea',
				pullRequests: [],
			}
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [completedNoUrl] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			// Preview button requires a PR to be visible
			expect(screen.queryByTitle('Open preview')).not.toBeInTheDocument()
			expect(screen.queryByTitle('View GitHub PR')).not.toBeInTheDocument()
		})

		it('clicking a task card with previewUrl opens it in new tab', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
				})
				.mockResolvedValue({ status: 404 }) // GitHub API: not merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const card = screen.getByTitle('Open in new tab')
			fireEvent.click(card)

			expect(window.open).toHaveBeenCalledWith('https://preview.chvalotce.cz/pr-42', '_blank')
		})

		it('clicking a task card with previewUrl opens preview URL in new tab', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
				})
				.mockResolvedValue({ status: 404 }) // GitHub API: not merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const card = screen.getByTitle('Open in new tab')
			fireEvent.click(card)

			expect(window.open).toHaveBeenCalledWith('https://preview.chvalotce.cz/pr-42', '_blank')
		})

		it('task card without any URL has no title and does not trigger window.open', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[0]] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTabActive:1/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.queryByTitle('Open in new tab')).not.toBeInTheDocument()

			const promptEl = screen.getByText('Add dark mode')
			fireEvent.click(promptEl)

			expect(window.open).not.toHaveBeenCalled()
		})
	})

	describe('Completed task without PR', () => {
		it('shows noPr message for completed task without any PR', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const completedNoPr = {
				taskId: '20',
				status: 'completed',
				prompt: 'Completed without PR',
				pullRequests: [],
			}
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [completedNoPr] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.getByText('noPr')).toBeInTheDocument()
		})

		it('completed task without PR is not clickable', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const completedNoPr = {
				taskId: '21',
				status: 'completed',
				prompt: 'Completed no PR task',
				pullRequests: [],
			}
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [completedNoPr] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			// Card should not have "Open in new tab" title (no clickable URL)
			expect(screen.queryByTitle('Open in new tab')).not.toBeInTheDocument()

			// Clicking the prompt text should not call window.open
			const promptEl = screen.getByText('Completed no PR task')
			fireEvent.click(promptEl)
			expect(window.open).not.toHaveBeenCalled()
		})

		it('does not show noPr message for non-completed tasks without PR', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[0]] }), // running, no PR
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.queryByText('noPr')).not.toBeInTheDocument()
		})
	})

	describe('Merged PR behavior', () => {
		it('shows merged badge when PR is merged', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
				})
				.mockResolvedValueOnce({ status: 204 }) // GitHub API: merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.getByText('merged')).toBeInTheDocument()
		})

		it('does not show preview button when PR is merged', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const mergedPrTask = {
				...MOCK_TASKS[2],
				pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/42', state: 'merged' }],
			}
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [mergedPrTask] }),
				})
				.mockResolvedValue({ status: 204 }) // GitHub API: merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.queryByTitle('Open preview')).not.toBeInTheDocument()
		})

		it('does not show PR link button when PR state is not open', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const closedPrTask = {
				...MOCK_TASKS[2],
				pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/42', state: 'closed' }],
			}
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [closedPrTask] }),
				})
				.mockResolvedValue({ status: 404 })

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.queryByTitle('View GitHub PR')).not.toBeInTheDocument()
			expect(screen.queryByTitle('Open preview')).not.toBeInTheDocument()
		})

		it('merged task card is not clickable (no card click URL)', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
				})
				.mockResolvedValueOnce({ status: 204 }) // GitHub API: merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			// Card should not have "Open in new tab" title when merged
			expect(screen.queryByTitle('Open in new tab')).not.toBeInTheDocument()
		})

		it('does not show merged badge when PR is not merged', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
				})
				.mockResolvedValueOnce({ status: 404 }) // GitHub API: not merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.queryByText('merged')).not.toBeInTheDocument()
		})

		it('calls GitHub API to check merge status for completed tasks with PRs', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const fetchMock = jest.fn()
			global.fetch = fetchMock
			fetchMock
				.mockResolvedValueOnce({
					json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
				})
				.mockResolvedValue({ status: 404 })

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })

			// Should have called the main API and then the GitHub merge API
			expect(fetchMock).toHaveBeenCalledWith(
				'https://api.github.com/repos/org/repo/pulls/42/merge',
				expect.objectContaining({ method: 'GET' })
			)
		})

		it('does not call GitHub API for non-completed tasks', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const fetchMock = jest.fn()
			global.fetch = fetchMock
			fetchMock.mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[0]] }), // running, no PR
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })

			// Should only have called the main API
			expect(fetchMock).toHaveBeenCalledTimes(1)
			expect(fetchMock).toHaveBeenCalledWith(MOCK_URL, { method: 'GET' })
		})
	})

	describe('URL missing state', () => {
		it('shows error when NEXT_PUBLIC_IMPLEMENT_IDEA_URL is not set', () => {
			render(<ImplementIdeaDialog {...defaultProps} />)
			expect(
				screen.getByText('NEXT_PUBLIC_IMPLEMENT_IDEA_URL is not set')
			).toBeInTheDocument()
		})

		it('does not fetch tasks when URL is missing', () => {
			render(<ImplementIdeaDialog {...defaultProps} />)
			expect(global.fetch).not.toHaveBeenCalled()
		})
	})

	describe('Fetch behavior', () => {
		it('fetches tasks on open using GET method', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				json: () => Promise.resolve({ tasks: [] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(MOCK_URL, { method: 'GET' })
			})
		})

		it('does not fetch tasks when dialog is closed', () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			render(<ImplementIdeaDialog open={false} onClose={jest.fn()} />)
			expect(global.fetch).not.toHaveBeenCalled()
		})
	})

	describe('Refresh button and countdown', () => {
		it('shows countdown timer in recent ideas tab', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: MOCK_TASKS }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTabActive/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			// countdown renders as "nextRefreshIn:30" from our mock
			expect(screen.getByText(/nextRefreshIn:/)).toBeInTheDocument()
		})

		it('shows refresh button in recent ideas tab', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: MOCK_TASKS }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTabActive/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.getByLabelText('refreshButton')).toBeInTheDocument()
		})

		it('clicking refresh button triggers a new fetch', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: MOCK_TASKS }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTabActive/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			const fetchCountBefore = (global.fetch as jest.Mock).mock.calls.length
			fireEvent.click(screen.getByLabelText('refreshButton'))

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledTimes(fetchCountBefore + 1)
			})
		})

		it('countdown decrements over time', async () => {
			jest.useFakeTimers()
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await Promise.resolve() })
			fireEvent.click(screen.getAllByRole('tab')[1])

			// Initially shows 30s
			expect(screen.getByText('nextRefreshIn:30')).toBeInTheDocument()

			// After 5 seconds countdown decrements
			await act(async () => { jest.advanceTimersByTime(5_000) })
			expect(screen.getByText('nextRefreshIn:25')).toBeInTheDocument()

			jest.useRealTimers()
		})
	})

	describe('Polling behavior', () => {
		beforeEach(() => {
			jest.useFakeTimers()
		})

		afterEach(() => {
			jest.useRealTimers()
		})

		it('polls every 30 seconds while dialog is open', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)

			// Initial fetch on open
			await act(async () => { await Promise.resolve() })
			expect(global.fetch).toHaveBeenCalledTimes(1)

			// Advance 30 seconds — second poll
			await act(async () => { jest.advanceTimersByTime(30_000) })
			await act(async () => { await Promise.resolve() })
			expect(global.fetch).toHaveBeenCalledTimes(2)

			// Advance another 30 seconds — third poll
			await act(async () => { jest.advanceTimersByTime(30_000) })
			await act(async () => { await Promise.resolve() })
			expect(global.fetch).toHaveBeenCalledTimes(3)
		})

		it('stops polling when dialog is closed', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [] }),
			})

			const { rerender } = render(<ImplementIdeaDialog {...defaultProps} />)

			await act(async () => { await Promise.resolve() })
			expect(global.fetch).toHaveBeenCalledTimes(1)

			// Close the dialog
			rerender(<ImplementIdeaDialog open={false} onClose={jest.fn()} />)

			// Advance time — no additional fetches should happen
			await act(async () => { jest.advanceTimersByTime(60_000) })
			await act(async () => { await Promise.resolve() })
			expect(global.fetch).toHaveBeenCalledTimes(1)
		})

		it('does not poll when URL is missing', async () => {
			// No NEXT_PUBLIC_IMPLEMENT_IDEA_URL set
			render(<ImplementIdeaDialog {...defaultProps} />)

			await act(async () => { jest.advanceTimersByTime(30_000) })
			await act(async () => { await Promise.resolve() })
			expect(global.fetch).not.toHaveBeenCalled()
		})
	})

	describe('Chain deduplication', () => {
		const CHAIN_TASKS = [
			{ taskId: 'c1', status: 'completed', prompt: 'Original idea', chainId: 'chain-A', startedAt: '2025-01-01T10:00:00Z', completedAt: '2025-01-01T10:05:00Z', pullRequests: [] },
			{ taskId: 'c2', status: 'running', prompt: 'Follow-up change', chainId: 'chain-A', startedAt: '2025-01-02T10:00:00Z', completedAt: null, pullRequests: [] },
			{ taskId: 'c3', status: 'queued', prompt: 'Standalone task', pullRequests: [] },
		]

		it('shows only the oldest task per chain', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				json: () => Promise.resolve({ tasks: CHAIN_TASKS }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTabActive/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			// Shows the oldest task's prompt (Original idea), not the follow-up
			expect(screen.getByText('Original idea')).toBeInTheDocument()
			expect(screen.queryByText('Follow-up change')).not.toBeInTheDocument()
			// Standalone task without chainId is still shown
			expect(screen.getByText('Standalone task')).toBeInTheDocument()
		})

		it('displays the newest task status on the oldest task in a chain', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				json: () => Promise.resolve({ tasks: CHAIN_TASKS }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTabActive/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			// The displayed task shows "Original idea" but with "running" status (from newest task c2)
			expect(screen.getByText('Original idea')).toBeInTheDocument()
			expect(screen.getByText('running')).toBeInTheDocument()
			// The completed status of the oldest task should NOT be shown
			expect(screen.queryByText('completed')).not.toBeInTheDocument()
		})

		it('inherits PRs from newer tasks when oldest has none', async () => {
			const CHAIN_WITH_PR = [
				{ taskId: 'c1', status: 'failed', prompt: 'Original idea', chainId: 'chain-B', startedAt: '2025-01-01T10:00:00Z', completedAt: '2025-01-01T10:05:00Z', pullRequests: [] },
				{ taskId: 'c2', status: 'completed', prompt: 'Retry', chainId: 'chain-B', startedAt: '2025-01-02T10:00:00Z', completedAt: '2025-01-02T10:10:00Z', pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/99', state: 'open' }] },
			]
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({ json: () => Promise.resolve({ tasks: CHAIN_WITH_PR }) })
				.mockResolvedValue({ status: 404 }) // GitHub merge check

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTab/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			// The oldest task "Original idea" should have a PR link inherited from c2
			await waitFor(() => {
				expect(screen.getByText('Original idea')).toBeInTheDocument()
				expect(screen.getByTitle('View GitHub PR')).toBeInTheDocument()
			})
		})
	})

	describe('Title display', () => {
		it('shows task title when available instead of prompt', async () => {
			const TASKS_WITH_TITLE = [
				{ taskId: 't1', status: 'completed', prompt: 'Long original prompt', title: 'Short title', pullRequests: [] },
			]
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				json: () => Promise.resolve({ tasks: TASKS_WITH_TITLE }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTab/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.getByText('Short title')).toBeInTheDocument()
			expect(screen.queryByText('Long original prompt')).not.toBeInTheDocument()
		})

		it('falls back to prompt when title is not available', async () => {
			const TASKS_NO_TITLE = [
				{ taskId: 't2', status: 'running', prompt: 'My prompt text', pullRequests: [] },
			]
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				json: () => Promise.resolve({ tasks: TASKS_NO_TITLE }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await waitFor(() => screen.getByText(/recentIdeasTab/))
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.getByText('My prompt text')).toBeInTheDocument()
		})
	})

	describe('Open PR filter', () => {
		const TASKS_MIXED = [
			{
				taskId: 'f1',
				status: 'running',
				prompt: 'Running task no PR',
				pullRequests: [],
			},
			{
				taskId: 'f2',
				status: 'completed',
				prompt: 'Completed with open PR',
				pullRequests: [{ repo: 'r', url: 'https://github.com/org/repo/pull/10', state: 'open' }],
				previewUrl: 'https://preview.chvalotce.cz/pr-10',
			},
			{
				taskId: 'f3',
				status: 'completed',
				prompt: 'Completed with closed PR',
				pullRequests: [{ repo: 'r', url: 'https://github.com/org/repo/pull/11', state: 'closed' }],
			},
			{
				taskId: 'f4',
				status: 'completed',
				prompt: 'Completed no PR',
				pullRequests: [],
			},
		]

		it('shows filter toggle chip in recent ideas tab', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.getByText('filterActive')).toBeInTheDocument()
		})

		it('filter chip is inactive by default (aria-pressed=false)', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const filterBtn = screen.getByRole('button', { name: 'filterActive' })
			expect(filterBtn).toHaveAttribute('aria-pressed', 'false')
		})

		it('toggling filter activates it (aria-pressed=true)', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const filterBtn = screen.getByRole('button', { name: 'filterActive' })
			fireEvent.click(filterBtn)

			expect(filterBtn).toHaveAttribute('aria-pressed', 'true')
		})

		it('shows all tasks when filter is off', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({ json: () => Promise.resolve({ tasks: TASKS_MIXED }) })
				.mockResolvedValue({ status: 404 })

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			expect(screen.getByText('Running task no PR')).toBeInTheDocument()
			expect(screen.getByText('Completed with open PR')).toBeInTheDocument()
			expect(screen.getByText('Completed with closed PR')).toBeInTheDocument()
			expect(screen.getByText('Completed no PR')).toBeInTheDocument()
		})

		it('shows active tasks and tasks with open (non-merged) PRs when filter is on', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({ json: () => Promise.resolve({ tasks: TASKS_MIXED }) })
				.mockResolvedValue({ status: 404 }) // all PRs not merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const filterBtn = screen.getByRole('button', { name: 'filterActive' })
			fireEvent.click(filterBtn)

			// Active task (running) should be shown even without a PR
			expect(screen.getByText('Running task no PR')).toBeInTheDocument()
			// Task with open PR should also be shown
			expect(screen.getByText('Completed with open PR')).toBeInTheDocument()
			// Non-active tasks without open PRs should be hidden
			expect(screen.queryByText('Completed with closed PR')).not.toBeInTheDocument()
			expect(screen.queryByText('Completed no PR')).not.toBeInTheDocument()
		})

		it('shows noActiveOrOpenPr message when filter is on and no tasks are active or have open PRs', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			// Only completed/failed tasks with no open PRs — neither active nor open PR
			const inactiveTasks = [
				{ taskId: 'x1', status: 'completed', prompt: 'Done no PR', pullRequests: [] },
				{ taskId: 'x2', status: 'failed', prompt: 'Failed task', pullRequests: [] },
			]
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: inactiveTasks }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const filterBtn = screen.getByRole('button', { name: 'filterActive' })
			fireEvent.click(filterBtn)

			expect(screen.getByText('noActiveOrOpenPr')).toBeInTheDocument()
			expect(screen.queryByText('noIdeas')).not.toBeInTheDocument()
		})

		it('does not show noActiveOrOpenPr when total tasks is zero (shows noIdeas instead)', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const filterBtn = screen.getByRole('button', { name: 'filterActive' })
			fireEvent.click(filterBtn)

			expect(screen.getByText('noIdeas')).toBeInTheDocument()
			expect(screen.queryByText('noActiveOrOpenPr')).not.toBeInTheDocument()
		})

		it('shows queued and retrying tasks when filter is on (all active statuses)', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const activeTasks = [
				{ taskId: 'a1', status: 'queued', prompt: 'Queued task', pullRequests: [] },
				{ taskId: 'a2', status: 'retrying', prompt: 'Retrying task', pullRequests: [] },
				{ taskId: 'a3', status: 'interrupted', prompt: 'Interrupted task', pullRequests: [] },
			]
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: activeTasks }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const filterBtn = screen.getByRole('button', { name: 'filterActive' })
			fireEvent.click(filterBtn)

			// Active statuses should be shown
			expect(screen.getByText('Queued task')).toBeInTheDocument()
			expect(screen.getByText('Retrying task')).toBeInTheDocument()
			// Interrupted is not active
			expect(screen.queryByText('Interrupted task')).not.toBeInTheDocument()
		})

		it('excludes merged PRs from filtered results', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			const mergedPrTask = {
				taskId: 'm1',
				status: 'completed',
				prompt: 'Merged PR task',
				pullRequests: [{ repo: 'r', url: 'https://github.com/org/repo/pull/77', state: 'open' }],
				previewUrl: 'https://preview.chvalotce.cz/pr-77',
			}
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({ json: () => Promise.resolve({ tasks: [mergedPrTask] }) })
				.mockResolvedValue({ status: 204 }) // GitHub: merged

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const filterBtn = screen.getByRole('button', { name: 'filterActive' })
			fireEvent.click(filterBtn)

			// Merged task should be excluded from open PR filter
			expect(screen.queryByText('Merged PR task')).not.toBeInTheDocument()
			expect(screen.getByText('noActiveOrOpenPr')).toBeInTheDocument()
		})

		it('toggling filter off restores all tasks', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock)
				.mockResolvedValueOnce({ json: () => Promise.resolve({ tasks: TASKS_MIXED }) })
				.mockResolvedValue({ status: 404 })

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 100)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const filterBtn = screen.getByRole('button', { name: 'filterActive' })

			// Enable filter — non-active tasks without open PRs should be hidden
			fireEvent.click(filterBtn)
			expect(screen.queryByText('Completed with closed PR')).not.toBeInTheDocument()
			expect(screen.queryByText('Completed no PR')).not.toBeInTheDocument()

			// Disable filter — all tasks restored
			fireEvent.click(filterBtn)
			expect(screen.getByText('Running task no PR')).toBeInTheDocument()
			expect(screen.getByText('Completed with open PR')).toBeInTheDocument()
			expect(screen.getByText('Completed with closed PR')).toBeInTheDocument()
		})
	})

	describe('Ctrl+Enter submit', () => {
		it('shows Ctrl+Enter hint text in submit tab', () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)

			expect(screen.getByText('Ctrl+Enter to submit')).toBeInTheDocument()
		})

		it('submits on Ctrl+Enter keydown in textarea wrapper', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			// Use mockResolvedValue (not Once) so all GET and POST fetches resolve without error
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)

			// Wait for initial fetch to settle
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })

			// Type something in the text field — updates message state
			const textField = screen.getByTestId('text-field')
			fireEvent.change(textField, { target: { value: 'My great idea' } })

			// Fire Ctrl+Enter on the input — bubbles up to the Box wrapper's onKeyDown
			fireEvent.keyDown(textField, { key: 'Enter', ctrlKey: true })

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					MOCK_URL,
					expect.objectContaining({ method: 'POST' })
				)
			})
		})
	})
})
