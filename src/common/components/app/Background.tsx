'use client'
import { Box, Image } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import { getAssetUrl } from '@/tech/paths.tech'
import { useTranslations } from 'next-intl'

const Bg = styled(Box)(({ theme }) => ({
	background: `linear-gradient(170deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[200]} 50%, ${theme.palette.grey[300]} 100%)`,
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
				sizes="100vw"
				style={{
					filter: 'brightness(0.8) contrast(1.3)',
					opacity: 0.04,
				}}
			/>
		</Bg>
	)
}
