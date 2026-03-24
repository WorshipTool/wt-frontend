'use client'

import ContainerGrid from '@/common/components/ContainerGrid'
import { Box, Typography, useTheme } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { useMediaQuery } from '@/common/ui/mui'
import { Groups2, LibraryMusic, SmartButton } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { cloneElement } from 'react'

const sectionVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.1,
		},
	},
}

const cardVariants = {
	hidden: { opacity: 0, y: 50, scale: 0.9, rotateX: 15 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		rotateX: 0,
		transition: {
			duration: 0.7,
			ease: [0.16, 1, 0.3, 1],
		},
	},
}

type FeatureCardProps = {
	icon: React.ReactElement
	title: string
	description: string
	buttonLabel: string
	buttonTo: string
	buttonVariant?: 'outlined' | 'contained'
	buttonColor?: string
	accentColor?: string
}

function FeatureCard({
	icon,
	title,
	description,
	buttonLabel,
	buttonTo,
	buttonVariant = 'outlined',
	buttonColor,
	accentColor = '#00e5ff',
}: FeatureCardProps) {
	return (
		<motion.div
			variants={cardVariants}
			style={{ flex: 1, minWidth: 240, perspective: '1000px' }}
			whileHover={{
				scale: 1.04,
				rotateY: 3,
				rotateX: -2,
				transition: { duration: 0.3 },
			}}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center',
					padding: 3,
					borderRadius: '8px',
					bgcolor: 'rgba(14, 14, 26, 0.8)',
					backdropFilter: 'blur(20px)',
					border: '1px solid',
					borderColor: `${accentColor}25`,
					position: 'relative',
					overflow: 'hidden',
					transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
					'&::before': {
						content: '""',
						position: 'absolute',
						inset: 0,
						background: `linear-gradient(135deg, ${accentColor}08, transparent 50%, ${accentColor}04)`,
						opacity: 0,
						transition: 'opacity 0.4s ease',
					},
					'&::after': {
						content: '""',
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: '2px',
						background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
						opacity: 0,
						transition: 'opacity 0.4s ease',
					},
					'&:hover': {
						boxShadow: `0 0 30px ${accentColor}20, 0 0 60px ${accentColor}10`,
						borderColor: `${accentColor}50`,
						'&::before': { opacity: 1 },
						'&::after': { opacity: 1 },
					},
					gap: 1.5,
					height: '100%',
				}}
			>
				<Box
					sx={{
						width: 64,
						height: 64,
						borderRadius: '8px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
						border: `1px solid ${accentColor}30`,
						color: accentColor,
						fontSize: '2rem',
						boxShadow: `0 0 20px ${accentColor}15`,
						position: 'relative',
						zIndex: 1,
					}}
				>
					{cloneElement(icon, { sx: { fontSize: 'inherit' } })}
				</Box>

				<Typography
					variant="h5"
					strong
					sx={{
						color: '#e8e8ff',
						position: 'relative',
						zIndex: 1,
						fontFamily: 'var(--font-orbitron)',
					}}
				>
					{title}
				</Typography>

				<Typography
					variant="h6"
					sx={{
						color: '#8888aa',
						textWrap: 'pretty',
						flex: 1,
						position: 'relative',
						zIndex: 1,
						fontFamily: 'var(--font-jetbrains)',
					}}
				>
					{description}
				</Typography>

				<Button
					size="small"
					variant={buttonVariant}
					color={buttonColor as any}
					to={buttonTo as any}
					sx={{
						mt: 0.5,
						position: 'relative',
						zIndex: 1,
						borderColor: `${accentColor}40`,
						color: accentColor,
						fontFamily: 'var(--font-orbitron)',
						letterSpacing: '0.08em',
						'&:hover': {
							borderColor: accentColor,
							boxShadow: `0 0 15px ${accentColor}30`,
							backgroundColor: `${accentColor}10`,
						},
					}}
				>
					{buttonLabel}
				</Button>
			</Box>
		</motion.div>
	)
}

export default function LandingFeaturesSection() {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down(700))
	const tAbout = useTranslations('about')
	const tHome = useTranslations('home')

	return (
		<ContainerGrid sx={{ width: '100%', mt: 4, mb: 2 }}>
			<Box sx={{ mb: 2 }}>
				<Typography
					variant="h5"
					strong
					sx={{
						fontFamily: 'var(--font-orbitron)',
						letterSpacing: '0.1em',
						textTransform: 'uppercase',
						color: '#00e5ff',
						textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
					}}
				>
					{tHome('features.title')}
				</Typography>
				{/* Decorative line */}
				<Box
					sx={{
						width: 60,
						height: 2,
						mt: 1,
						background: 'linear-gradient(90deg, #00e5ff, #7b2fff, transparent)',
						boxShadow: '0 0 8px rgba(0, 229, 255, 0.4)',
					}}
				/>
			</Box>

			<motion.div
				variants={sectionVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-60px' }}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: isMobile ? 'column' : 'row',
						gap: 2,
					}}
				>
					<FeatureCard
						icon={<SmartButton />}
						title={tAbout('tools.smartSearch.title')}
						description={tAbout('tools.smartSearch.description')}
						buttonLabel={tAbout('tools.smartSearch.tryIt')}
						buttonTo="home"
						accentColor="#00e5ff"
					/>
					<FeatureCard
						icon={<Groups2 />}
						title={tAbout('tools.teams.title')}
						description={tAbout('tools.teams.description')}
						buttonLabel={tAbout('tools.teams.learnMore')}
						buttonTo="teams"
						buttonVariant="contained"
						buttonColor="primarygradient"
						accentColor="#7b2fff"
					/>
					<FeatureCard
						icon={<LibraryMusic />}
						title={tAbout('tools.playlists.title')}
						description={tAbout('tools.playlists.description')}
						buttonLabel={tAbout('tools.playlists.tryIt')}
						buttonTo="usersPlaylists"
						accentColor="#ff00e5"
					/>
				</Box>
			</motion.div>
		</ContainerGrid>
	)
}
