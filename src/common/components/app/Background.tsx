'use client'
import { Box, Image } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import { getAssetUrl } from '@/tech/paths.tech'
import { useTranslations } from 'next-intl'

const Bg = styled(Box)(({ theme }) => ({
	// The app's canvas: a light grey with a soft fall-off, so the white cards
	// (surface.card) on it read as cards. See common/constants/surfaces.
	background: `linear-gradient(160deg, ${theme.palette.surface.canvas}, ${theme.palette.grey[200]})`,
	position: 'fixed',
	width: '100%',
	top: 0,
	bottom: 0,
	zIndex: -100,
}))

export const Background = () => {
	const t = useTranslations('common')
	
	return (
		<Bg>
			<Image
				src={getAssetUrl('wool-bg.webp')}
				alt={t('backgroundAlt')}
				fill
				loading="eager"
				sizes="100vw"
				style={{
					filter: 'brightness(0.7) contrast(1.5)',
					opacity: 0.05,
				}}
			/>
		</Bg>
	)
}
