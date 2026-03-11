import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ErrorBoundary from '../ErrorBoundary'

// Suppress console.error for expected boundary catches
const originalConsoleError = console.error
beforeEach(() => {
	console.error = jest.fn()
})
afterEach(() => {
	console.error = originalConsoleError
})

// Component that throws on render
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
	if (shouldThrow) {
		throw new Error('Test render error')
	}
	return <div>Normal content</div>
}

// Mock the ErrorPage using relative path (next-intl / MUI not available in unit tests)
jest.mock('../../../../app/error', () => {
	return function MockErrorPage({
		error,
		reset,
	}: {
		error: Error
		reset: () => void
	}) {
		return (
			<div data-testid="error-page">
				<span data-testid="error-message">{error.message}</span>
				<button onClick={reset} data-testid="reset-button">
					Try again
				</button>
			</div>
		)
	}
})

describe('ErrorBoundary', () => {
	it('renders children when no error occurs', () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow={false} />
			</ErrorBoundary>,
		)
		expect(screen.getByText('Normal content')).toBeInTheDocument()
		expect(screen.queryByTestId('error-page')).not.toBeInTheDocument()
	})

	it('auto-retries once before showing error page for persistent errors', () => {
		// With auto-retry, the ErrorBoundary will catch the error, retry once,
		// and only show the error page after the retry also fails.
		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow={true} />
			</ErrorBoundary>,
		)
		// After auto-retry exhausted, error page should be shown
		expect(screen.getByTestId('error-page')).toBeInTheDocument()
		expect(screen.getByTestId('error-message')).toHaveTextContent(
			'Test render error',
		)
	})

	it('passes the caught error to the error page', () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow={true} />
			</ErrorBoundary>,
		)
		expect(screen.getByTestId('error-message').textContent).toBe(
			'Test render error',
		)
	})

	it('recovers when a transient error resolves on retry', () => {
		let throwCount = 0

		function TransientThrowingComponent() {
			throwCount++
			// Throw only on the first render, succeed on retry
			if (throwCount <= 1) throw new Error('Transient error')
			return <div>Recovered content</div>
		}

		render(
			<ErrorBoundary>
				<TransientThrowingComponent />
			</ErrorBoundary>,
		)

		// The auto-retry should succeed — children render normally
		expect(screen.getByText('Recovered content')).toBeInTheDocument()
		expect(screen.queryByTestId('error-page')).not.toBeInTheDocument()
	})

	it('resets the error state when reset is called', () => {
		// Use a mutable flag so we can stop throwing before the boundary re-renders after reset
		let shouldThrow = true

		function ControlledThrowingComponent() {
			if (shouldThrow) throw new Error('Test render error')
			return <div>Normal content</div>
		}

		render(
			<ErrorBoundary>
				<ControlledThrowingComponent />
			</ErrorBoundary>,
		)

		// After auto-retry fails, error page should be shown
		expect(screen.getByTestId('error-page')).toBeInTheDocument()

		// Stop throwing, then click reset — boundary will re-render the child without an error
		shouldThrow = false
		fireEvent.click(screen.getByTestId('reset-button'))

		expect(screen.queryByTestId('error-page')).not.toBeInTheDocument()
		expect(screen.getByText('Normal content')).toBeInTheDocument()
	})

	it('logs the error to console', () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow={true} />
			</ErrorBoundary>,
		)
		expect(console.error).toHaveBeenCalledWith(
			expect.stringContaining('[ErrorBoundary]'),
			expect.any(Error),
			expect.any(Object),
		)
	})
})
