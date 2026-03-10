import { Background } from '@/common'
import { Z_INDEX } from '@/common/constants/zIndex'
import { Box, CircularProgress, Image } from '@/common/ui'
import { useTranslations } from 'next-intl'
import './team.loading.styles.css'

type TeamLoadingScreenProps = {
	isVisible: boolean
	teamTitle?: string
	teamLogoUrl?: string
}

export default function TeamLoadingScreen({
	isVisible,
	...props
}: TeamLoadingScreenProps) {
	const t = useTranslations('teams.loading')

	return (
		<div
			style={{
				position: 'fixed',
				zIndex: Z_INDEX.LOADING,
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				opacity: isVisible ? 1 : 0,
				pointerEvents: isVisible ? 'all' : 'none',
				transition: 'opacity 0.2s',
			}}
		>
			<Background />
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100%',
					flexDirection: 'row',
					gap: 2,
				}}
			>
				{props.teamLogoUrl ? (
					<Box className={'logo-image'}>
						<Image src={props.teamLogoUrl} alt={t('logoAlt')} />
					</Box>
				) : (
					<Box>
						<CircularProgress />
					</Box>
				)}
			</Box>
		</div>
	)
}
