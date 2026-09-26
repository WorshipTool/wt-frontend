'use client'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import EmailSignInButton from '@/app/(nolayout)/(background)/prihlaseni/components/EmailSignInButton'
import GoogleLoginButton from '@/app/(nolayout)/(background)/prihlaseni/components/GoogleLoginButton'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import LogoTitle from '@/common/components/Toolbar/components/LogoTitle'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Gap } from '@/common/ui/Gap'
import { StandaloneCard } from '@/common/ui/StandaloneCard'
import { TextInput } from '@/common/ui/TextInput'
import { Typography } from '@/common/ui/Typography'
import { useSmartParams } from '@/routes/useSmartParams'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import useAuth from '../../../../hooks/auth/useAuth'
import { useSmartNavigate } from '../../../../routes/useSmartNavigate'
import SignupMobile from './components/SignupMobile'

export default SmartPage(SignUp, {
	hideFooter: true,
	hideToolbar: true,
	fullWidth: true,
})

function SignUp() {
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [errorMessage, setErrorMessage] = useState('')

	const [inProgress, setInProgress] = useState(false)

	// keep the e-mail form hidden until chosen, so Google and e-mail read as two
	// equal sign-up options (mirrors the login screen)
	const [showEmailForm, setShowEmailForm] = useState(false)

	const phoneVersion = useIsPhone()

	const navigate = useSmartNavigate()

	const { signup, login } = useAuth()

	const params = useSmartParams('signup')

	const t = useTranslations('auth.signup')
	const tCommon = useTranslations('common')

	const goPreviousPage = () => {
		if (params?.previousPage) {
			navigate({ url: params.previousPage }, {})
		} else {
			navigate('home', { hledat: undefined })
		}
	}

	const onSignupClick = () => {
		setInProgress(true)

		signup({ email, password, firstName, lastName }, async (result) => {
			if (!result) {
				setErrorMessage(t('emailExists'))
				setInProgress(false)
			} else {
				await login({ email, password })
				goPreviousPage()
				setInProgress(false)
			}
		})
	}

	if (phoneVersion) {
		return (
			<SignupMobile
				firstName={firstName}
				lastName={lastName}
				email={email}
				password={password}
				onFirstNameChange={setFirstName}
				onLastNameChange={setLastName}
				onEmailChange={setEmail}
				onPasswordChange={setPassword}
				inProgress={inProgress}
				errorMessage={errorMessage}
				previousPage={params.previousPage}
				showEmailForm={showEmailForm}
				onUseEmail={() => setShowEmailForm(true)}
				onSubmit={onSignupClick}
				onGoogleSignup={goPreviousPage}
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
			<StandaloneCard title={t('title')} subtitle={t('subtitle')}>
				<Box
					display={'flex'}
					flexDirection={'column'}
					gap={1}
					width={'100%'}
					paddingBottom={2}
				>
					<Box display={'flex'} flexDirection={'row'} justifyContent={'center'}>
						{/* without this the button falls back to navigating home, so
						    desktop signup dropped `previousPage` while the phone honoured it */}
						<GoogleLoginButton afterLogin={goPreviousPage} />
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
					{errorMessage != '' && (
						<>
							<Typography color={'error'}>{errorMessage}</Typography>
							<Gap />
						</>
					)}
					{/* e-mail/password stays hidden behind a button until chosen, so
					    Google and e-mail read as two equal sign-up options — the same
					    shape as the login screen. `showEmailForm` existed here already
					    but only the phone branch read it. */}
					{!showEmailForm ? (
						<EmailSignInButton onClick={() => setShowEmailForm(true)} />
					) : (
						<form
							onSubmit={(e) => {
								e.preventDefault()
								onSignupClick()
							}}
						>
							<Box gap={1} display={'flex'} flexDirection={'column'}>
								<Box display={'flex'} flexDirection={'row'} gap={2}>
									<TextInput
										required
										title={t('firstName')}
										value={firstName}
										onChange={(m) => setFirstName(m)}
										disabled={inProgress}
									/>
									<TextInput
										required
										title={t('lastName')}
										value={lastName}
										onChange={(m) => setLastName(m)}
										disabled={inProgress}
									/>
								</Box>
								<TextInput
									required
									title={t('email')}
									value={email}
									onChange={(m) => setEmail(m)}
									type="email"
									disabled={inProgress}
								/>
								<TextInput
									required
									title={t('password')}
									value={password}
									onChange={(m) => setPassword(m)}
									type="password"
									disabled={inProgress}
								/>
							</Box>
							<Gap />
							<Gap />

							<Box
								display={'flex'}
								flexDirection={'row'}
								justifyContent={'center'}
							>
								<Button
									type="submit"
									loading={inProgress}
									sx={{
										width: 200,
									}}
									color={'primarygradient'}
								>
									{t('signupButton')}
								</Button>
							</Box>
						</form>
					)}

					{/* outside the e-mail form: the way to an existing account must stay
					    reachable whether or not that form has been opened */}
					<Gap />
					<Box
						display={'flex'}
						flexDirection={'row'}
						alignItems={'center'}
						justifyContent={'center'}
					>
						<Typography size={'0.9rem'}>{t('haveAccount')}</Typography>
						<Button
							size={'small'}
							variant="text"
							to="login"
							color="primary"
							toParams={{
								previousPage: params.previousPage,
							}}
						>
							{t('login')}
						</Button>
					</Box>
				</Box>
			</StandaloneCard>
			<Gap value={5} />
		</Box>
	)
}
