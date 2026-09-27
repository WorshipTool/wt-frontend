'use client'

import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { DOCKED_FIELD_TOP } from '@/common/constants/layout'
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
import { handOffSearchFocus } from '@/app/(layout)/pisne/searchHandoff'
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
/**
 * Where the hero stands once the page has scrolled and only the field is left
 * showing.
 *
 * Anchored to the field, not to the block: the target is the field sitting
 * astride the top bar's bottom edge, half above and half below — the same line
 * the catalog's field docks on, so the two screens cannot disagree. The block
 * is `HERO_ABOVE_FIELD` taller than the field's top (its headline, the gap
 * under it and its own padding), so the block goes that much higher.
 *
 * It used to be `calc(-7rem + 22px - 24px)`, tuned to the field's height at the
 * time; the day the field grew ten pixels it hung three below the edge here and
 * five above it on the catalog.
 */
const HERO_ABOVE_FIELD = 144
const HERO_TOP_DOCKED = DOCKED_FIELD_TOP - HERO_ABOVE_FIELD
/** …and where it starts that trip from, a nudge above where it lands. */
const HERO_TOP_ARRIVING = HERO_TOP_DOCKED + 24

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
	const searchBarRef = useRef<HTMLDivElement>(null)

	// The door offers the same choice the catalog does, and carries it there in
	// the URL — a mode set here and forgotten on arrival would be worse than not
	// offering it at all.
	const showSmartSearch = useFlag('enable_smart_search')
	const [smartSearch, setSmartSearch] = useState(false)

	const openCatalog = useCallback(
		(value: string) => {
			const query = value.trim()
			if (query === '') return
			// The caret goes with the query: the catalog's field takes it on arrival,
			// so the word can be finished there instead of being typed at nothing. And
			// so does the bar's own place, so the catalog's field rises from this one
			// rather than appearing at the top of a screen that was not there a moment
			// ago (see searchHandoff).
			handOffSearchFocus(searchBarRef.current)
			navigate('songsList', {
				hledat: query,
				s: undefined,
				chytre: smartSearch || undefined,
			})
		},
		[navigate, smartSearch]
	)

	// No dependencies, the same as the phone's field and for the same reason:
	// `navigate` is a new function on every render, so `openCatalog` is too, and
	// a dependency that changes every render restarts the wait every render. On
	// a screen that re-renders while its hero animates, the wait then never runs
	// out — you type a word on a desktop and the catalog opens only if the page
	// happens to fall quiet. The delayer re-reads the callback whenever the value
	// changes, which is every keystroke, so the closure here is current anyway.
	useChangeDelayer(searchInputValue, openCatalog, [], LAUNCH_DELAY_MS)

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
							top: isTop ? `32%` : `${HERO_TOP_ARRIVING}px`,
							left: paddingX,
							right: paddingX,
						}}
						animate={{
							top: isTop ? `32%` : `${HERO_TOP_DOCKED}px`,
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
											showSmartSearch={showSmartSearch}
											useSmartSearch={smartSearch}
											onSmartSearchChange={setSmartSearch}
											gradientBorder={isTop}
											containerRef={searchBarRef}
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
