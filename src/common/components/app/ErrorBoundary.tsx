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

/**
 * Global React ErrorBoundary that catches any unhandled render errors
 * and displays the existing app error page instead of crashing.
 */
class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('[ErrorBoundary] Caught unhandled error:', error, errorInfo)
	}

	handleReset = () => {
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
