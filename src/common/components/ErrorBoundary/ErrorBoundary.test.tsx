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

	it('catches errors and shows default fallback UI', () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow />
			</ErrorBoundary>
		)
		expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
		expect(screen.getByText('Test error')).toBeInTheDocument()
	})

	it('shows a "Try again" button in default fallback', () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow />
			</ErrorBoundary>
		)
		expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
	})

	it('resets error state when "Try again" is clicked', () => {
		// Use a mutable ref so we can change it before clicking reset
		// (the child must not throw when the boundary resets)
		const state = { shouldThrow: true }

		function ControlledChild() {
			if (state.shouldThrow) throw new Error('Test error')
			return <div>OK</div>
		}

		render(
			<ErrorBoundary>
				<ControlledChild />
			</ErrorBoundary>
		)

		expect(screen.getByText('Something went wrong.')).toBeInTheDocument()

		// Stop throwing BEFORE clicking reset so the re-render succeeds
		state.shouldThrow = false
		fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

		expect(screen.getByText('OK')).toBeInTheDocument()
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

	it('logs the error to console.error', () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow />
			</ErrorBoundary>
		)

		expect(console.error).toHaveBeenCalled()
	})
})
