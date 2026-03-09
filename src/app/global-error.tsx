'use client'

/**
 * global-error.tsx — safety net for errors in the root layout itself.
 * This component replaces the entire document (including <html>/<body>),
 * so it cannot use MUI, translations, or any provider-based hooks.
 */
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	return (
		<html lang="en">
			<body
				style={{
					margin: 0,
					fontFamily: 'Roboto, sans-serif',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '100vh',
					backgroundColor: '#fff',
					color: '#1a1a1a',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '24px',
						textAlign: 'center',
						padding: '32px',
					}}
				>
					<h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 400 }}>
						Něco se pokazilo
					</h2>
					<p style={{ margin: 0, color: '#666' }}>
						{error?.message || 'Nastala neočekávaná chyba.'}
					</p>
					<button
						onClick={reset}
						style={{
							padding: '10px 24px',
							fontSize: '1rem',
							border: '1px solid #1976d2',
							borderRadius: '4px',
							background: 'transparent',
							color: '#1976d2',
							cursor: 'pointer',
						}}
					>
						Zkusit znovu
					</button>
				</div>
			</body>
		</html>
	)
}
