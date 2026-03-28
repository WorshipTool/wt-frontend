'use client'

import { Box, Typography } from '@/common/ui'
import { useTheme } from '@/common/ui'
import { useMediaQuery } from '@/common/ui/mui'
import useWorshipCzVersion from '@/hooks/worshipcz/useWorshipCzVersion'
import { styled } from '@mui/system'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import HomeSearchBar from './HomeSearchBar'

const HeroWrapper = styled(Box)({
	position: 'relative',
	width: '100%',
	overflow: 'hidden',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	minHeight: '420px',
})

const HeroBackground = styled(Box)({
	position: 'absolute',
	inset: 0,
	zIndex: 0,
	background: `
		radial-gradient(ellipse 80% 60% at 20% 80%, rgba(0, 133, 255, 0.08) 0%, transparent 60%),
		radial-gradient(ellipse 60% 50% at 80% 20%, rgba(83, 46, 231, 0.06) 0%, transparent 60%),
		radial-gradient(ellipse 70% 40% at 50% 50%, rgba(235, 188, 30, 0.04) 0%, transparent 60%),
		linear-gradient(180deg, #fafbfd 0%, #f4f6fa 100%)
	`,
})

const GlowOrb = styled(motion.div)({
	position: 'absolute',
	borderRadius: '50%',
	filter: 'blur(80px)',
	opacity: 0.4,
	pointerEvents: 'none',
})

const HeroContent = styled(Box)({
	position: 'relative',
	zIndex: 1,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	textAlign: 'center',
	width: '100%',
	maxWidth: 720,
	padding: '0 24px',
})

type HeroSectionProps = {
	searchValue: string
	onSearchChange: (value: string) => void
	smartSearch: boolean
	onSmartSearchChange: (value: boolean) => void
}

export default function HeroSection({
	searchValue,
	onSearchChange,
	smartSearch,
	onSmartSearchChange,
}: HeroSectionProps) {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down(700))
	const tHome = useTranslations('home')
	const useWorshipVersion = useWorshipCzVersion()

	const heroLead = tHome('hero.lead')
	const heroTitle = tHome('hero.title')
	const heroSubtitle = tHome('hero.subtitle')

	return (
		<HeroWrapper
			sx={{
				pt: isMobile ? 10 : 14,
				pb: isMobile ? 6 : 10,
			}}
		>
			<HeroBackground />

			{!isMobile && (
				<>
					<GlowOrb
						style={{
							width: 300,
							height: 300,
							background: 'rgba(0, 133, 255, 0.12)',
							top: '-5%',
							left: '10%',
						}}
						animate={{
							x: [0, 30, 0],
							y: [0, -20, 0],
						}}
						transition={{
							duration: 12,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					/>
					<GlowOrb
						style={{
							width: 250,
							height: 250,
							background: 'rgba(83, 46, 231, 0.1)',
							bottom: '10%',
							right: '5%',
						}}
						animate={{
							x: [0, -25, 0],
							y: [0, 15, 0],
						}}
						transition={{
							duration: 15,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					/>
					<GlowOrb
						style={{
							width: 200,
							height: 200,
							background: 'rgba(235, 188, 30, 0.08)',
							top: '40%',
							right: '30%',
						}}
						animate={{
							x: [0, 15, 0],
							y: [0, 25, 0],
						}}
						transition={{
							duration: 18,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					/>
				</>
			)}

			<HeroContent>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<Typography
						variant="h5"
						color="grey.500"
						sx={{
							letterSpacing: '0.15em',
							textTransform: 'uppercase',
							mb: 1,
							fontSize: isMobile ? '0.75rem' : '0.85rem',
						}}
						strong={500}
					>
						{heroLead}
					</Typography>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<Typography
						variant={isMobile ? 'h2' : 'h1'}
						strong={800}
						sx={{
							background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
							backgroundClip: 'text',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							letterSpacing: '-0.03em',
							lineHeight: 1.1,
							mb: 1.5,
						}}
					>
						{heroTitle}
					</Typography>
				</motion.div>

				{useWorshipVersion && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<Typography
							color="grey.500"
							sx={{
								mb: isMobile ? 3 : 4,
								fontSize: isMobile ? '0.95rem' : '1.1rem',
								maxWidth: 400,
							}}
						>
							{heroSubtitle}
						</Typography>
					</motion.div>
				)}

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
				>
					<HomeSearchBar
						value={searchValue}
						onChange={onSearchChange}
						smartSearch={smartSearch}
						onSmartSearchChange={onSmartSearchChange}
					/>
				</motion.div>
			</HeroContent>
		</HeroWrapper>
	)
}
