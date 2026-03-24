'use client'

import ContainerGrid from '@/common/components/ContainerGrid'
import { Box, Typography, useTheme } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { useMediaQuery } from '@/common/ui/mui'
import { getAssetUrl } from '@/tech/paths.tech'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const teaserVariants = {
	hidden: { opacity: 0, y: 50, scale: 0.95 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.7,
			ease: [0.16, 1, 0.3, 1],
		},
	},
}

export default function LandingAboutTeaser() {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down(700))
	const tHome = useTranslations('home')
	const tAbout = useTranslations('about')

	return (
		<ContainerGrid sx={{ width: '100%', mt: 3, mb: 6 }}>
			<motion.div
				variants={teaserVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-40px' }}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: isMobile ? 'column' : 'row',
						alignItems: 'center',
						gap: isMobile ? 3 : 5,
						padding: isMobile ? 3 : 4,
						borderRadius: '8px',
						bgcolor: 'rgba(14, 14, 26, 0.8)',
						backdropFilter: 'blur(20px)',
						border: '1px solid rgba(123, 47, 255, 0.2)',
						boxShadow: '0 0 30px rgba(123, 47, 255, 0.08), 0 0 60px rgba(0, 229, 255, 0.04)',
						overflow: 'hidden',
						position: 'relative',
						'&::before': {
							content: '""',
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							height: '1px',
							background: 'linear-gradient(90deg, transparent, #7b2fff, #00e5ff, transparent)',
						},
						'&::after': {
							content: '""',
							position: 'absolute',
							bottom: 0,
							left: 0,
							right: 0,
							height: '1px',
							background: 'linear-gradient(90deg, transparent, #ff00e5, #7b2fff, transparent)',
						},
					}}
				>
					{/* Corner decorations */}
					<Box
						sx={{
							position: 'absolute',
							top: 8,
							left: 8,
							width: 16,
							height: 16,
							borderTop: '2px solid #00e5ff',
							borderLeft: '2px solid #00e5ff',
							opacity: 0.6,
						}}
					/>
					<Box
						sx={{
							position: 'absolute',
							bottom: 8,
							right: 8,
							width: 16,
							height: 16,
							borderBottom: '2px solid #ff00e5',
							borderRight: '2px solid #ff00e5',
							opacity: 0.6,
						}}
					/>

					{/* Background glow */}
					<Box
						sx={{
							position: 'absolute',
							top: '-40%',
							right: '-15%',
							width: 350,
							height: 350,
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(123, 47, 255, 0.1) 0%, transparent 70%)',
							pointerEvents: 'none',
							animation: 'landing-pulse-glow 5s ease-in-out infinite',
						}}
					/>

					{/* Text content */}
					<Box
						sx={{
							flex: 1,
							display: 'flex',
							flexDirection: 'column',
							gap: 1.5,
							zIndex: 1,
						}}
					>
						<Typography
							variant="h4"
							strong
							sx={{
								fontFamily: 'var(--font-orbitron)',
								letterSpacing: '0.06em',
								textTransform: 'uppercase',
								color: '#e8e8ff',
								textShadow: '0 0 20px rgba(123, 47, 255, 0.3)',
							}}
						>
							{tHome('aboutTeaser.title')}
						</Typography>
						<Typography
							variant="h5"
							sx={{
								maxWidth: 450,
								textWrap: 'pretty',
								fontFamily: 'var(--font-jetbrains)',
								color: '#8888aa',
								lineHeight: 1.7,
							}}
						>
							{tAbout('description')}
						</Typography>
						<Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
							<Button
								variant="contained"
								color="primarygradient"
								size="small"
								to="about"
								sx={{
									fontFamily: 'var(--font-orbitron)',
									letterSpacing: '0.08em',
									boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)',
								}}
							>
								{tHome('aboutTeaser.learnMore')}
							</Button>
							<Button
								variant="outlined"
								size="small"
								to="contact"
								sx={{
									fontFamily: 'var(--font-orbitron)',
									letterSpacing: '0.08em',
									borderColor: 'rgba(255, 0, 229, 0.4)',
									color: '#ff00e5',
									'&:hover': {
										borderColor: '#ff00e5',
										boxShadow: '0 0 15px rgba(255, 0, 229, 0.3)',
										backgroundColor: 'rgba(255, 0, 229, 0.08)',
									},
								}}
							>
								{tHome('aboutTeaser.contact')}
							</Button>
						</Box>
					</Box>

					{/* Sheep illustration with neon filter */}
					{!isMobile && (
						<Box
							sx={{
								position: 'relative',
								width: 140,
								height: 140,
								flexShrink: 0,
								zIndex: 1,
								filter: 'drop-shadow(0 0 12px rgba(0, 229, 255, 0.4)) hue-rotate(180deg) brightness(1.2)',
							}}
						>
							<Image
								src={getAssetUrl('sheeps/ovce3.svg')}
								alt={tAbout('graphics.sheepAlt')}
								fill
								style={{ objectFit: 'contain' }}
							/>
						</Box>
					)}
				</Box>
			</motion.div>
		</ContainerGrid>
	)
}
