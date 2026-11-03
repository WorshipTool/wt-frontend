'use client'

import { ParserCreateTile } from '@/app/(layout)/vytvorit/components/createOptions'
import { MOBILE_NAV_BREAKPOINT } from '@/common/components/MobileAppTabBar/nav.constants'
import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { Box, Clickable, Typography } from '@/common/ui'
import { useTranslations } from 'next-intl'

type CreateTileProps = {
	tile: ParserCreateTile
	onClick: () => void
}

/**
 * One tile of the create menu: a title, a one-line description and an
 * oversized icon cropped by the bottom-right corner. The highlighted tile wears
 * the brand gradient (the hero-CTA gradient of `Button color="primarygradient"`)
 * with white text; the others are plain house cards with a grey icon, so the
 * one blue thing on the screen is the most common way in.
 */
export default function CreateTile({ tile, onClick }: CreateTileProps) {
	const t = useTranslations('upload.import.tiles')
	const Icon = tile.icon
	const hl = tile.highlighted

	return (
		<Clickable style={{ height: '100%' }}>
			<Box
				component="button"
				type="button"
				onClick={onClick}
				sx={(theme) => ({
					...SURFACE_CARD_SX,
					position: 'relative',
					overflow: 'hidden',
					width: '100%',
					height: '100%',
					minHeight: hl ? 160 : 132,
					padding: 2,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'flex-start',
					textAlign: 'left',
					font: 'inherit',
					cursor: 'pointer',
					color: 'text.primary',
					'&:focus-visible': {
						outline: `2px solid ${theme.palette.primary.main}`,
						outlineOffset: 2,
					},
					'&:hover .create-tile-art': {
						transform: 'rotate(-3deg) scale(1.06)',
					},
					...(hl && {
						background: `linear-gradient(115deg, ${theme.palette.primary.main} 10%, ${theme.palette.primary.dark})`,
						borderColor: 'transparent',
						color: 'primary.contrastText',
					}),
					[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { minHeight: 170 },
				})}
			>
				<Box
					sx={{
						position: 'relative',
						zIndex: 1,
						display: 'flex',
						flexDirection: 'column',
						gap: 0.25,
						maxWidth: '75%',
					}}
				>
					<Typography strong={700} color="inherit">
						{t(tile.titleKey)}
					</Typography>
					<Typography
						small
						color={hl ? 'inherit' : 'grey.600'}
						sx={hl ? { opacity: 0.85 } : undefined}
					>
						{t(tile.subtitleKey)}
					</Typography>
				</Box>
				<Icon
					aria-hidden
					className="create-tile-art"
					sx={(theme) => ({
						position: 'absolute',
						right: theme.spacing(-2),
						bottom: theme.spacing(-2.5),
						fontSize: hl ? 128 : 100,
						color: hl ? 'primary.contrastText' : 'grey.300',
						opacity: hl ? 0.24 : 1,
						transform: 'rotate(-10deg)',
						transition: 'transform 0.3s',
						pointerEvents: 'none',
						[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { fontSize: 112 },
					})}
				/>
			</Box>
		</Clickable>
	)
}
