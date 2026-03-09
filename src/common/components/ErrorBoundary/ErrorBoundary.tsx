'use client'

import { clientErrorEvent } from '@/tech/fetch/handleApiCall'
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
 * A generic React ErrorBoundary that catches client-side errors.
 * Logs the error to console and dispatches a clientErrorEvent on the window
 * so that ErrorHandlerProvider can show a snackbar notification.
 * By default renders null (page keeps running), custom fallback prop still supported.
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
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent(clientErrorEvent, { detail: { error } }))
		}
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
			// No visual fallback – error is reported via snackbar, page keeps running
			return null
		}

		return children
	}
}
