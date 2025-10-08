'use client'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Card } from '@/common/ui/Card/Card'
import { Gap } from '@/common/ui/Gap'
import { TextField } from '@/common/ui/TextField/TextField'
import { Typography } from '@/common/ui/Typography'
import useAuth from '@/hooks/auth/useAuth'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import './styles.css'

export default SmartPage(Page)

function Page() {
	const [email, setEmail] = useState('')

	const [error, setError] = useState('')

	const [done, setDone] = useState(false)

	const navigate = useSmartNavigate()

	const { enqueueSnackbar } = useSnackbar()

	const { sendResetLink } = useAuth()

	const t = useTranslations('auth.resetPassword')

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (email === '') {
			setError(t('emailRequired'))
			return
		}

		try {
			await sendResetLink(email)
		} catch (e) {
		} finally {
			setDone(true)
		}
	}

	return (
		<Box
			sx={{
				marginTop: 3,
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			{!done ? (
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
							<Typography>
								{t('subtitle')}
							</Typography>
							<Gap />
							<Box>
								<Typography>Email</Typography>
								<TextField
									className="text-field-edit"
									placeholder={t('enterEmail')}
									type="email"
									value={email}
									onChange={(value) => setEmail(value)}
								/>
							</Box>
							<Button variant="contained" color="primary" type="submit">
								{t('sendResetLink')}
							</Button>
						</Box>
					</form>
				</Card>
			) : (
				<Card
					title={t('linkSent')}
					sx={{
						minWidth: 300,
					}}
				>
					<Typography>
						{t('linkSentMessage')}
					</Typography>
				</Card>
			)}
		</Box>
	)
}
