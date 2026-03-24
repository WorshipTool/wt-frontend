'use client'

import ParseAdminOption from '@/app/(layout)/vytvorit/components/ParseAdminOption'
import MainSearchInput from '@/app/components/components/MainSearchInput'
import RecommendedSongsList from '@/app/components/components/RecommendedSongsList/RecommendedSongsList'
import RightSheepPanel from '@/app/components/components/RightSheepPanel/RightSheepPanel'
import { useFooter } from '@/common/components/Footer/hooks/useFooter'
import { useToolbar } from '@/common/components/Toolbar/hooks/useToolbar'
import { useScrollHandler } from '@/common/providers/OnScrollComponent/useScrollHandler'
import { Box, Typography, useTheme } from '@/common/ui'
import { useMediaQuery } from '@/common/ui/mui'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { useUrlState } from '@/hooks/urlstate/useUrlState'
import useWorshipCzVersion from '@/hooks/worshipcz/useWorshipCzVersion'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import ContainerGrid, {
	containerMaxWidth,
} from '../../common/components/ContainerGrid'
import FloatingAddButton from './components/FloatingAddButton'
import GlitchText from './components/GlitchText'
import LandingAboutTeaser from './components/LandingAboutTeaser/LandingAboutTeaser'
import LandingFeaturesSection from './components/LandingFeaturesSection/LandingFeaturesSection'
import SearchedSongsList from './components/SearchedSongsList'

export const RESET_HOME_SCREEN_EVENT_NAME = 'reset_home_screen_jh1a94'

const ANIMATION_DURATION = 0.25

// Staggered entrance variants - cyberpunk style with dramatic entrance
const heroContainerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.2,
		},
	},
}

const heroItemVariants = {
	hidden: { opacity: 0, y: 40, scale: 0.9, filter: 'blur(8px)' },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: 'blur(0px)',
		transition: {
			duration: 0.8,
			ease: [0.16, 1, 0.3, 1],
		},
	},
}

const searchInputVariants = {
	hidden: { opacity: 0, y: 40, scale: 0.9, filter: 'blur(8px)' },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: 'blur(0px)',
		transition: {
			duration: 0.9,
			ease: [0.16, 1, 0.3, 1],
			delay: 0.6,
		},
	},
}

// Animated neon orbs for cyberpunk background
function CyberOrbs({ visible }: { visible: boolean }) {
	return (
		<Box
			sx={{
				position: 'fixed',
				inset: 0,
				zIndex: -1,
				overflow: 'hidden',
				opacity: visible ? 1 : 0,
				transition: 'opacity 0.5s ease',
				pointerEvents: 'none',
			}}
		>
			{/* Cyan orb - top left */}
			<Box
				sx={{
					position: 'absolute',
					top: '0%',
					left: '-10%',
					width: 'min(600px, 55vw)',
					height: 'min(600px, 55vw)',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(0, 229, 255, 0.25) 0%, rgba(0, 229, 255, 0) 70%)',
					animation: 'landing-float-slow 18s ease-in-out infinite, landing-pulse-glow 4s ease-in-out infinite',
				}}
			/>
			{/* Purple orb - center right */}
			<Box
				sx={{
					position: 'absolute',
					top: '10%',
					right: '-8%',
					width: 'min(550px, 50vw)',
					height: 'min(550px, 50vw)',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(123, 47, 255, 0.30) 0%, rgba(123, 47, 255, 0) 70%)',
					animation: 'landing-float-medium 22s ease-in-out infinite',
					animationDelay: '-4s',
				}}
			/>
			{/* Magenta orb - bottom */}
			<Box
				sx={{
					position: 'absolute',
					bottom: '5%',
					left: '25%',
					width: 'min(450px, 45vw)',
					height: 'min(450px, 45vw)',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(255, 0, 229, 0.18) 0%, rgba(255, 0, 229, 0) 70%)',
					animation: 'landing-float-slow 25s ease-in-out infinite, wave-warp 12s ease-in-out infinite',
					animationDelay: '-8s',
				}}
			/>
			{/* Green accent - small */}
			<Box
				sx={{
					position: 'absolute',
					top: '45%',
					left: '60%',
					width: 'min(200px, 20vw)',
					height: 'min(200px, 20vw)',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(57, 255, 20, 0.12) 0%, rgba(57, 255, 20, 0) 70%)',
					animation: 'landing-float-medium 15s ease-in-out infinite',
					animationDelay: '-6s',
				}}
			/>
			{/* Floating particles */}
			{[...Array(6)].map((_, i) => (
				<Box
					key={i}
					sx={{
						position: 'absolute',
						bottom: '-5%',
						left: `${15 + i * 14}%`,
						width: '2px',
						height: '2px',
						borderRadius: '50%',
						background: i % 2 === 0 ? '#00e5ff' : '#ff00e5',
						boxShadow: i % 2 === 0
							? '0 0 6px #00e5ff, 0 0 12px #00e5ff'
							: '0 0 6px #ff00e5, 0 0 12px #ff00e5',
						animation: `particle-drift ${8 + i * 2}s linear infinite`,
						animationDelay: `${i * -1.5}s`,
					}}
				/>
			))}
		</Box>
	)
}

