'use client'

import { useIsPhone } from '@/common/hooks/useIsPhone'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import ParseAdminOption from '@/app/(layout)/vytvorit/components/ParseAdminOption'
import MainSearchInput from '@/app/components/components/MainSearchInput'
import RecommendedSongsList from '@/app/components/components/RecommendedSongsList/RecommendedSongsList'
import RightSheepPanel from '@/app/components/components/RightSheepPanel/RightSheepPanel'
import { useFooter } from '@/common/components/Footer/hooks/useFooter'
import { useToolbar } from '@/common/components/Toolbar/hooks/useToolbar'
import { useScrollHandler } from '@/common/providers/OnScrollComponent/useScrollHandler'
import { Box, Image, Typography, useTheme } from '@/common/ui'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import useWorshipCzVersion from '@/hooks/worshipcz/useWorshipCzVersion'
import { getAssetUrl } from '@/tech/paths.tech'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import ContainerGrid, {
	containerMaxWidth,
} from '../../common/components/ContainerGrid'
import FloatingAddButton from './components/FloatingAddButton'
import HomeMobile from './HomeMobile'

export const RESET_HOME_SCREEN_EVENT_NAME = 'reset_home_screen_jh1a94'

const ANIMATION_DURATION = 0.2

/** How long the hero's field waits before opening the catalog with what it has. */
const LAUNCH_DELAY_MS = 600

export default function HomeDesktop() {
	const theme = useTheme()
	const phoneVersion = useIsPhone()
	const tHome = useTranslations('home')

	const scrollPointRef = useRef(null)

	// The field here is a door, not a search: what you type opens the catalog,
	// which is the one screen that answers. It waits out a pause first, so a
	// query arrives whole rather than one letter at a time — and Enter skips the
	// wait. See MainSearchInput.
	const navigate = useSmartNavigate()
	const [searchInputValue, setSearchInputValue] = useState('')

	const openCatalog = useCallback(
		(value: string) => {
			const query = value.trim()
			if (query === '') return
			navigate('songsList', { hledat: query, s: undefined })
		},
		[navigate]
	)

	useChangeDelayer(searchInputValue, openCatalog, [openCatalog], LAUNCH_DELAY_MS)

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

	// Manage toolbar and footer
	const { isTop } = useScrollHandler({
		topThreshold: scrollLevel,
	})

	const toolbar = useToolbar()
	const footer = useFooter()

	useEffect(() => {
		// mobile home runs its own shell (bottom tab bar + docked search), so the
		// top toolbar is hidden here and restored when leaving the mobile home
		if (phoneVersion) {
			toolbar.setHidden(true)
			return () => toolbar.setHidden(false)
		}
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

	const paddingX = 32
	const gapString = `calc(max(${paddingX}px, (100vw - ${containerMaxWidth}px) / 2) )`

	const shapeSizeString = phoneVersion
		? `calc(max(70vw, 40vh))`
		: `calc(max(50vw, 50vh) * 1.35)`
	const heroLead = tHome('hero.lead')
	const heroTitle = tHome('hero.title')
	const heroSubtitle = tHome('hero.subtitle')
	return (
		<>
			{!phoneVersion && (
				<Box
					sx={{
						position: 'fixed',
						top: isTop ? '38vh' : '-100%',
						right: isTop ? 0 : '-100%',
						transform: 'translateX(50%) translateY(-50%) rotate(175deg)',
						zIndex: -1,
						pointerEvents: 'none',
						transition: 'top 0.2s ease, right 0.2s ease, opacity 0.2s ease',
						width: shapeSizeString,
						height: shapeSizeString,
					}}
				>
					<Image
						src={getAssetUrl('/gradient-shapes/shape1.svg')}
						alt={tHome('backgroundShape')}
						fill
						priority
						sizes="(max-width: 700px) 88vw, calc(max(50vw, 50vh) * 1.35)"
						style={{
							filter: 'brightness(1)',
						}}
					/>
					<Image
						src={getAssetUrl('/gradient-shapes/shape2.svg')}
						alt={tHome('backgroundShape')}
						fill
						priority
						sizes="(max-width: 700px) 88vw, calc(max(50vw, 50vh) * 1.35)"
						style={{
							filter: 'brightness(1.1)',
						}}
					/>
				</Box>
			)}

			{phoneVersion ? (
				<HomeMobile />
			) : (
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
							zIndex: 10,
							alignItems: 'center',
							pointerEvents: 'none',
						}}
						initial={{
							top: isTop ? `32%` : 'calc(-7rem + 22px)',
							left: paddingX,
							right: paddingX,
						}}
						animate={{
							top: isTop ? `32%` : 'calc(-7rem + 22px - 24px)',
							left: isTop ? paddingX : `calc( ${paddingX}px + ${gapString} )`,
							right: paddingX,
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
										maxWidth={`min(550px, 50vw)`}
										flex={1}
										sx={{
											display: 'flex',
											flexDirection: 'column',
											gap: 3,
										}}
									>
										<AnimatePresence>
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
													marginBottom: theme.spacing(1),
													flexDirection: 'column',
													userSelect: 'none',
													pointerEvents: 'none',
												}}
											>
												{useWorshipVersion ? (
													<Box>
														<Typography variant="h3" strong={200}>
															{heroLead}
														</Typography>
														<Typography variant="h1" strong={900} noWrap>
															{heroTitle}
														</Typography>

														<>
															<Typography
																// variant="h5"
																strong={400}
																noWrap
																uppercase
																// small
																color="grey.500"
																sx={{
																	paddingLeft: 1,
																}}
															>
																{heroSubtitle}
															</Typography>
														</>
													</Box>
												) : (
													<>
														<Typography variant="h3" strong={200}>
															{heroLead}
														</Typography>
														<Typography variant="h1" strong={900} noWrap>
															{heroTitle}
														</Typography>
													</>
												)}
											</motion.div>
										</AnimatePresence>

										<MainSearchInput
											gradientBorder={isTop}
											value={searchInputValue}
											onChange={setSearchInputValue}
											onSubmit={() => openCatalog(searchInputValue)}
										/>
									</Box>
								</Box>

								<Box
									sx={{
										maxWidth: isTop ? 500 : 0,
										// maxHeight: isTop ? 500 : 0,
										// transform: 'translateY(-50px)',
										opacity: isTop ? 1 : 0,
										transition:
											'max-width 0.2s ease, opacity 0.2s ease, max-height 0.2s ease',
										// display: 'flex',
										// flexDirection: 'column',
										// gap: 2,
										pointerEvents: 'auto',
									}}
								>
									<RightSheepPanel mobileVersion={false} />
								</Box>
							</Box>
						</ContainerGrid>
					</motion.div>
					<Box sx={{ height: 65 }}></Box>
					<div ref={scrollPointRef}></div>
					<Box sx={{ height: '100vh' }}></Box>
					<div
						style={{
							left: 0,
							right: 0,
							position: 'absolute',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							padding: 0,
							top: 'calc(100% - 275px)',
							// TODO: fix height jumping on one column preview
							transform: isTop
								? 'translateY(0)'
								: `translateY(calc(-${innerHeight}*0.8px + 170px))`,
							transition: `all ${ANIMATION_DURATION}s ease`,
						}}
					>
						<RecommendedSongsList />
					</div>
				</Box>
			)}

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
