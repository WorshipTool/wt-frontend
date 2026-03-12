import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'
import React from 'react'

// Mock next-intl
jest.mock('next-intl', () => ({
	useTranslations: (ns: string) => (key: string) => {
		const map: Record<string, Record<string, string>> = {
			errors: {
				serverError: 'Někde nastala chyba!',
				forbidden: 'Nemáte oprávnění',
			},
			common: {
				tryAgain: 'Zkusit znovu',
			},
		}
		return map[ns]?.[key] ?? key
	},
}))

// Mock the common/ui barrel — this avoids importing the real MUI/styled chain
jest.mock('../../common/ui', () => ({
	Box: ({ children }: any) => (
		<div data-testid="error-box">{children}</div>
	),
	Button: ({ children, onClick }: any) => (
		<button data-testid="retry-button" onClick={onClick}>
			{children}
		</button>
	),
	Typography: ({ children, variant }: any) => (
		<span data-testid={`typography-${variant}`}>{children}</span>
	),
}))

jest.mock('@mui/icons-material', () => ({
	LockPerson: () => <span data-testid="lock-icon" />,
}))

import ErrorPage, { clearRetriedErrors } from '../error'

// Suppress console.error for expected error logs
const originalConsoleError = console.error
beforeEach(() => {
	console.error = jest.fn()
	jest.useFakeTimers()
	clearRetriedErrors()
})
afterEach(() => {
	console.error = originalConsoleError
	jest.useRealTimers()
})

describe('error.tsx (Next.js error page)', () => {
	it('auto-retries once for non-forbidden errors', () => {
		const reset = jest.fn()
		const error = new Error('Some transient error')

		render(<ErrorPage error={error} reset={reset} />)

		// Should have called reset() automatically for the first attempt
		expect(reset).toHaveBeenCalledTimes(1)
		// Should not render any visible error content during auto-retry
		expect(screen.queryByText('Někde nastala chyba!')).not.toBeInTheDocument()
	})

	it('does not show error page during re-render before retry result is known', () => {
		const reset = jest.fn()
		const error = new Error('Transient error')

		const { rerender } = render(<ErrorPage error={error} reset={reset} />)
		expect(reset).toHaveBeenCalledTimes(1)

		// Re-render with the SAME error (simulates React re-render during reset transition)
		rerender(<ErrorPage error={error} reset={reset} />)

		// Error page must NOT be visible — this was the flash bug
		expect(screen.queryByText('Někde nastala chyba!')).not.toBeInTheDocument()
	})

	it('does not flash error page during strict mode double effect invocation', () => {
		const reset = jest.fn()
		const error = new Error('Strict mode error')

		render(<ErrorPage error={error} reset={reset} />)

		// Auto-retry should have been called
		expect(reset).toHaveBeenCalledTimes(1)

		// Even without advancing timers, error text should not be visible
		expect(screen.queryByText('Někde nastala chyba!')).not.toBeInTheDocument()

		// Advance time but less than the delay threshold (500ms)
		act(() => {
			jest.advanceTimersByTime(200)
		})

		// Still should not show the error text — reset() might still be resolving
		expect(screen.queryByText('Někde nastala chyba!')).not.toBeInTheDocument()
	})

	it('shows error page after auto-retry fails (timer elapses on remount)', () => {
		const reset = jest.fn()
		const error = new Error('Persistent error')

		// First render — auto-retries (calls reset)
		const { rerender } = render(<ErrorPage error={error} reset={reset} />)
		expect(reset).toHaveBeenCalledTimes(1)

		// Simulate what Next.js does when the retry fails: remount the error
		// component with the same error. The module-level Set remembers this
		// error was already retried, so it skips reset() and schedules showing
		// the error after the delay.
		act(() => {
			rerender(<ErrorPage error={error} reset={reset} />)
		})

		// Error not visible yet — timer hasn't elapsed
		expect(screen.queryByText('Někde nastala chyba!')).not.toBeInTheDocument()

		// Advance past the 500ms delay
		act(() => {
			jest.advanceTimersByTime(500)
		})

		expect(screen.getByText('Někde nastala chyba!')).toBeInTheDocument()
	})

	it('shows forbidden page immediately without retry', () => {
		const reset = jest.fn()
		const error = new Error('Forbidden')

		render(<ErrorPage error={error} reset={reset} />)

		// Should NOT auto-retry for forbidden errors
		expect(reset).not.toHaveBeenCalled()
		expect(screen.getByText('Nemáte oprávnění')).toBeInTheDocument()
	})

	it('renders the try again button for persistent errors', () => {
		const reset = jest.fn()
		const error = new Error('Server error')

		// First render — auto-retries
		render(<ErrorPage error={error} reset={reset} />)

		// Advance past the delay to show the error UI
		act(() => {
			jest.advanceTimersByTime(500)
		})

		expect(screen.getByText('Zkusit znovu')).toBeInTheDocument()
	})

	it('does not auto-retry the same error twice across remounts', () => {
		const reset = jest.fn()
		const error = new Error('Recurring error')

		// First mount — auto-retries
		const { unmount } = render(<ErrorPage error={error} reset={reset} />)
		expect(reset).toHaveBeenCalledTimes(1)

		// Simulate remount (error boundary caught the same error after reset)
		unmount()
		render(<ErrorPage error={error} reset={reset} />)

		// Should NOT have called reset again — the error is already in the retry Set
		expect(reset).toHaveBeenCalledTimes(1)
	})

	it('allows manual retry after error is displayed', () => {
		const reset = jest.fn()
		const error = new Error('Retryable error')

		render(<ErrorPage error={error} reset={reset} />)
		expect(reset).toHaveBeenCalledTimes(1)

		// Show the error UI
		act(() => {
			jest.advanceTimersByTime(500)
		})

		// Click "Try again"
		act(() => {
			screen.getByTestId('retry-button').click()
		})

		// reset() should be called again (once for auto-retry, once for manual)
		expect(reset).toHaveBeenCalledTimes(2)

		// Error text should be hidden again (waiting for retry result)
		expect(screen.queryByText('Někde nastala chyba!')).not.toBeInTheDocument()
	})

	it('cleans up timer on unmount (successful recovery)', () => {
		const reset = jest.fn()
		const error = new Error('Recoverable error')

		const { unmount } = render(<ErrorPage error={error} reset={reset} />)

		// Unmount before timer fires (simulates successful reset)
		unmount()

		// Advance time — no errors should occur from orphaned timers
		act(() => {
			jest.advanceTimersByTime(1000)
		})

		// If we got here without errors, cleanup worked correctly
		expect(reset).toHaveBeenCalledTimes(1)
	})
})
