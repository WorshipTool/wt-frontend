'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
	children: ReactNode
	/** Optional fallback UI to render when an error is caught. Receives the error and a reset function. */
	fallback?: (error: Error, reset: () => void) => ReactNode
}

type State = {
	error: Error | null
}

/**
 * A generic React ErrorBoundary that catches client-side errors and
 * renders a fallback UI instead of crashing the entire page.
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { error: null }
	}

	static getDerivedStateFromError(error: Error): State {
		return { error }
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('[ErrorBoundary] Caught error:', error, info.componentStack)
	}

	reset = () => {
		this.setState({ error: null })
	}

	render() {
		const { error } = this.state
		const { children, fallback } = this.props

		if (error) {
			if (fallback) {
				return fallback(error, this.reset)
			}
			return <DefaultFallback error={error} reset={this.reset} />
		}

		return children
	}
}

function DefaultFallback({ error, reset }: { error: Error; reset: () => void }) {
	return (
		<div
			style={{
				padding: '16px',
				border: '1px solid #ffcdd2',
				borderRadius: '8px',
				backgroundColor: '#fff8f8',
				color: '#c62828',
				fontSize: '0.85rem',
			}}
		>
			<strong>Something went wrong.</strong>
			<div style={{ marginTop: 4, color: '#888', fontSize: '0.78rem' }}>{error.message}</div>
			<button
				onClick={reset}
				style={{
					marginTop: 8,
					padding: '4px 12px',
					fontSize: '0.8rem',
					cursor: 'pointer',
					border: '1px solid #c62828',
					borderRadius: 4,
					background: 'transparent',
					color: '#c62828',
				}}
			>
				Try again
			</button>
		</div>
	)
}
