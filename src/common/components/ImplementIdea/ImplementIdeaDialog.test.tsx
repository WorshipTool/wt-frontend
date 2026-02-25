import '@testing-library/jest-dom'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import React from 'react'
import ImplementIdeaDialog from './ImplementIdeaDialog'

jest.mock('notistack', () => ({
	useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

jest.mock('../Popup/Popup', () => ({
	__esModule: true,
	default: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
		open ? <div data-testid="popup">{children}</div> : null,
}))

jest.mock('../../ui', () => ({
	Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	Button: ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
		<button disabled={disabled}>{children}</button>
	),
	TextField: ({ disabled }: { disabled?: boolean }) => (
		<input data-testid="text-field" disabled={disabled} />
	),
	IconButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
		<button onClick={onClick}>{children}</button>
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
	})

	afterEach(() => {
		delete process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL
		delete process.env.NEXT_PUBLIC_PREVIEW_BASE_URL
	})

	describe('Task counts display', () => {
		it('shows active count in tab label after fetching tasks', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				json: () => Promise.resolve({ tasks: MOCK_TASKS }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)

			await waitFor(() => {
				expect(screen.getByText(/2 active/)).toBeInTheDocument()
			})
		})

		it('does not show active count when no active tasks', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValueOnce({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)

			await waitFor(() => {
				expect(screen.getByText('Recent ideas')).toBeInTheDocument()
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

			await waitFor(() => screen.getByText(/2 active/))

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
			await waitFor(() => screen.getByText(/2 active/))
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
			await waitFor(() => screen.getByText(/1 active/))
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

			expect(screen.getByText('No ideas submitted yet.')).toBeInTheDocument()
		})

		it('shows preview link when NEXT_PUBLIC_PREVIEW_BASE_URL is set and task has PR', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			process.env.NEXT_PUBLIC_PREVIEW_BASE_URL = 'https://preview.example.com'
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const links = screen.getAllByRole('link')
			const hrefs = links.map(l => l.getAttribute('href'))
			expect(hrefs).toContain('https://preview.example.com/pr-42')
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

		it('prefers task.previewUrl over env-var-generated preview URL', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			process.env.NEXT_PUBLIC_PREVIEW_BASE_URL = 'https://preview.example.com'
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
			expect(hrefs).not.toContain('https://preview.example.com/pr-55')
		})

		it('does not show preview link for non-completed tasks even when previewUrl is available', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			process.env.NEXT_PUBLIC_PREVIEW_BASE_URL = 'https://preview.example.com'
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

		it('does not show preview link when NEXT_PUBLIC_PREVIEW_BASE_URL is not set', async () => {
			process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_URL
			;(global.fetch as jest.Mock).mockResolvedValue({
				json: () => Promise.resolve({ tasks: [MOCK_TASKS[2]] }),
			})

			render(<ImplementIdeaDialog {...defaultProps} />)
			await act(async () => { await new Promise(r => setTimeout(r, 50)) })
			fireEvent.click(screen.getAllByRole('tab')[1])

			const links = screen.queryAllByRole('link')
			const hrefs = links.map(l => l.getAttribute('href'))
			expect(hrefs).not.toContain(expect.stringContaining('preview.example.com'))
			expect(hrefs).toContain('https://github.com/org/repo/pull/42')
			expect(screen.queryByTitle('Open preview')).not.toBeInTheDocument()
			expect(screen.getByTitle('View GitHub PR')).toBeInTheDocument()
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
})
