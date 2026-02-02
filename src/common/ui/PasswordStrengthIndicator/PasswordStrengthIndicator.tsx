import { Box } from '@/common/ui/Box'
import { Typography } from '@/common/ui/Typography'
import { useTranslations } from 'next-intl'

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

interface PasswordStrengthIndicatorProps {
	password: string
}

function calculatePasswordStrength(password: string): PasswordStrength {
	if (password.length === 0) return 'weak'

	let score = 0

	// Length check
	if (password.length >= 6) score++
	if (password.length >= 10) score++
	if (password.length >= 14) score++

	// Character variety checks
	if (/[a-z]/.test(password)) score++ // lowercase
	if (/[A-Z]/.test(password)) score++ // uppercase
	if (/[0-9]/.test(password)) score++ // numbers
	if (/[^a-zA-Z0-9]/.test(password)) score++ // special chars

	// Determine strength based on score
	if (score <= 2) return 'weak'
	if (score <= 4) return 'fair'
	if (score <= 6) return 'good'
	return 'strong'
}

function getStrengthColor(strength: PasswordStrength): string {
	switch (strength) {
		case 'weak':
			return '#d32f2f' // red
		case 'fair':
			return '#f57c00' // orange
		case 'good':
			return '#fbc02d' // yellow
		case 'strong':
			return '#388e3c' // green
	}
}

function getStrengthWidth(strength: PasswordStrength): string {
	switch (strength) {
		case 'weak':
			return '25%'
		case 'fair':
			return '50%'
		case 'good':
			return '75%'
		case 'strong':
			return '100%'
	}
}

export function PasswordStrengthIndicator({
	password,
}: PasswordStrengthIndicatorProps) {
	const t = useTranslations('auth.passwordStrength')

	if (password.length === 0) {
		return null
	}

	const strength = calculatePasswordStrength(password)
	const color = getStrengthColor(strength)
	const width = getStrengthWidth(strength)

	return (
		<Box display="flex" flexDirection="column" gap={0.5} marginTop={1}>
			<Box
				sx={{
					width: '100%',
					height: '4px',
					backgroundColor: 'grey.200',
					borderRadius: '2px',
					overflow: 'hidden',
				}}
			>
				<Box
					sx={{
						width: width,
						height: '100%',
						backgroundColor: color,
						transition: 'width 0.3s ease, background-color 0.3s ease',
					}}
				/>
			</Box>
			<Typography
				size="0.75rem"
				sx={{
					color: color,
					fontWeight: 500,
				}}
			>
				{t(strength)}
			</Typography>
		</Box>
	)
}
