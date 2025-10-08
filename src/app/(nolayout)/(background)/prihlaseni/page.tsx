'use client'

import GoogleLoginButton from '@/app/(nolayout)/(background)/prihlaseni/components/GoogleLoginButton'
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
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const [isEmailOk, setIsEmailOk] = useState(true)

	const [isPasswordOk, setIsPasswordOk] = useState(true)

	const [errorMessage, setErrorMessage] = useState('')

	const [inProgress, setInProgress] = useState(false)

	const navigate = useSmartNavigate()

	const { login, checkIfCookieExists, logout } = useAuth()
	const params = useSmartParams('login')

	useEffect(() => {
		if (!checkIfCookieExists()) {
			logout()
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
								<Typography color={'red'}>{errorMessage}</Typography>
								<Gap />
							</>
						)}
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
						</form>
					</Box>
				</Box>
			</StandaloneCard>
			<Gap value={5} />
			{/* <Box
				flex={1}
				display={'flex'}
				justifyContent={'center'}
				flexDirection={'column'}
				alignItems={'center'}
				paddingTop={5}
			>
				{params.message && (
					<StyledContainer
						style={{
							marginBottom: theme.spacing(2),
						}}
					>
						<Box
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								gap: theme.spacing(1),
								padding: '30px',
							}}
						>
							<Info fontSize="large" color="info" />
							<Typography>{params.message}</Typography>
						</Box>
					</StyledContainer>
				)}
				<StyledContainer>
					<Box
						sx={{
							padding: '30px',
						}}
					>
						<Box display={'flex'} flexDirection={'column'}>
							<Typography variant={'h5'} strong={'bold'} flex={1}>
								Která jsi ovce?
							</Typography>
						</Box>
						<Gap />
						{errorMessage != '' && (
							<>
								<Typography variant="subtitle2" color={'red'}>
									{errorMessage}
								</Typography>
								<Gap />
							</>
						)}

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
							<Typography variant="subtitle2">Email</Typography>
							<TextField
								size="small"
								value={email}
								onChange={onEmailChange}
								error={!isEmailOk}
								helperText={emailMessage}
								disabled={inProgress}
								type="email"
							/>
							<Gap />
							<Typography variant="subtitle2">Heslo</Typography>
							<TextField
								size="small"
								fullWidth
								value={password}
								onChange={onPasswordChange}
								error={!isPasswordOk}
								helperText={passwordMessage}
								disabled={inProgress}
								type="password"
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
							<Box>
								<Button type="submit" loading={inProgress} variant="contained">
									{t('loginButton')}
								</Button>
							</Box>
						</form>

						<Box
							display={'flex'}
							flexDirection={'row'}
							alignItems={'center'}
							justifyContent={'end'}
						>
							<Typography variant={'subtitle2'}>Nemáte ještě účet?</Typography>
							<Button size={'small'} variant="text" to="signup">
								Vytvořte si ho
							</Button>
						</Box>
						<Gap value={2} />
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'end',
							}}
						>
							<GoogleLoginButton afterLogin={afterGoogleLogin} />
						</Box>
					</Box>
				</StyledContainer>
			</Box> */}
		</Box>
	)
}
