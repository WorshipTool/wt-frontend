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
import LandingAboutTeaser from './components/LandingAboutTeaser/LandingAboutTeaser'
import LandingFeaturesSection from './components/LandingFeaturesSection/LandingFeaturesSection'
import SearchedSongsList from './components/SearchedSongsList'

export const RESET_HOME_SCREEN_EVENT_NAME = 'reset_home_screen_jh1a94'

const ANIMATION_DURATION = 0.25

// Staggered entrance variants for hero text - bolder with more movement
const heroContainerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.12,
			delayChildren: 0.15,
		},
	},
}

const heroItemVariants = {
	hidden: { opacity: 0, y: 24, scale: 0.96 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.6,
			ease: [0.16, 1, 0.3, 1],
		},
	},
}

const searchInputVariants = {
	hidden: { opacity: 0, y: 28, scale: 0.95 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.7,
			ease: [0.16, 1, 0.3, 1],
			delay: 0.45,
		},
	},
}

// Animated background orb component
function HeroBackgroundOrbs({ visible }: { visible: boolean }) {
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
			{/* Large blue orb - top left */}
			<Box
				sx={{
					position: 'absolute',
					top: '5%',
					left: '-5%',
					width: 'min(600px, 55vw)',
					height: 'min(600px, 55vw)',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(0, 133, 255, 0.35) 0%, rgba(0, 133, 255, 0) 70%)',
					animation: 'landing-float-slow 18s ease-in-out infinite',
					animationDelay: '0s',
				}}
			/>
			{/* Purple orb - center right */}
			<Box
				sx={{
					position: 'absolute',
					top: '15%',
					right: '-8%',
					width: 'min(550px, 50vw)',
					height: 'min(550px, 50vw)',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(124, 58, 237, 0.30) 0%, rgba(124, 58, 237, 0) 70%)',
					animation: 'landing-float-medium 22s ease-in-out infinite',
					animationDelay: '-4s',
				}}
			/>
			{/* Pink accent orb - bottom center */}
			<Box
				sx={{
					position: 'absolute',
					bottom: '10%',
					left: '30%',
					width: 'min(400px, 40vw)',
					height: 'min(400px, 40vw)',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(236, 72, 153, 0.20) 0%, rgba(236, 72, 153, 0) 70%)',
					animation: 'landing-float-slow 25s ease-in-out infinite',
					animationDelay: '-8s',
				}}
			/>
			{/* Small bright accent - golden */}
			<Box
				sx={{
					position: 'absolute',
					top: '40%',
					left: '55%',
					width: 'min(300px, 30vw)',
					height: 'min(300px, 30vw)',
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(235, 188, 30, 0.15) 0%, rgba(235, 188, 30, 0) 70%)',
					animation: 'landing-float-medium 20s ease-in-out infinite',
					animationDelay: '-12s',
				}}
			/>
		</Box>
	)
}

export default function HomeDesktop() {
	const theme = useTheme()
	const phoneVersion = useMediaQuery(theme.breakpoints.down(700))
	const isMobile = phoneVersion
	const tHome = useTranslations('home')

	const scrollPointRef = useRef(null)

	// Manage search input, and url state with delay
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

	// Manage scrolling to search results
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

	// Manage toolbar and footer
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

	// Calculate inner height of the window
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
			{/* Animated gradient orb background */}
			<HeroBackgroundOrbs visible={!isMobile} />

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
																		color: theme.palette.grey[500],
																		letterSpacing: '0.04em',
																	}}
																>
																	{heroLead}
																</Typography>
															</motion.div>
															<motion.div variants={heroItemVariants}>
																<Typography
																	variant="h1"
																	strong={900}
																	noWrap
																	sx={{
																		background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 40%, #a855f7 70%, #ec4899 100%)`,
																		backgroundSize: '200% auto',
																		WebkitBackgroundClip: 'text',
																		WebkitTextFillColor: 'transparent',
																		backgroundClip: 'text',
																		animation: 'landing-title-shimmer 6s ease-in-out infinite',
																		fontSize: 'clamp(3rem, 6vw, 5.5rem)',
																		lineHeight: 1.1,
																	}}
																>
																	{heroTitle}
																</Typography>
															</motion.div>
															<motion.div variants={heroItemVariants}>
																<Typography
																	strong={500}
																	noWrap
																	uppercase
																	sx={{
																		paddingLeft: 1,
																		letterSpacing: '0.18em',
																		background: `linear-gradient(90deg, ${theme.palette.grey[400]}, ${theme.palette.primary.main})`,
																		WebkitBackgroundClip: 'text',
																		WebkitTextFillColor: 'transparent',
																		backgroundClip: 'text',
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
																		color: theme.palette.grey[500],
																		letterSpacing: '0.04em',
																	}}
																>
																	{heroLead}
																</Typography>
															</motion.div>
															<motion.div variants={heroItemVariants}>
																<Typography
																	variant="h1"
																	strong={900}
																	noWrap
																	sx={{
																		background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 40%, #a855f7 70%, #ec4899 100%)`,
																		backgroundSize: '200% auto',
																		WebkitBackgroundClip: 'text',
																		WebkitTextFillColor: 'transparent',
																		backgroundClip: 'text',
																		animation: 'landing-title-shimmer 6s ease-in-out infinite',
																		fontSize: 'clamp(3rem, 6vw, 5.5rem)',
																		lineHeight: 1.1,
																	}}
																>
																	{heroTitle}
																</Typography>
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
															color: theme.palette.grey[500],
															letterSpacing: '0.04em',
														}}
													>
														{heroLead}
													</Typography>
												</motion.div>
												<motion.div variants={heroItemVariants}>
													<Typography
														variant="h3"
														strong={900}
														noWrap
														sx={{
															background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, #a855f7 100%)`,
															WebkitBackgroundClip: 'text',
															WebkitTextFillColor: 'transparent',
															backgroundClip: 'text',
														}}
													>
														{heroTitle}
													</Typography>
												</motion.div>

												{useWorshipVersion && (
													<motion.div variants={heroItemVariants}>
														<Typography
															variant="h4"
															strong={300}
															noWrap
															sx={{
																background: `linear-gradient(90deg, ${theme.palette.grey[400]}, ${theme.palette.primary.main})`,
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
