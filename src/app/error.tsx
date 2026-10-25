'use client'

import { ErrorPageProps } from '@/common/types'
import { Box, Button, Typography } from '@/common/ui'
import useAuth from '@/hooks/auth/useAuth'
import { useClientPathname } from '@/hooks/pathname/useClientPathname'
import { LockPerson } from '@mui/icons-material'
import * as Sentry from '@sentry/nextjs'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'

type ErrorType = 'forbidden' | 'default'

export default function Error({ error, reset, skipReport }: ErrorPageProps) {
	const t = useTranslations('errors')
	const tCommon = useTranslations('common')
	const pathname = useClientPathname()
	const { user } = useAuth()
	const errorType: ErrorType = useMemo(() => {
		return error.message.includes('Forbidden') ? 'forbidden' : 'default'
	}, [error])

	useEffect(() => {
		console.error('Error page error:', error)
		if (skipReport) return

		if (errorType === 'forbidden') {
			// Being denied access is the access control working as intended, not
			// a bug - keep it visible in Sentry as a warning (not an exception)
			// so it doesn't count toward the error rate.
			Sentry.captureMessage(error.message, {
				level: 'warning',
				tags: { errorBoundary: 'page', authenticated: String(!!user) },
				extra: { pathname, userGuid: user?.guid, role: user?.role },
			})
		} else {
			Sentry.captureException(error, { tags: { errorBoundary: 'page' } })
		}
	}, [error, errorType, skipReport, pathname, user])

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
			{errorType === 'forbidden' ? (
				<>
					<LockPerson
						sx={{
							fontSize: 60,
						}}
					/>
					<Typography align="center" variant="h6">
						{t('forbidden')}
					</Typography>
				</>
			) : (
				<>
					<Typography align="center" variant="h3">
						{t('serverError')}
					</Typography>
					<Button onClick={reset}>{tCommon('tryAgain')}</Button>
				</>
			)}
		</Box>
	)
}
