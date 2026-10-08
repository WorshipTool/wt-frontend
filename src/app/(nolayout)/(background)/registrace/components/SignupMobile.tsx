'use client'

import EmailSignInButton from '@/app/(nolayout)/(background)/prihlaseni/components/EmailSignInButton'
import GoogleLoginButton from '@/app/(nolayout)/(background)/prihlaseni/components/GoogleLoginButton'
import SvgIcon from '@/assets/icon.svg'
import { MOBILE_NAV_CLEARANCE } from '@/common/components/MobileAppTabBar/nav.constants'
import { Box, Typography } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { TextInput } from '@/common/ui/TextInput'
import { useTranslations } from 'next-intl'

type SignupMobileProps = {
	firstName: string
	lastName: string
	email: string
	password: string
	onFirstNameChange: (value: string) => void
	onLastNameChange: (value: string) => void
	onEmailChange: (value: string) => void
	onPasswordChange: (value: string) => void
	inProgress: boolean
	errorMessage: string
	previousPage?: string
	showEmailForm: boolean
	onUseEmail: () => void
	onSubmit: () => void
	onGoogleSignup: () => void
}

/**
 * Native-feeling mobile sign-up: mirrors LoginMobile — a full-screen light
 * sheet with the brand and sign-up options centred above the docked sign-in
 * link. Google and e-mail read as two equal options (e-mail form stays hidden
 * behind a button until chosen); the name fields stack full-width. The desktop
 * card layout stays in page.tsx; this component owns the phone view.
 */
export default function SignupMobile(props: SignupMobileProps) {
	const t = useTranslations('auth.signup')
	const tCommon = useTranslations('common')

	return (
		<Box
			sx={{
				width: '100%',
				boxSizing: 'border-box',
				minHeight: '100dvh',
				bgcolor: 'background.paper',
				display: 'flex',
				flexDirection: 'column',
				paddingX: 3,
				paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
				// room for the tab bar — see the login sheet
				paddingBottom: MOBILE_NAV_CLEARANCE,
			}}
		>
			{/* brand + sign-up options, centred in the space above the footer */}
			<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
				{/* brand: plain logo mark + welcome */}
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
					<Box sx={{ color: 'grey.900', display: 'flex' }}>
						<SvgIcon height={52} />
					</Box>
					<Typography variant="h4" strong={800} align="center">
						{t('title')}
					</Typography>
					<Typography color="grey.600" align="center">
						{t('subtitle')}
					</Typography>
				</Box>

				{/* sign-up options */}
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<GoogleLoginButton afterLogin={props.onGoogleSignup} />
					</Box>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Box sx={{ flex: 1, height: '1px', bgcolor: 'grey.300' }} />
						<Typography small color="grey.600">
							{tCommon('or')}
						</Typography>
						<Box sx={{ flex: 1, height: '1px', bgcolor: 'grey.300' }} />
					</Box>

					{props.errorMessage !== '' && (
						<Typography color="error" align="center" small>
							{props.errorMessage}
						</Typography>
					)}

					{/* e-mail form stays hidden behind a button until chosen, so Google and
					    e-mail read as two equal sign-up options */}
					{!props.showEmailForm ? (
						<EmailSignInButton onClick={props.onUseEmail} />
					) : (
						<Box
							component="form"
							onSubmit={(e) => {
								e.preventDefault()
								props.onSubmit()
							}}
							sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
						>
							<TextInput
								title={t('firstName')}
								value={props.firstName}
								onChange={props.onFirstNameChange}
								disabled={props.inProgress}
								autoFocus
								required
							/>
							<TextInput
								title={t('lastName')}
								value={props.lastName}
								onChange={props.onLastNameChange}
								disabled={props.inProgress}
								required
							/>
							<TextInput
								title={t('email')}
								value={props.email}
								onChange={props.onEmailChange}
								type="email"
								disabled={props.inProgress}
								required
							/>
							<TextInput
								title={t('password')}
								value={props.password}
								onChange={props.onPasswordChange}
								type="password"
								disabled={props.inProgress}
								required
							/>
							<Button
								type="submit"
								loading={props.inProgress}
								variant="contained"
								color="primarygradient"
								size="large"
								sx={{ width: '100%' }}
							>
								{t('signupButton')}
							</Button>
						</Box>
					)}
				</Box>
			</Box>

			{/* footer: sign-in link docked at the bottom */}
			<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
				<Typography size={'0.9rem'} color="grey.700">
					{t('haveAccount')}
				</Typography>
				<Button size="small" variant="text" to="login" toParams={{ previousPage: props.previousPage }}>
					{t('login')}
				</Button>
			</Box>
		</Box>
	)
}
