'use client'
import { Box, Image } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import { getAssetUrl } from '@/tech/paths.tech'
import { useTranslations } from 'next-intl'

const Bg = styled(Box)(({ theme }) => ({
	background: `linear-gradient(160deg, ${theme.palette.grey[200]}, ${theme.palette.grey[300]})`,
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
				src={getAssetUrl('wool-bg.png')}
				alt={t('backgroundAlt')}
				fill
				style={{
					filter: 'brightness(0.7) contrast(1.5)',
					opacity: 0.05,
				}}
			/>
		</Bg>
	)
}
