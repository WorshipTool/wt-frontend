'use client'
import { Box, Image } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import { getAssetUrl } from '@/tech/paths.tech'
import { useTranslations } from 'next-intl'

const Bg = styled(Box)(({ theme }) => ({
	// The app's canvas, on every layout. Light, the way the phone shell's own
	// surface is (grey.50) — the two used to disagree, so the same white card
	// sat on a pale ground on a phone and a middling grey one on a desktop. The
	// gradient stays, a whole two steps of it, so the page still has a top and a
	// bottom without the corner going dark.
	background: `linear-gradient(160deg, ${theme.palette.grey[50]}, ${theme.palette.grey[100]})`,
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
