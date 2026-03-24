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
			staggerChildren: 0.12,
			delayChildren: 0.1,
		},
	},
}

const cardVariants = {
	hidden: { opacity: 0, y: 32, scale: 0.95 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.55,
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
}

function FeatureCard({
	icon,
	title,
	description,
	buttonLabel,
	buttonTo,
	buttonVariant = 'outlined',
	buttonColor,
}: FeatureCardProps) {
	const theme = useTheme()

	return (
		<motion.div variants={cardVariants} style={{ flex: 1, minWidth: 240 }}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center',
					padding: 3,
					borderRadius: '20px',
					bgcolor: 'rgba(255, 255, 255, 0.85)',
					backdropFilter: 'blur(16px)',
					border: '1px solid',
					borderColor: 'rgba(0, 133, 255, 0.08)',
					transition:
						'box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
					'&:hover': {
						boxShadow:
							'0 12px 40px rgba(0, 133, 255, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
						transform: 'translateY(-4px)',
						borderColor: 'rgba(0, 133, 255, 0.18)',
					},
					gap: 1.5,
					height: '100%',
				}}
			>
				<Box
					sx={{
						width: 64,
						height: 64,
						borderRadius: '16px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: `linear-gradient(135deg, ${theme.palette.primary.main}18, ${theme.palette.primary.main}08)`,
						color: 'primary.main',
						fontSize: '2rem',
					}}
				>
					{cloneElement(icon, { sx: { fontSize: 'inherit' } })}
				</Box>

				<Typography variant="h5" strong>
					{title}
				</Typography>

				<Typography
					variant="h6"
					color="grey.600"
					sx={{ textWrap: 'pretty', flex: 1 }}
				>
					{description}
				</Typography>

				<Button
					size="small"
					variant={buttonVariant}
					color={buttonColor as any}
					to={buttonTo as any}
					sx={{ mt: 0.5 }}
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
						background: `linear-gradient(135deg, ${theme.palette.grey[700]}, ${theme.palette.primary.dark})`,
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						backgroundClip: 'text',
						letterSpacing: '0.02em',
					}}
				>
					{tHome('features.title')}
				</Typography>
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
					/>
					<FeatureCard
						icon={<Groups2 />}
						title={tAbout('tools.teams.title')}
						description={tAbout('tools.teams.description')}
						buttonLabel={tAbout('tools.teams.learnMore')}
						buttonTo="teams"
						buttonVariant="contained"
						buttonColor="primarygradient"
					/>
					<FeatureCard
						icon={<LibraryMusic />}
						title={tAbout('tools.playlists.title')}
						description={tAbout('tools.playlists.description')}
						buttonLabel={tAbout('tools.playlists.tryIt')}
						buttonTo="usersPlaylists"
					/>
				</Box>
			</motion.div>
		</ContainerGrid>
	)
}
