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
import { useSmartParams } from '@/routes/useSmartParams'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import useAuth from '../../../../hooks/auth/useAuth'
import { useSmartNavigate } from '../../../../routes/useSmartNavigate'

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
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errorMessage, setErrorMessage] = useState('')

	const [isFirstNameOk, setIsFirstNameOk] = useState(true)
	const [isLastNameOk, setIsLastNameOk] = useState(true)
	const [isEmailOk, setIsEmailOk] = useState(true)
	const [isPasswordOk, setIsPasswordOk] = useState(true)
	const [isConfirmPasswordOk, setIsConfirmPasswordOk] = useState(true)

	const [passwordStrength, setPasswordStrength] = useState<
		'weak' | 'medium' | 'strong' | null
	>(null)

	const [inProgress, setInProgress] = useState(false)

	const navigate = useSmartNavigate()

	const { signup, login } = useAuth()

	const params = useSmartParams('signup')

	const t = useTranslations('auth.signup')
	const tCommon = useTranslations('common')

	const calculatePasswordStrength = (pass: string): 'weak' | 'medium' | 'strong' => {
		if (pass.length < 8) return 'weak'

		let strength = 0
		if (pass.length >= 12) strength++
		if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++
		if (/[0-9]/.test(pass)) strength++
		if (/[^a-zA-Z0-9]/.test(pass)) strength++

		if (strength <= 1) return 'weak'
		if (strength <= 2) return 'medium'
		return 'strong'
	}

	const handlePasswordChange = (value: string) => {
		setPassword(value)
		if (value.length > 0) {
			setPasswordStrength(calculatePasswordStrength(value))
		} else {
			setPasswordStrength(null)
		}
	}

	const onSignupClick = () => {
		let ok = true

		// Validate first name
		if (firstName.trim() === '') {
			setIsFirstNameOk(false)
			ok = false
		} else {
			setIsFirstNameOk(true)
		}

		// Validate last name
		if (lastName.trim() === '') {
			setIsLastNameOk(false)
			ok = false
		} else {
			setIsLastNameOk(true)
		}

		// Validate email
		if (email.trim() === '') {
			setIsEmailOk(false)
			ok = false
		} else {
			setIsEmailOk(true)
		}

		// Validate password
		if (password.length < 8) {
			setIsPasswordOk(false)
			setErrorMessage(t('passwordRequirements'))
			ok = false
		} else {
			setIsPasswordOk(true)
		}

		// Validate confirm password
		if (confirmPassword !== password) {
			setIsConfirmPasswordOk(false)
			setErrorMessage(t('passwordMismatch'))
			ok = false
		} else {
			setIsConfirmPasswordOk(true)
		}

		if (!ok) return

		setInProgress(true)
		setErrorMessage('')

		signup({ email, password, firstName, lastName }, async (result) => {
			if (!result) {
				setErrorMessage(t('emailExists'))
			} else {
				await login({ email, password })
				navigate('home', {
					hledat: undefined,
				})
			}
			setInProgress(false)
		})
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
				subtitle={t('subtitle')}
			>
				<Box
					display={'flex'}
					flexDirection={'column'}
					gap={1}
					width={'100%'}
					paddingBottom={2}
				>
					<Box display={'flex'} flexDirection={'row'} justifyContent={'center'}>
						<GoogleLoginButton />
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
									placeholder={t('enterFirstName')}
									error={!isFirstNameOk}
								/>
								<TextInput
									required
									title={t('lastName')}
									value={lastName}
									onChange={(m) => setLastName(m)}
									disabled={inProgress}
									placeholder={t('enterLastName')}
									error={!isLastNameOk}
								/>
							</Box>
							<TextInput
								required
								title={t('email')}
								value={email}
								onChange={(m) => setEmail(m)}
								type="email"
								disabled={inProgress}
								placeholder={t('enterEmail')}
								error={!isEmailOk}
							/>
							<Box>
								<TextInput
									required
									title={t('password')}
									value={password}
									onChange={(m) => handlePasswordChange(m)}
									type="password"
									disabled={inProgress}
									placeholder={t('enterPassword')}
									error={!isPasswordOk}
								/>
								{password.length > 0 && (
									<Box display={'flex'} flexDirection={'row'} gap={1} mt={0.5}>
										<Typography size={'0.8rem'} color={'grey.600'}>
											{t('passwordRequirements')}
										</Typography>
										{passwordStrength && (
											<Typography
												size={'0.8rem'}
												color={
													passwordStrength === 'strong'
														? 'green'
														: passwordStrength === 'medium'
														? 'orange'
														: 'red'
												}
												strong={'bold'}
											>
												{passwordStrength === 'strong'
													? t('passwordStrong')
													: passwordStrength === 'medium'
													? t('passwordMedium')
													: t('passwordWeak')}
											</Typography>
										)}
									</Box>
								)}
							</Box>
							<TextInput
								required
								title={t('confirmPassword')}
								value={confirmPassword}
								onChange={(m) => setConfirmPassword(m)}
								type="password"
								disabled={inProgress}
								placeholder={t('enterConfirmPassword')}
								error={!isConfirmPasswordOk}
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
					</form>
				</Box>
			</StandaloneCard>
			<Gap value={5} />
		</Box>
	)
	// return (
	// 	<Box>
	// 		<Box
	// 			flex={1}
	// 			display={'flex'}
	// 			justifyContent={'center'}
	// 			alignItems={'center'}
	// 		>
	// 			<StyledContainer>
	// 				<Box display={'flex'} flexDirection={'row'}>
	// 					<Typography variant={'h5'} strong={'bold'} flex={1}>
	// 						Nová ovce
	// 					</Typography>
	// 				</Box>
	// 				<Gap />
	// 				{errorMessage != '' && (
	// 					<>
	// 						<Typography variant="subtitle2" color={'red'}>
	// 							{errorMessage}
	// 						</Typography>
	// 						<Gap />
	// 					</>
	// 				)}
	// 				<form
	// 					onSubmit={(e) => {
	// 						e.preventDefault()
	// 						onSignupClick()
	// 					}}
	// 				>
	// 					<Typography variant="subtitle2">Křestní jméno</Typography>
	// 					<TextField
	// 						size="small"
	// 						fullWidth
	// 						value={firstName}
	// 						onChange={onFirstNameChange}
	// 						error={!isFirstNameOk}
	// 						helperText={firstNameMessage}
	// 					/>
	// 					<Gap />
	// 					<Typography variant="subtitle2">Příjmení</Typography>
	// 					<TextField
	// 						size="small"
	// 						fullWidth
	// 						value={lastName}
	// 						onChange={onLastNameChange}
	// 						error={!isLastNameOk}
	// 						helperText={lastNameMessage}
	// 					/>
	// 					<Gap />
	// 					<Typography variant="subtitle2">Email</Typography>
	// 					<TextField
	// 						size="small"
	// 						fullWidth
	// 						value={email}
	// 						onChange={onEmailChange}
	// 						error={!isEmailOk}
	// 						helperText={emailMessage}
	// 						type="email"
	// 					/>
	// 					<Gap />
	// 					<Typography variant="subtitle2">Heslo</Typography>
	// 					<TextField
	// 						size="small"
	// 						fullWidth
	// 						value={password}
	// 						onChange={onPasswordChange}
	// 						error={!isPasswordOk}
	// 						helperText={passwordMessage}
	// 						type="password"
	// 					/>
	// 					<Gap />

	// 					<Button type="submit">
	// 						Vytvořit účet
	// 						{inProgress && (
	// 							<CircularProgress
	// 								color={'inherit'}
	// 								size={16}
	// 								sx={{ marginLeft: 1 }}
	// 							/>
	// 						)}
	// 					</Button>
	// 				</form>

	// 				<Gap value={2} />
	// 				<Box
	// 					sx={{
	// 						display: 'flex',
	// 						flexDirection: 'row',
	// 						alignItems: 'center',
	// 						justifyContent: 'end',
	// 					}}
	// 				>
	// 					<GoogleLoginButton />
	// 				</Box>
	// 			</StyledContainer>
	// 		</Box>
	// 	</Box>
	// )
}
