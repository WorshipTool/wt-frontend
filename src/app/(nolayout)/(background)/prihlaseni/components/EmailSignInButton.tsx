'use client'

import { Box } from '@/common/ui'
import { MailOutlineRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

type EmailSignInButtonProps = {
	onClick: () => void
}

/**
 * "Continue with e-mail" button styled to sit next to the Google sign-in
 * button: white, light hairline border, regular-weight softened label, 40px
 * tall, 300px wide, flat at rest with a subtle hover shadow.
 */
export default function EmailSignInButton({ onClick }: EmailSignInButtonProps) {
	const t = useTranslations('auth.login')

	return (
		<Box sx={{ display: 'flex', justifyContent: 'center' }}>
			<Box
				component="button"
				type="button"
				onClick={onClick}
				sx={{
					width: 300,
					maxWidth: '100%',
					height: 40,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 1.25,
					paddingX: 1.5,
					bgcolor: 'background.paper',
					color: 'grey.800',
					border: '1px solid',
					borderColor: 'grey.300',
					borderRadius: 1,
					boxShadow: 'none',
					fontFamily: 'inherit',
					fontSize: '0.875rem',
					fontWeight: 400,
					letterSpacing: '0.25px',
					whiteSpace: 'nowrap',
					cursor: 'pointer',
					transition: 'box-shadow 0.218s ease, background-color 0.218s ease',
					'&:hover': {
						boxShadow:
							'0 1px 2px 0 rgba(60,64,67,0.20), 0 1px 3px 1px rgba(60,64,67,0.10)',
					},
					'&:active': { bgcolor: 'grey.100' },
				}}
			>
				<MailOutlineRounded sx={{ fontSize: 18, color: 'grey.600' }} />
				{t('continueWithEmail')}
			</Box>
		</Box>
	)
}
