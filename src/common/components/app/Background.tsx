'use client'
import { Box, Image } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import { getAssetUrl } from '@/tech/paths.tech'
import { useTranslations } from 'next-intl'

const Bg = styled(Box)(({ theme }) => ({
	// The app's canvas, on every layout. It used to be grey.200 → grey.300,
	// which read as a middling grey against the white cards; grey.50 → grey.100
	// went the other way and left the page looking like bare paper. One step
	// darker than that: light enough that a card still sits on a pale ground,
	// dark enough that the card has an edge to sit on.
	background: `linear-gradient(160deg, ${theme.palette.grey[100]}, ${theme.palette.grey[200]})`,
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
