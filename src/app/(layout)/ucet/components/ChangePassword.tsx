import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Card } from '@/common/ui/Card/Card'
import { Gap } from '@/common/ui/Gap'
import { TextField } from '@/common/ui/TextField/TextField'
import { Typography } from '@/common/ui/Typography'
import useAuth from '@/hooks/auth/useAuth'
import { LOGIN_METHOD_TYPE } from '@/interfaces/user'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { useMemo, useState } from 'react'
import './styles.css'

export default function ChangePassword() {
	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [newPasswordAgain, setNewPasswordAgain] = useState('')

	const [error, setError] = useState('')

	const { changePassword, user, login } = useAuth()

	const navigate = useSmartNavigate()

	const { enqueueSnackbar } = useSnackbar()

	const t = useTranslations('account.passwordChange')

	const usingPasswordMethod = useMemo(() => {
		return user?.loginMethods.includes(LOGIN_METHOD_TYPE.Email)
	}, [user])

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (!user) {
			setError(t('errors.somethingWrong'))
			return
		}

		if (oldPassword === '' || newPassword === '' || newPasswordAgain === '') {
			setError(t('errors.allFieldsRequired'))
			return
		}

		if (oldPassword === newPassword) {
			setError(t('errors.samePassword'))
			return
		}

		if (newPassword !== newPasswordAgain) {
			setError(t('errors.passwordMismatch'))
			return
		}

		try {
			await changePassword(oldPassword, newPassword)

			await login({ email: user.email, password: newPassword })

			enqueueSnackbar(t('success'), { variant: 'success' })
			reset()
		} catch (e) {
			setError(
				t('errors.wrongOldPassword')
			)
		}
	}

	const reset = () => {
		setOldPassword('')
		setNewPassword('')
		setNewPasswordAgain('')
		setError('')
	}

	return usingPasswordMethod ? (
		<Card title={t('title')}>
			<form onSubmit={handleSubmit}>
				<Box className={'form-div'}>
					<Typography color={'error'}>{error}</Typography>
					<Box>
						<Typography>{t('oldPassword')}</Typography>
						<TextField
							className="text-field-edit"
							placeholder={t('enterOldPassword')}
							type="password"
							value={oldPassword}
							onChange={(value) => setOldPassword(value)}
						/>
					</Box>
					<Gap />
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
	) : (
		<Card title={t('title')}>
			<Typography>
				{t('googleAccountMessage')}
			</Typography>
		</Card>
	)
}
