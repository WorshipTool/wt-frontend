'use client'
import { MOBILE_NAV_BREAKPOINT } from '@/common/components/MobileAppTabBar/nav.constants'
import { Box, Image } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import { getAssetUrl } from '@/tech/paths.tech'
import { useTranslations } from 'next-intl'

const Bg = styled(Box)(({ theme }) => ({
	// The app's canvas, on every layout, and it is not the same grey at every
	// width. A phone is nearly all card, and the shell's own surface is light
	// (grey.50), so a darker ground only shows as a rim. A desktop is mostly
	// ground, and the white cards need something to sit on — so from the width
	// the phone shell stops at, the canvas goes back to the grey it always was.
	background: `linear-gradient(160deg, ${theme.palette.grey[100]}, ${theme.palette.grey[200]})`,
	[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
		background: `linear-gradient(160deg, ${theme.palette.grey[200]}, ${theme.palette.grey[300]})`,
	},
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
