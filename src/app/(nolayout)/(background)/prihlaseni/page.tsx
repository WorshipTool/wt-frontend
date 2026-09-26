'use client'

import { useIsPhone } from '@/common/hooks/useIsPhone'
import EmailSignInButton from '@/app/(nolayout)/(background)/prihlaseni/components/EmailSignInButton'
import GoogleLoginButton from '@/app/(nolayout)/(background)/prihlaseni/components/GoogleLoginButton'
import LoginMobile from '@/app/(nolayout)/(background)/prihlaseni/components/LoginMobile'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import LogoTitle from '@/common/components/Toolbar/components/LogoTitle'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Gap } from '@/common/ui/Gap'
import { StandaloneCard } from '@/common/ui/StandaloneCard'
import { TextInput } from '@/common/ui/TextInput'
import { Typography } from '@/common/ui/Typography'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { LoginResultDTO } from '../../../../api/dtos/dtosAuth'
import useAuth from '../../../../hooks/auth/useAuth'
import { useSmartNavigate } from '../../../../routes/useSmartNavigate'
import { useSmartParams } from '../../../../routes/useSmartParams'

export default SmartPage(Login, {
	hideFooter: true,
	hideToolbar: true,
	fullWidth: true,
})

function Login() {
	const t = useTranslations('auth.login')
	const tCommon = useTranslations('common')
	const phoneVersion = useIsPhone()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const [isEmailOk, setIsEmailOk] = useState(true)

	const [isPasswordOk, setIsPasswordOk] = useState(true)

	const [errorMessage, setErrorMessage] = useState('')

	const [inProgress, setInProgress] = useState(false)

	// keep the e-mail/password fields hidden until the user picks that path,
	// so Google and e-mail read as two equal sign-in options
	const [showEmailForm, setShowEmailForm] = useState(false)

	const navigate = useSmartNavigate()

	const { login, checkIfCookieExists, logout } = useAuth()
	const params = useSmartParams('login')

	useEffect(() => {
		if (!checkIfCookieExists()) {
			logout({ reason: 'session_expired' })
		}
	}, [])

	const goPreviousPage = () => {
		if (params?.previousPage) {
			navigate(
				{
					url: params.previousPage,
				},
				{}
			)
		} else {
			navigate('home', {
				hledat: undefined,
			})
		}
	}

	const afterGoogleLogin = () => {
		goPreviousPage()
	}

	const onLoginClick = () => {
		let ok = true
		if (email == '') {
			setIsEmailOk(false)
			ok = false
		} else {
			setIsEmailOk(true)
		}

		if (password == '') {
			setIsPasswordOk(false)
			ok = false
		} else {
			setIsPasswordOk(true)
		}

		if (ok) loginAction()
	}

	const loginAction = () => {
		setInProgress(true)
		login({ email, password }, (result: LoginResultDTO) => {
			setInProgress(false)
			if (!result.user) {
				setErrorMessage(t('wrongCredentials'))
				return
			}
			if (params?.previousPage) {
				navigate(
					{
						url: params.previousPage,
					},
					{}
				)
			} else {
				navigate('home', {
					hledat: undefined,
				})
			}
		})
	}

	const resetPassword = async () => {
		navigate('resetPassword', {})
	}

	if (phoneVersion) {
		return (
			<LoginMobile
				email={email}
				password={password}
				onEmailChange={setEmail}
				onPasswordChange={setPassword}
				isEmailOk={isEmailOk}
				isPasswordOk={isPasswordOk}
				inProgress={inProgress}
				errorMessage={errorMessage}
				message={params.message}
				previousPage={params.previousPage}
				showEmailForm={showEmailForm}
				onUseEmail={() => setShowEmailForm(true)}
				onSubmit={onLoginClick}
				onForgotPassword={resetPassword}
				onGoogleLogin={afterGoogleLogin}
			/>
		)
	}

	return (
		<Box
			display={'flex'}
			flexDirection={'column'}
			justifyContent={'center'}
			alignItems={'center'}
			height={'100vh'}
			gap={3}
		>
			<LogoTitle />
			<StandaloneCard
				title={t('title')}
				subtitle={params.message || t('subtitle')}
			>
				<Box
					display={'flex'}
					flexDirection={'column'}
					gap={1}
					width={'100%'}
					paddingBottom={2}
				>
					<Box display={'flex'} flexDirection={'row'} justifyContent={'center'}>
						<GoogleLoginButton afterLogin={afterGoogleLogin} />
					</Box>
					<Box
						position={'relative'}
						display={'flex'}
						justifyContent={'center'}
						alignItems={'center'}
					>
						<Box
							sx={{
								height: '2px',
								width: '100%',
								bgcolor: 'grey.200',
								position: 'absolute',
							}}
						/>
						<Typography
							sx={{
								bgcolor: 'white',
								zIndex: 1,
								padding: 1,
							}}
							color="grey.600"
						>
							{tCommon('or')}
						</Typography>
					</Box>
					<Box color={'grey.800'}>
						{errorMessage != '' && (
							<>
								<Typography color={'error'}>{errorMessage}</Typography>
								<Gap />
							</>
						)}
						{/* e-mail/password stays hidden behind a button until chosen, so
						    Google and e-mail read as two equal sign-in options */}
						{!showEmailForm ? (
							<EmailSignInButton onClick={() => setShowEmailForm(true)} />
						) : (
							<form
								onSubmit={(e) => {
									e.preventDefault()
									onLoginClick()
								}}
								style={{
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<TextInput
									title={t('email')}
									value={email}
									onChange={(e) => setEmail(e)}
									error={!isEmailOk}
									disabled={inProgress}
									type="email"
									placeholder={t('enterEmail')}
									autoFocus
									required
								/>
								<Gap />
								<TextInput
									title={t('password')}
									value={password}
									onChange={(e) => setPassword(e)}
									error={!isPasswordOk}
									disabled={inProgress}
									type="password"
									placeholder={t('enterPassword')}
									required
								/>
								<Box
									display={'flex'}
									flexDirection={'row'}
									alignItems={'center'}
									justifyContent={'start'}
								>
									<Button
										size={'small'}
										variant="text"
										color="grey.600"
										onClick={resetPassword}
									>
										{t('forgotPassword')}
									</Button>
								</Box>
								<Gap />
								<Box
									display={'flex'}
									flexDirection={'row'}
									justifyContent={'center'}
								>
									<Button
										type="submit"
										loading={inProgress}
										variant="contained"
										sx={{
											width: 200,
										}}
										color="primarygradient"
									>
										{t('loginButton')}
									</Button>
								</Box>
							</form>
						)}
						<Gap />
						<Box
							display={'flex'}
							flexDirection={'row'}
							alignItems={'center'}
							justifyContent={'center'}
						>
							<Typography size={'0.9rem'}>{t('noAccount')}</Typography>
							<Button
								size={'small'}
								variant="text"
								to="signup"
								toParams={{
									previousPage: params.previousPage,
								}}
							>
								{t('createAccount')}
							</Button>
						</Box>
					</Box>
				</Box>
			</StandaloneCard>
			<Gap value={5} />
		</Box>
	)
}
