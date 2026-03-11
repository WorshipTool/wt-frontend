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

import ErrorPage from '../error'

// Suppress console.error for expected error logs
const originalConsoleError = console.error
beforeEach(() => {
	console.error = jest.fn()
})
afterEach(() => {
	console.error = originalConsoleError
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

	it('shows error page after auto-retry fails with a new error', () => {
		const reset = jest.fn()
		const error1 = new Error('Persistent error')

		// First render — auto-retries (calls reset)
		const { rerender } = render(<ErrorPage error={error1} reset={reset} />)
		expect(reset).toHaveBeenCalledTimes(1)

		// Simulate what Next.js does when the retry fails: call the error
		// component again with a NEW error object (triggers useEffect re-run).
		const error2 = new Error('Persistent error again')
		act(() => {
			rerender(<ErrorPage error={error2} reset={reset} />)
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
		const error1 = new Error('Server error')

		// First render — auto-retries
		const { rerender } = render(<ErrorPage error={error1} reset={reset} />)

		// Second render with new error — shows error UI with button
		const error2 = new Error('Server error again')
		act(() => {
			rerender(<ErrorPage error={error2} reset={reset} />)
		})
		expect(screen.getByText('Zkusit znovu')).toBeInTheDocument()
	})
})
