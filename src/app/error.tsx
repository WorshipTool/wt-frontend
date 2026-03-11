'use client'

import { ErrorPageProps } from '@/common/types'
import { Box, Button, Typography } from '@/common/ui'
import { LockPerson } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

type ErrorType = 'forbidden' | 'default'

export default function Error({ error, reset }: ErrorPageProps) {
	const t = useTranslations('errors')
	const tCommon = useTranslations('common')
	const hasRetriedRef = useRef(false)
	const [showError, setShowError] = useState(false)

	const errorType: ErrorType = useMemo(() => {
		return error.message.includes('Forbidden') ? 'forbidden' : 'default'
	}, [error])

	useEffect(() => {
		console.error('Error page error:', error)
		//TODO: send report to admin

		if (errorType !== 'forbidden' && !hasRetriedRef.current) {
			hasRetriedRef.current = true
			reset()
			return
		}

		// Retry already happened but error persists — show the error page
		if (errorType !== 'forbidden' && hasRetriedRef.current) {
			setShowError(true)
		}
	}, [error, errorType, reset])

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
	// Using state (not just ref) prevents the brief flash of error content
	// that occurs when React re-renders the component during the reset() transition.
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
			<Button onClick={reset}>{tCommon('tryAgain')}</Button>
		</Box>
	)
}