export default function HomeDesktop() {
	const theme = useTheme()
	const phoneVersion = useMediaQuery(theme.breakpoints.down(700))
	const isMobile = phoneVersion
	const tHome = useTranslations('home')

	const scrollPointRef = useRef(null)

	const [searchString, setSearchString] = useUrlState('hledat')
	const [searchInputValue, setSearchInputValue] = useState(searchString || '')

	const onSearchValueChange = useCallback(
		(e: string) => {
			setSearchInputValue(e)
			if (searchString === null) setSearchString('')
		},
		[searchString]
	)

	useChangeDelayer(
		searchInputValue,
		(value) => {
			if (value !== '') {
				setSearchString(value)
			}
		},
		[]
	)

	useEffect(() => {
		const handler = () => {
			setSearchInputValue('')
		}
		window.addEventListener(RESET_HOME_SCREEN_EVENT_NAME, handler)
		return () => {
			window.removeEventListener(RESET_HOME_SCREEN_EVENT_NAME, handler)
		}
	}, [])

	const scrollLevel = 20
	const scrollToTop = useCallback(() => {
		window.scroll({
			top: 90,
			behavior: 'smooth',
		})
	}, [])

	useEffect(() => {
		if (searchString === null) return
		scrollToTop()
	}, [searchString])

	const { isTop } = useScrollHandler({
		topThreshold: scrollLevel,
	})

	const toolbar = useToolbar()
	const footer = useFooter()

	useEffect(() => {
		toolbar.setTransparent(isTop)
		toolbar.setHideMiddleNavigation(!isTop)
		toolbar.setShowTitle(!isTop)
	}, [isTop, toolbar, phoneVersion])

	useEffect(() => {
		footer.setShow(false)
	}, [footer])

	const [innerHeight, setInnerHeight] = useState(
		typeof window !== 'undefined' ? window.innerHeight : 500
	)
	useEffect(() => {
		const handleResize = () => {
			setInnerHeight(window.innerHeight)
		}
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	const useWorshipVersion = useWorshipCzVersion()

	const [smartSearch, setSmartSearch] = useUrlState('smartSearch', false, {
		parse: (value) => value === 'true',
		stringify: (value) => (value ? 'true' : 'false'),
	})

	const paddingX = 32
	const gapString = `calc(max(${paddingX}px, (100vw - ${containerMaxWidth}px) / 2) )`

	const heroLead = tHome('hero.lead')
	const heroTitle = tHome('hero.title')
	const heroSubtitle = tHome('hero.subtitle')
	const heroSubtitleLower = tHome('hero.subtitleLower')

	return (
		<>
			{/* Cyberpunk animated background */}
			<CyberOrbs visible={!isMobile} />

			<Box
				sx={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'start',
					display: 'flex',
					flexDirection: 'column',
					position: 'relative',
				}}
			>
				<motion.div
					style={{
						position: 'fixed',
						display: 'flex',
						flexDirection: 'column',
						zIndex: phoneVersion ? 1 : 10,
						alignItems: 'center',
						pointerEvents: 'none',
					}}
					initial={{
						top: !phoneVersion
							? isTop
								? `32%`
								: 'calc(-7rem + 22px)'
							: isTop
							? '64px'
							: 'calc( 64px - 64px)',
						left: !phoneVersion ? paddingX : theme.spacing(1),
						right: !phoneVersion ? paddingX : theme.spacing(1),
					}}
					animate={{
						top: !phoneVersion
							? isTop
								? `32%`
								: 'calc(-7rem + 22px - 24px)'
							: isTop
							? '64px'
							: 'calc( 64px - 64px)',
						left: !phoneVersion
							? isTop
								? paddingX
								: `calc( ${paddingX}px + ${gapString} )`
							: theme.spacing(1),
						right: !phoneVersion ? paddingX : theme.spacing(1),
					}}
					transition={{
						type: 'keyframes',
						duration: ANIMATION_DURATION,
					}}
				>
					<ContainerGrid>
						<Box
							sx={{
								display: 'flex',
								justifyContent: ' space-between',
								width: '100%',
								gap: gapString,
							}}
						>
							<Box
								flex={1}
								sx={{
									display: 'flex',
									justifyContent: 'center',
								}}
							>
								<Box
									maxWidth={isMobile ? '100vw' : `min(550px, 50vw)`}
									flex={1}
									sx={{
										display: 'flex',
										flexDirection: 'column',
										gap: isMobile ? 1 : 3,
									}}
								>
									<AnimatePresence>
										{!phoneVersion ? (
											<motion.div
												initial={{
													height: '7rem',
													opacity: isTop ? 1 : 0,
												}}
												animate={{
													opacity: isTop ? 1 : 0,
												}}
												exit={{
													opacity: 0,
												}}
												transition={{
													type: 'keyframes',
													duration: ANIMATION_DURATION / 2,
												}}
												style={{
													display: 'flex',
													justifyContent: 'center',
													marginBottom: theme.spacing(1.5),
													flexDirection: 'column',
													userSelect: 'none',
													pointerEvents: 'none',
												}}
											>
												<motion.div
													variants={heroContainerVariants}
													initial="hidden"
													animate="visible"
												>
													{useWorshipVersion ? (
														<Box>
															<motion.div variants={heroItemVariants}>
																<Typography
																	variant="h3"
																	strong={300}
																	sx={{
																		color: '#4a4a6a',
																		letterSpacing: '0.12em',
																		textTransform: 'uppercase',
																		fontFamily: 'var(--font-orbitron)',
																	}}
																>
																	{heroLead}
																</Typography>
															</motion.div>
															<motion.div variants={heroItemVariants}>
																<GlitchText
																	sx={{
																		fontFamily: 'var(--font-orbitron)',
																		fontWeight: 900,
																		fontSize: 'clamp(3rem, 6vw, 5.5rem)',
																		lineHeight: 1.1,
																		letterSpacing: '0.06em',
																		textTransform: 'uppercase',
																		animation: 'neon-pulse 3s ease-in-out infinite, glitch-skew 4s ease-in-out infinite',
																	}}
																	color="#00e5ff"
																	glitchColor1="#ff00e5"
																	glitchColor2="#39ff14"
																>
																	{heroTitle}
																</GlitchText>
															</motion.div>
															<motion.div variants={heroItemVariants}>
																<Typography
																	strong={500}
																	noWrap
																	uppercase
																	sx={{
																		paddingLeft: 1,
																		letterSpacing: '0.25em',
																		fontFamily: 'var(--font-jetbrains)',
																		background: 'linear-gradient(90deg, #4a4a6a, #00e5ff, #ff00e5)',
																		backgroundSize: '200% auto',
																		WebkitBackgroundClip: 'text',
																		WebkitTextFillColor: 'transparent',
																		backgroundClip: 'text',
																		animation: 'landing-title-shimmer 4s ease-in-out infinite',
																	}}
																>
																	{heroSubtitle}
																</Typography>
															</motion.div>
														</Box>
													) : (
														<>
															<motion.div variants={heroItemVariants}>
																<Typography
																	variant="h3"
																	strong={300}
																	sx={{
																		color: '#4a4a6a',
																		letterSpacing: '0.12em',
																		textTransform: 'uppercase',
																		fontFamily: 'var(--font-orbitron)',
																	}}
																>
																	{heroLead}
																</Typography>
															</motion.div>
															<motion.div variants={heroItemVariants}>
																<GlitchText
																	sx={{
																		fontFamily: 'var(--font-orbitron)',
																		fontWeight: 900,
																		fontSize: 'clamp(3rem, 6vw, 5.5rem)',
																		lineHeight: 1.1,
																		letterSpacing: '0.06em',
																		textTransform: 'uppercase',
																		animation: 'neon-pulse 3s ease-in-out infinite, glitch-skew 4s ease-in-out infinite',
																	}}
																	color="#00e5ff"
																	glitchColor1="#ff00e5"
																	glitchColor2="#39ff14"
																>
																	{heroTitle}
																</GlitchText>
															</motion.div>
														</>
													)}
												</motion.div>
											</motion.div>
										) : (
											<motion.div
												variants={heroContainerVariants}
												initial="hidden"
												animate="visible"
												style={{
													display: 'flex',
													flexDirection: 'column',
												}}
											>
												<motion.div variants={heroItemVariants}>
													<Typography
														variant="h4"
														strong={300}
														sx={{
															color: '#4a4a6a',
															letterSpacing: '0.12em',
															textTransform: 'uppercase',
															fontFamily: 'var(--font-orbitron)',
														}}
													>
														{heroLead}
													</Typography>
												</motion.div>
												<motion.div variants={heroItemVariants}>
													<GlitchText
														sx={{
															fontFamily: 'var(--font-orbitron)',
															fontWeight: 900,
															fontSize: 'clamp(2rem, 5vw, 3rem)',
															lineHeight: 1.1,
															letterSpacing: '0.06em',
															textTransform: 'uppercase',
															animation: 'neon-pulse 3s ease-in-out infinite',
														}}
														color="#00e5ff"
														glitchColor1="#ff00e5"
														glitchColor2="#39ff14"
													>
														{heroTitle}
													</GlitchText>
												</motion.div>

												{useWorshipVersion && (
													<motion.div variants={heroItemVariants}>
														<Typography
															variant="h4"
															strong={300}
															noWrap
															sx={{
																fontFamily: 'var(--font-jetbrains)',
																background: 'linear-gradient(90deg, #4a4a6a, #00e5ff)',
																WebkitBackgroundClip: 'text',
																WebkitTextFillColor: 'transparent',
																backgroundClip: 'text',
															}}
														>
															{heroSubtitleLower}
														</Typography>
													</motion.div>
												)}
											</motion.div>
										)}
									</AnimatePresence>

									<motion.div
										variants={searchInputVariants}
										initial="hidden"
										animate="visible"
									>
										<MainSearchInput
											gradientBorder={isTop && !phoneVersion}
											value={searchInputValue}
											onChange={onSearchValueChange}
											smartSearch={smartSearch ?? false}
											onSmartSearchChange={setSmartSearch}
										/>
									</motion.div>
								</Box>
							</Box>

							{!isMobile && (
								<Box
									sx={{
										maxWidth: isTop ? 500 : 0,
										opacity: isTop ? 1 : 0,
										transition:
											'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
										pointerEvents: 'auto',
									}}
								>
									<motion.div
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{
											duration: 0.5,
											delay: 0.4,
											ease: [0.25, 0.46, 0.45, 0.94],
										}}
									>
										<RightSheepPanel mobileVersion={isMobile} />
									</motion.div>
								</Box>
							)}
						</Box>
					</ContainerGrid>
				</motion.div>
				<Box sx={{ height: 65 }}></Box>
				<div ref={scrollPointRef}></div>
				<Box sx={{ height: !phoneVersion ? '100vh' : 0 }}></Box>
				<div
					style={{
						left: 0,
						right: 0,
						position: 'absolute',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						padding: 0,
						top: !phoneVersion ? 'calc(100% - 275px)' : '155px',
						transform:
							isTop || phoneVersion
								? 'translateY(0)'
								: `translateY(calc(-${innerHeight}*0.8px + 170px))`,
						transition: `all ${ANIMATION_DURATION}s cubic-bezier(0.4, 0, 0.2, 1)`,
					}}
				>
					{searchString && (
						<SearchedSongsList
							searchString={searchString}
							useSmartSearch={smartSearch ?? false}
						/>
					)}
					<RecommendedSongsList />
					<LandingFeaturesSection />
					<LandingAboutTeaser />
					{isMobile && (
						<Box
							sx={{
								paddingTop: 16,
								paddingBottom: 4,
							}}
						>
							<RightSheepPanel mobileVersion={isMobile} />
						</Box>
					)}
				</div>
			</Box>

			{!phoneVersion ? (
				<FloatingAddButton extended={!isTop} />
			) : (
				<>
					<ParseAdminOption />
				</>
			)}
		</>
	)
}
