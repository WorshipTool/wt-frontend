import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'

// Suppress console.error in tests since ErrorBoundary intentionally logs errors
const originalConsoleError = console.error
beforeAll(() => {
	console.error = jest.fn()
})
afterAll(() => {
	console.error = originalConsoleError
})

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
	if (shouldThrow) {
		throw new Error('Test error')
	}
	return <div>OK</div>
}

describe('ErrorBoundary', () => {
	it('renders children when there is no error', () => {
		render(
			<ErrorBoundary>
				<div>hello</div>
			</ErrorBoundary>
		)
		expect(screen.getByText('hello')).toBeInTheDocument()
	})

	it('renders null (no visual fallback) when error is caught without custom fallback', () => {
		const { container } = render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow />
			</ErrorBoundary>
		)
		// Default behaviour: render nothing so the page keeps running
		expect(container.firstChild).toBeNull()
	})

	it('dispatches clientErrorEvent on window when error is caught', () => {
		const listener = jest.fn()
		window.addEventListener('clientErrorEvent', listener)

		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow />
			</ErrorBoundary>
		)

		expect(listener).toHaveBeenCalledTimes(1)
		const event = listener.mock.calls[0][0] as CustomEvent
		expect(event.detail?.error?.message).toBe('Test error')

		window.removeEventListener('clientErrorEvent', listener)
	})

	it('renders custom fallback when provided', () => {
		const customFallback = (error: Error, reset: () => void) => (
			<div>
				<span>Custom: {error.message}</span>
				<button onClick={reset}>Retry</button>
			</div>
		)

		render(
			<ErrorBoundary fallback={customFallback}>
				<ThrowingComponent shouldThrow />
			</ErrorBoundary>
		)

		expect(screen.getByText('Custom: Test error')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
	})

	it('resets error state when custom fallback reset is called', () => {
		const state = { shouldThrow: true }

		function ControlledChild() {
			if (state.shouldThrow) throw new Error('Test error')
			return <div>OK</div>
		}

		const customFallback = (_error: Error, reset: () => void) => (
			<button onClick={reset}>Retry</button>
		)

		render(
			<ErrorBoundary fallback={customFallback}>
				<ControlledChild />
			</ErrorBoundary>
		)

		expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()

		state.shouldThrow = false
		fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

		expect(screen.getByText('OK')).toBeInTheDocument()
	})

	it('logs the error to console.error', () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow />
			</ErrorBoundary>
		)

		expect(console.error).toHaveBeenCalled()
	})
})
