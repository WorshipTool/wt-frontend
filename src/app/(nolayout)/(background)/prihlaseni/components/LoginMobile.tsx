'use client'

import EmailSignInButton from '@/app/(nolayout)/(background)/prihlaseni/components/EmailSignInButton'
import GoogleLoginButton from '@/app/(nolayout)/(background)/prihlaseni/components/GoogleLoginButton'
import SvgIcon from '@/assets/icon.svg'
import { MOBILE_NAV_CLEARANCE } from '@/common/components/MobileAppTabBar/nav.constants'
import { Box, Typography } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { TextInput } from '@/common/ui/TextInput'
import { useTranslations } from 'next-intl'

type LoginMobileProps = {
	email: string
	password: string
	onEmailChange: (value: string) => void
	onPasswordChange: (value: string) => void
	isEmailOk: boolean
	isPasswordOk: boolean
	inProgress: boolean
	errorMessage: string
	message?: string
	previousPage?: string
	showEmailForm: boolean
	onUseEmail: () => void
	onSubmit: () => void
	onForgotPassword: () => void
	onGoogleLogin: () => void
}

/**
 * Native-feeling mobile login: a full-screen light sheet with the brand and
 * sign-in options centred vertically in the space above the docked sign-up
 * link, so the screen reads balanced rather than top-heavy. The desktop card
 * layout stays in page.tsx; this component owns the phone view.
 */
export default function LoginMobile(props: LoginMobileProps) {
	const t = useTranslations('auth.login')
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
				// room for the tab bar this screen now sits under — see
				// OWNS_BOTTOM_CLEARANCE: the bar skips its own spacer here, because a
				// sheet sized to the viewport would just become scrollable by it
				paddingBottom: MOBILE_NAV_CLEARANCE,
			}}
		>
			{/* brand + sign-in options, centred in the space above the footer */}
			<Box
				sx={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					gap: 4,
				}}
			>
				{/* brand: plain logo mark + welcome */}
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 1.5,
					}}
				>
					<Box sx={{ color: 'grey.900', display: 'flex' }}>
						<SvgIcon height={52} />
					</Box>
					<Typography variant="h4" strong={800} align="center">
						{t('title')}
					</Typography>
					<Typography color="grey.600" align="center">
						{props.message || t('subtitle')}
					</Typography>
				</Box>

				{/* sign-in options */}
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: 2.5,
					}}
				>
					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<GoogleLoginButton afterLogin={props.onGoogleLogin} />
					</Box>

					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
						}}
					>
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

					{/* email/password stays hidden behind a button until chosen, so the
					    two sign-in options (Google / e-mail) read as equal choices */}
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
								title={t('email')}
								value={props.email}
								onChange={props.onEmailChange}
								error={!props.isEmailOk}
								disabled={props.inProgress}
								type="email"
								placeholder={t('enterEmail')}
								autoFocus
								required
							/>
							<TextInput
								title={t('password')}
								value={props.password}
								onChange={props.onPasswordChange}
								error={!props.isPasswordOk}
								disabled={props.inProgress}
								type="password"
								placeholder={t('enterPassword')}
								required
							/>
							<Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: -1 }}>
								<Button
									size="small"
									variant="text"
									color="grey.600"
									onClick={props.onForgotPassword}
								>
									{t('forgotPassword')}
								</Button>
							</Box>
							<Button
								type="submit"
								loading={props.inProgress}
								variant="contained"
								color="primarygradient"
								size="large"
								sx={{ width: '100%' }}
							>
								{t('loginButton')}
							</Button>
						</Box>
					)}
				</Box>
			</Box>

			{/* footer: sign-up link docked at the bottom */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Typography size={'0.9rem'} color="grey.700">
					{t('noAccount')}
				</Typography>
				<Button
					size="small"
					variant="text"
					to="signup"
					toParams={{ previousPage: props.previousPage }}
				>
					{t('createAccount')}
				</Button>
			</Box>
		</Box>
	)
}
