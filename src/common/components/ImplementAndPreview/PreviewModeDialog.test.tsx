import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'
import PreviewModeDialog, { findPreviewContext } from './PreviewModeDialog'

let mockPrNumber: string | null = '42'

jest.mock('../../../tech/preview/previewMode', () => ({
	getPreviewPrNumber: () => mockPrNumber,
}))

const MOCK_IMPLEMENT_URL = 'http://localhost:4000/api/tasks'

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

jest.mock('../Popup/Popup', () => ({
	__esModule: true,
	default: ({ children, open, onSubmit }: { children: React.ReactNode; open: boolean; onSubmit?: () => void }) =>
		open ? <div data-testid="popup" onSubmit={onSubmit as any}>{children}</div> : null,
}))

jest.mock('notistack', () => ({
	useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

jest.mock('../../ui', () => ({
	Box: ({ children, onClick, sx, onKeyDown, 'data-testid': testId }: { children: React.ReactNode; onClick?: () => void; sx?: unknown; onKeyDown?: React.KeyboardEventHandler; 'data-testid'?: string }) => (
		<div onClick={onClick} onKeyDown={onKeyDown} data-testid={testId}>{children}</div>
	),
	Button: ({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void }) => (
		<button disabled={disabled} onClick={onClick}>{children}</button>
	),
	CircularProgress: () => <div data-testid="loading-spinner" />,
	TextField: ({ value, onChange, placeholder, disabled }: { value?: string; onChange?: (v: string) => void; placeholder?: string; disabled?: boolean }) => (
		<textarea
			data-testid="update-textarea"
			value={value}
			placeholder={placeholder}
			disabled={disabled}
			onChange={e => onChange?.(e.target.value)}
		/>
	),
	IconButton: ({ children, onClick, 'aria-label': ariaLabel, disabled }: { children: React.ReactNode; onClick?: () => void; 'aria-label'?: string; disabled?: boolean }) => (
		<button onClick={onClick} aria-label={ariaLabel} disabled={disabled}>{children}</button>
	),
}))

jest.mock('../../ui/Typography', () => ({
	Typography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

jest.mock('../../ui/Gap', () => ({ Gap: () => null }))

jest.mock('../../ui/mui', () => ({
	alpha: () => 'rgba(0,0,0,0.1)',
}))

jest.mock('@mui/icons-material', () => ({
	Close: () => null,
	OpenInNew: () => <span>open-icon</span>,
	Refresh: () => <span>refresh-icon</span>,
	Visibility: () => null,
}))

type MockTask = {
	taskId: string
	status: string
	prompt: string
	title?: string
	parentTaskId: string | null
	chainId: string
	startedAt: string
	completedAt: string | null
	pullRequests: { repo: string; url: string }[] | null
}

const MATCHING_TASK: MockTask = {
	taskId: 'task-1',
	status: 'completed',
	prompt: 'Initial feature',
	title: 'Initial feature',
	parentTaskId: null,
	chainId: 'chain-A',
	startedAt: '2026-03-01T10:00:00Z',
	completedAt: '2026-03-01T10:05:00Z',
	pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/42' }],
}

function mockFetchWithTasks(tasks = [MATCHING_TASK]) {
	global.fetch = jest.fn().mockResolvedValue({
		json: () => Promise.resolve({ tasks }),
	})
}

describe('PreviewModeDialog', () => {
	const defaultProps = { open: true, onClose: jest.fn() }

	beforeEach(() => {
		process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = 'http://test-api/tasks'
		jest.clearAllMocks()
		jest.useFakeTimers()
		process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = MOCK_IMPLEMENT_URL
		mockFetchWithTasks()
	})

	afterAll(() => {
		delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_IMPLEMENT_IDEA_URL
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	it('shows loading spinner initially', () => {
		render(<PreviewModeDialog {...defaultProps} />)
		expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
	})

	it('shows no-chain message when no matching tasks', async () => {
		mockFetchWithTasks([])
		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})
		expect(screen.getByText('noChainFound')).toBeInTheDocument()
	})

	it('shows textarea and history together after loading', async () => {
		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})
		expect(screen.getByTestId('update-textarea')).toBeInTheDocument()
		expect(screen.getByText('Initial feature')).toBeInTheDocument()
	})

	it('submit button is disabled when message is empty', async () => {
		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})
		const button = screen.getByRole('button', { name: 'submitButton' })
		expect(button).toBeDisabled()
	})

	it('submit button is enabled when message has text', async () => {
		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})
		const textarea = screen.getByTestId('update-textarea')
		fireEvent.change(textarea, { target: { value: 'Fix the colors' } })
		const button = screen.getByRole('button', { name: 'submitButton' })
		expect(button).not.toBeDisabled()
	})

	it('shows PR link button when chain has a matching PR', async () => {
		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})
		const prLink = screen.getByRole('link')
		expect(prLink).toHaveAttribute('href', 'https://github.com/org/repo/pull/42')
		expect(prLink).toHaveAttribute('target', '_blank')
		expect(screen.getByText('PR')).toBeInTheDocument()
	})

	it('does not show PR link when no matching PR exists', async () => {
		const taskWithoutPr = { ...MATCHING_TASK, pullRequests: [] }
		mockFetchWithTasks([taskWithoutPr])
		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})
		expect(screen.queryByRole('link')).not.toBeInTheDocument()
	})

	it('shows refresh button alongside history', async () => {
		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})
		expect(screen.getByRole('button', { name: 'refreshHistory' })).toBeInTheDocument()
	})

	it('calls onClose when close button is clicked', async () => {
		const onClose = jest.fn()
		await act(async () => {
			render(<PreviewModeDialog open={true} onClose={onClose} />)
		})
		const buttons = screen.getAllByRole('button')
		const closeButton = buttons.find(b =>
			!['submitButton', 'refresh-icon'].includes(b.textContent ?? '') && b.getAttribute('aria-label') !== 'refreshHistory'
		)
		expect(closeButton).toBeDefined()
		if (closeButton) fireEvent.click(closeButton)
		expect(onClose).toHaveBeenCalled()
	})

	it('does not render when closed', () => {
		render(<PreviewModeDialog open={false} onClose={jest.fn()} />)
		expect(screen.queryByTestId('popup')).not.toBeInTheDocument()
	})

	it('textarea accepts input', async () => {
		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})
		const textarea = screen.getByTestId('update-textarea')
		fireEvent.change(textarea, { target: { value: 'Change the header color' } })
		expect((textarea as HTMLTextAreaElement).value).toBe('Change the header color')
	})

	it('shows all chain tasks in history section', async () => {
		mockFetchWithTasks([
			MATCHING_TASK,
			{
				taskId: 'task-2',
				status: 'running',
				prompt: 'Fix dark mode colors',
				title: 'Fix dark mode color palette',
				parentTaskId: 'task-1',
				chainId: 'chain-A',
				startedAt: '2026-03-02T10:00:00Z',
				completedAt: null,
				pullRequests: null,
			},
		])

		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})

		expect(screen.getByText('Initial feature')).toBeInTheDocument()
		expect(screen.getByText('Fix dark mode color palette')).toBeInTheDocument()
	})

	it('shows busy indicator instead of textarea when a task is running', async () => {
		mockFetchWithTasks([
			{
				...MATCHING_TASK,
				taskId: 'task-2',
				status: 'running',
				parentTaskId: 'task-1',
				startedAt: '2026-03-02T10:00:00Z',
				completedAt: null,
			},
			MATCHING_TASK,
		])

		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})

		expect(screen.getByTestId('busy-indicator')).toBeInTheDocument()
		expect(screen.getByText('taskRunning')).toBeInTheDocument()
		expect(screen.queryByTestId('update-textarea')).not.toBeInTheDocument()
	})

	it('shows textarea when no task is running', async () => {
		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})

		expect(screen.queryByTestId('busy-indicator')).not.toBeInTheDocument()
		expect(screen.getByTestId('update-textarea')).toBeInTheDocument()
	})

	it('shows spinner in running task status chip', async () => {
		mockFetchWithTasks([
			{
				...MATCHING_TASK,
				taskId: 'task-2',
				status: 'running',
				parentTaskId: 'task-1',
				startedAt: '2026-03-02T10:00:00Z',
				completedAt: null,
			},
			MATCHING_TASK,
		])

		await act(async () => {
			render(<PreviewModeDialog {...defaultProps} />)
		})

		const spinners = screen.getAllByTestId('loading-spinner')
		expect(spinners.length).toBeGreaterThanOrEqual(1)
	})
})

