'use client'
import ErrorPage from '@/app/error'
import React from 'react'

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

interface ErrorBoundaryProps {
	children: React.ReactNode
}

const MAX_AUTO_RETRIES = 1

/**
 * Global React ErrorBoundary that catches any unhandled render errors
 * and displays the existing app error page instead of crashing.
 *
 * Auto-retries once for transient errors before showing the error page.
 * This prevents a brief flash of the error page when an error resolves
 * on the second render (e.g. race conditions during hydration).
 */
class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	private retryCount = 0

	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('[ErrorBoundary] Caught unhandled error:', error, errorInfo)

		// Auto-retry once for transient errors
		if (this.retryCount < MAX_AUTO_RETRIES) {
			this.retryCount++
			this.setState({ hasError: false, error: null })
		}
	}

	handleReset = () => {
		this.retryCount = 0
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError && this.state.error) {
			return (
				<ErrorPage error={this.state.error} reset={this.handleReset} />
			)
		}
		return this.props.children
	}
}

export default ErrorBoundary
