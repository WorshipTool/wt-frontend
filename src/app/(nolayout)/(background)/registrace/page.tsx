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
	const [errorMessage, setErrorMessage] = useState('')

	const [inProgress, setInProgress] = useState(false)

	const navigate = useSmartNavigate()

	const { signup, login } = useAuth()

	const params = useSmartParams('signup')

	const t = useTranslations('auth.signup')
	const tCommon = useTranslations('common')

	const onSignupClick = () => {
		setInProgress(true)

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