describe('findPreviewContext', () => {
	const baseTasks = [
		{
			taskId: 'task-1',
			status: 'completed',
			prompt: 'Initial feature',
			parentTaskId: null,
			chainId: 'chain-A',
			startedAt: '2026-03-01T10:00:00Z',
			completedAt: '2026-03-01T10:05:00Z',
			pullRequests: [{ repo: 'my-repo', url: 'https://github.com/org/repo/pull/42' }],
		},
		{
			taskId: 'task-2',
			status: 'completed',
			prompt: 'Follow-up fix',
			parentTaskId: 'task-1',
			chainId: 'chain-A',
			startedAt: '2026-03-02T10:00:00Z',
			completedAt: '2026-03-02T10:05:00Z',
			pullRequests: null,
		},
		{
			taskId: 'task-3',
			status: 'completed',
			prompt: 'Unrelated task',
			parentTaskId: null,
			chainId: 'chain-B',
			startedAt: '2026-03-01T12:00:00Z',
			completedAt: '2026-03-01T12:05:00Z',
			pullRequests: [{ repo: 'other-repo', url: 'https://github.com/org/repo/pull/99' }],
		},
	]

	it('finds context by matching PR number', () => {
		const ctx = findPreviewContext(baseTasks, '42')
		expect(ctx).toEqual({ chainId: 'chain-A', lastTaskId: 'task-2' })
	})

	it('returns the latest task in the chain as lastTaskId', () => {
		const ctx = findPreviewContext(baseTasks, '42')
		expect(ctx?.lastTaskId).toBe('task-2')
	})

	it('returns null when no PR matches', () => {
		const ctx = findPreviewContext(baseTasks, '999')
		expect(ctx).toBeNull()
	})

	it('returns null for empty tasks array', () => {
		const ctx = findPreviewContext([], '42')
		expect(ctx).toBeNull()
	})

	it('works when matching task is the only one in chain', () => {
		const ctx = findPreviewContext(baseTasks, '99')
		expect(ctx).toEqual({ chainId: 'chain-B', lastTaskId: 'task-3' })
	})
})
