'use client'

import { ErrorPageProps } from '@/common/types'
import { Box, Button, Typography } from '@/common/ui'
import { LockPerson } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'

type ErrorType = 'forbidden' | 'default'

/**
 * Module-level Set tracking errors that have already been auto-retried.
 * Unlike useRef, this persists across component remounts (which happen when
 * Next.js error boundary catches a recurring error after reset()), preventing
 * infinite auto-retry loops.
 */
const retriedErrors = new Set<string>()

function getErrorKey(error: Error & { digest?: number }): string {
	return String(error.digest ?? '') || error.message || 'unknown'
}

/** Visible for testing – allows tests to clear module-level retry state. */
export function clearRetriedErrors() {
	retriedErrors.clear()
}

export default function Error({ error, reset }: ErrorPageProps) {
	const t = useTranslations('errors')
	const tCommon = useTranslations('common')
	const [showError, setShowError] = useState(false)

	const errorType: ErrorType = useMemo(() => {
		return error.message.includes('Forbidden') ? 'forbidden' : 'default'
	}, [error])

	useEffect(() => {
		console.error('Error page error:', error)
		//TODO: send report to admin

		if (errorType === 'forbidden') return

		const errorKey = getErrorKey(error)

		// First encounter with this error — attempt automatic recovery
		if (!retriedErrors.has(errorKey)) {
			retriedErrors.add(errorKey)
			reset()
		}

		// Delay showing the error UI to give reset() time to resolve.
		// If reset() succeeds the component unmounts and the timer is cleaned up.
		// This also prevents React strict mode's double effect invocation from
		// causing a brief flash of the error page during successful recovery.
		const timer = setTimeout(() => {
			setShowError(true)
		}, 500)

		return () => clearTimeout(timer)
	}, [error, errorType, reset])

	const handleReset = useCallback(() => {
		// Allow this error to be auto-retried again
		retriedErrors.delete(getErrorKey(error))
		setShowError(false)
		reset()
	}, [error, reset])

	// Forbidden errors show immediately
	if (errorType === 'forbidden') {
		return (
			<Box
				sx={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
					alignItems: 'center',
				}}
			>
				<LockPerson
					sx={{
						fontSize: 60,
					}}
				/>
				<Typography align="center" variant="h6">
					{t('forbidden')}
				</Typography>
			</Box>
		)
	}

	// Non-forbidden errors: render nothing until retry is confirmed failed.
	// The setTimeout in useEffect prevents flash during successful recovery
	// and handles React strict mode's double effect invocation.
	if (!showError) {
		return null
	}

	return (
		<Box
			sx={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				display: 'flex',
				flexDirection: 'column',
				gap: 3,
				alignItems: 'center',
			}}
		>
			<Typography align="center" variant="h3">
				{t('serverError')}
			</Typography>
			<Button onClick={handleReset}>{tCommon('tryAgain')}</Button>
		</Box>
	)
}
