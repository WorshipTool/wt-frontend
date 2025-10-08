'use client'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Card } from '@/common/ui/Card/Card'
import { TextField } from '@/common/ui/TextField/TextField'
import { Typography } from '@/common/ui/Typography'
import useAuth from '@/hooks/auth/useAuth'
import { routesPaths } from '@/routes'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useSmartParams } from '@/routes/useSmartParams'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import '../styles.css'

export default SmartPage(Page)

function Page() {
	const [newPassword, setNewPassword] = useState('')
	const [newPasswordAgain, setNewPasswordAgain] = useState('')

	const [error, setError] = useState('')

	const { resetPassword } = useAuth()

	const navigate = useSmartNavigate()

	const { enqueueSnackbar } = useSnackbar()

	const { token } = useSmartParams('resetPasswordToken')

	const t = useTranslations('account.passwordChange')
	const tCommon = useTranslations('common')

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (newPassword === '' || newPasswordAgain === '') {
			setError(t('errors.allFieldsRequired'))
			return
		}

		if (newPassword !== newPasswordAgain) {
			setError(t('errors.passwordMismatch'))
			return
		}

		try {
			await resetPassword(token, newPassword)

			enqueueSnackbar(t('success'), { variant: 'success' })
			reset()
			navigate('login', {
				message: t('successMessage'),
				previousPage: routesPaths.account,
			})
		} catch (e) {
			setError(t('errors.invalidLink'))
		}
	}

	const reset = () => {
		setNewPassword('')
		setNewPasswordAgain('')
		setError('')
	}

	return (
		<Box
			sx={{
				marginTop: 3,
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<Card
				title={t('title')}
				sx={{
					minWidth: 300,
				}}
			>
				<form onSubmit={handleSubmit}>
					<Box className={'form-div'}>
						{error && error.length > 0 && (
							<Typography color={'error'}>{error}</Typography>
						)}
						<Box>
							<Typography>{t('newPassword')}</Typography>
							<TextField
								className="text-field-edit"
								placeholder={t('enterNewPassword')}
								type="password"
								value={newPassword}
								onChange={(value) => setNewPassword(value)}
							/>
						</Box>
						<Box>
							<Typography>{t('newPasswordAgain')}</Typography>
							<TextField
								className="text-field-edit"
								placeholder={t('enterNewPassword')}
								type="password"
								value={newPasswordAgain}
								onChange={(value) => setNewPasswordAgain(value)}
							/>
						</Box>
						<Button variant="contained" color="primary" type="submit">
							{t('changePasswordButton')}
						</Button>
					</Box>
				</form>
			</Card>
		</Box>
	)
}
