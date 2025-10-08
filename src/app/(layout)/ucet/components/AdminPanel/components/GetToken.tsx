import { Button, Typography } from '@/common/ui'
import { InputBase } from '@/common/ui/mui'
import { copyToClipboard } from '@/tech/string/copy.tech'
import { Token } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { LoginRequestDTO } from '../../../../../../api/dtos/dtosAuth'
import { useApi } from '../../../../../../api/tech-and-hooks/useApi'
import { Card } from '../../../../../../common/ui/Card/Card'
import useAuth from '../../../../../../hooks/auth/useAuth'

export default function GetToken() {
	const t = useTranslations('admin')
	const { authApi } = useApi()

	const [token, setToken] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const { user } = useAuth()

	const showToken = () => {
		const body: LoginRequestDTO = {
			email,
			password,
		}
		authApi
			.login(body)
			.then((r) => {
				setToken(r.token)
				navigator.clipboard.writeText(r.token)
			})
			.catch((e) => {
				console.log(e)
			})
	}

	const myToken = () => {
		const t = user?.token || ''
		console.log(t)
		setToken(t)
		copyToClipboard(t)
	}
	return (
		<Card
			icon={<Token />}
			actions={
				<>
					<Button
						onClick={showToken}
						variant="contained"
						disabled={email.trim() === '' || password.trim() === ''}
					>
						{t('userToken.getToken')}
					</Button>
					<Button onClick={myToken}>{t('userToken.myToken')}</Button>
				</>
			}
			title={t('userToken.title')}
		>
			<InputBase
				placeholder={t('userToken.emailPlaceholder')}
				value={email}
				onChange={(e) => {
					setEmail(e.target.value)
				}}
			/>
			<InputBase
				placeholder={t('userToken.passwordPlaceholder')}
				value={password}
				type="password"
				onChange={(e) => {
					setPassword(e.target.value)
				}}
			/>
			{token != '' && <Typography>{t('userToken.tokenCopied')}</Typography>}
		</Card>
	)
}
