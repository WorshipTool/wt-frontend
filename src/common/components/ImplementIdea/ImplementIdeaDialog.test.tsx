import '@testing-library/jest-dom'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import React from 'react'
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
	Box: ({ children, onClick, title, onKeyDown }: { children: React.ReactNode; onClick?: () => void; title?: string; onKeyDown?: React.KeyboardEventHandler }) => (
		<div onClick={onClick} title={title} onKeyDown={onKeyDown}>{children}</div>
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
		pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/42' }],
	},
]

const MOCK_TASK_WITH_DIRECT_PREVIEW_URL = {
	taskId: '4',
	status: 'completed',
	prompt: 'Add search feature',
	pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/55' }],
	previewUrl: 'https://direct-preview.example.com/pr-55',
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
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				json: () => Promise.resolve({ tasks: MOCK_TASKS }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)

			await waitFor(() => {
				// Mock returns 'recentIdeasTabActive:2' for t('recentIdeasTabActive', { count: 2 })
				expect(screen.getByText(/recentIdeasTabActive:2/)).toBeInTheDocument()
			})
		})

		it('does not show active count when no active tasks', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)

			await waitFor(() => {
				expect(screen.getByText('recentIdeasTab')).toBeInTheDocument()
			})
		})
	})

	describe('Recent ideas tab', () => {
		it('shows task list when switching to recent ideas tab', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
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
			;(global.fetch as jest.Mock).mockResolvedValue({
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

		it('shows preview link for completed task with PR using hardcoded preview URL', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
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
			// No NEXT_PUBLIC_PREVIEW_BASE_URL set — should still show preview via task.previewUrl
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASK_WITH_DIRECT_PREVIEW_URL] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const links = screen.getAllByRole('link')
			const hrefs = links.map(l => l.getAttribute('href'))
			expect(hrefs).toContain('https://direct-preview.example.com/pr-55')
			expect(screen.getByTitle('Open preview')).toBeInTheDocument()
		})

		it('prefers task.previewUrl over hardcoded-URL-generated preview URL', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASK_WITH_DIRECT_PREVIEW_URL] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
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
				pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/99' }],
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

		it('always generates preview URL from hardcoded base URL when task has PR', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const links = screen.queryAllByRole('link')
			const hrefs = links.map(l => l.getAttribute('href'))
			// Always generates preview URL using hardcoded base URL
			expect(hrefs).toContain('https://preview.chvalotce.cz/pr-42')
			expect(hrefs).toContain('https://github.com/org/repo/pull/42')
			expect(screen.getByTitle('Open preview')).toBeInTheDocument()
			expect(screen.getByTitle('View GitHub PR')).toBeInTheDocument()
		})

		it('shows preview link for completed task with no PR and direct previewUrl', async () => {
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

			const links = screen.getAllByRole('link')
			const hrefs = links.map(l => l.getAttribute('href'))
			expect(hrefs).toContain('https://dev.example.com/idea')
			expect(screen.getByTitle('Open preview')).toBeInTheDocument()
		})

		it('shows active preview link for completed task with no PR, falling back to base preview URL', async () => {
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

			// Preview button is always active for completed tasks, falls back to base URL
			expect(screen.getByTitle('Open preview')).toBeInTheDocument()
			const links = screen.getAllByRole('link')
			const hrefs = links.map(l => l.getAttribute('href'))
			expect(hrefs).toContain('https://preview.chvalotce.cz')
			expect(screen.queryByTitle('View GitHub PR')).not.toBeInTheDocument()
		})

		it('clicking a task card with previewUrl opens it in new tab', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const card = screen.getByTitle('Open in new tab')
			fireEvent.click(card)

			expect(window.open).toHaveBeenCalledWith('https://preview.chvalotce.cz/pr-42', '_blank')
		})

		it('clicking a task card with a PR opens the generated preview URL in new tab', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const card = screen.getByTitle('Open in new tab')
			fireEvent.click(card)

			// Uses hardcoded preview base URL to generate preview link
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
