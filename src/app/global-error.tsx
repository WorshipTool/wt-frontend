'use client'

import { useEffect } from 'react'

type GlobalErrorProps = {
	error: Error & { digest?: string }
	reset: () => void
}

/**
 * Next.js global error boundary that catches errors in the root layout.
 * Must include its own <html> and <body> tags since it replaces the root layout.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		console.error('[GlobalError] Uncaught root layout error:', error)
	}, [error])

	return (
		<html lang="en">
			<body>
				<div
					style={{
						position: 'fixed',
						inset: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 16,
						fontFamily: 'sans-serif',
						background: '#fff',
						color: '#333',
					}}
				>
					<h2 style={{ margin: 0, fontSize: '1.5rem' }}>Something went wrong</h2>
					<p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
						An unexpected error occurred. Please try again.
					</p>
					<button
						onClick={reset}
						style={{
							padding: '8px 24px',
							fontSize: '0.9rem',
							cursor: 'pointer',
							border: '1px solid #0085FF',
							borderRadius: 6,
							background: 'transparent',
							color: '#0085FF',
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	)
}
