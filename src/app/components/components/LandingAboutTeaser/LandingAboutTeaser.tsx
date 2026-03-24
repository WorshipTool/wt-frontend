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
	hidden: { opacity: 0, y: 36 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
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
						borderRadius: '24px',
						bgcolor: 'rgba(255, 255, 255, 0.88)',
						backdropFilter: 'blur(20px)',
						border: '1px solid',
						borderColor: 'rgba(0, 133, 255, 0.06)',
						boxShadow:
							'0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02)',
						overflow: 'hidden',
						position: 'relative',
					}}
				>
					{/* Subtle decorative gradient in background */}
					<Box
						sx={{
							position: 'absolute',
							top: '-30%',
							right: '-10%',
							width: 300,
							height: 300,
							borderRadius: '50%',
							background: `radial-gradient(circle, ${theme.palette.primary.main}10 0%, transparent 70%)`,
							pointerEvents: 'none',
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
								background: `linear-gradient(135deg, ${theme.palette.grey[800]}, ${theme.palette.primary.dark})`,
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								backgroundClip: 'text',
							}}
						>
							{tHome('aboutTeaser.title')}
						</Typography>
						<Typography
							variant="h5"
							color="grey.600"
							sx={{ maxWidth: 450, textWrap: 'pretty' }}
						>
							{tAbout('description')}
						</Typography>
						<Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
							<Button
								variant="contained"
								color="primarygradient"
								size="small"
								to="about"
							>
								{tHome('aboutTeaser.learnMore')}
							</Button>
							<Button
								variant="outlined"
								size="small"
								to="contact"
							>
								{tHome('aboutTeaser.contact')}
							</Button>
						</Box>
					</Box>

					{/* Sheep illustration */}
					{!isMobile && (
						<Box
							sx={{
								position: 'relative',
								width: 140,
								height: 140,
								flexShrink: 0,
								zIndex: 1,
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
