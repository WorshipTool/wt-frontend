'use client'

import { ErrorPageProps } from '@/common/types'
import { Box, Button, Typography } from '@/common/ui'
import { LockPerson } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'

type ErrorType = 'forbidden' | 'default'

export default function Error({ error, reset }: ErrorPageProps) {
	const t = useTranslations('errors')
	const tCommon = useTranslations('common')
	const errorType: ErrorType = useMemo(() => {
		return error.message.includes('Forbidden') ? 'forbidden' : 'default'
	}, [error])

	useEffect(() => {
		console.error(error)
		//TODO: send report to admin
	}, [error])

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
