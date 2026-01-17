'use client'

/**
 * News Context Provider
 *
 * This provider manages news state for the entire application.
 * Displays news only to logged-in users.
 */

import { useApi } from '@/api/tech-and-hooks/useApi'
import { useFlagChecker } from '@/common/providers/FeatureFlags/useFlag'
import useAuth from '@/hooks/auth/useAuth'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { NewsItem, NewsTargetComponent } from './news.types'
import { getActiveNews } from '@/common/providers/News/news.config'
import { useDownSize } from '@/common/hooks/useDownSize'
import { useTranslations } from 'next-intl'

/** Delay before automatic popup display (in ms) */
const POPUP_AUTO_SHOW_DELAY_MS = 500

/**
 * Default context value (for use outside of provider)
 */
type Rt = ReturnType<typeof useNewsProvider>

const NewsContext = createContext<Rt>({ uninitialized: true } as any as Rt)

type NewsItemWithState = NewsItem & {
	userState: {
		seen: boolean
		tried: boolean
	}
}

const useNewsProvider = () => {
	const { isLoggedIn } = useAuth()
	const newsApi = useApi('newsApi')
	const checkFlag = useFlagChecker()
	const t = useTranslations('news')

	const [newsToShow, setNewsToShow] = useState<NewsItemWithState | null>(null)
	const hasFetched = useRef(false)
	const alreadyShownRef = useRef(false)

	const isSmallDevice = useDownSize('md')

	// Popup state
	const [isPopupOpen, setIsPopupOpen] = useState(false)

	// Whether spotlight (dark background) is enabled
	// true only after clicking "Try" in popup, false when simply closing
	const [spotlightEnabled, setSpotlightEnabled] = useState(false)

	// Reset state when user logs out
	useEffect(() => {
		if (!isLoggedIn()) {
			hasFetched.current = false
			setNewsToShow(null)
			setIsPopupOpen(false)
			alreadyShownRef.current = false
		}
	}, [isLoggedIn])

	// Load news state once when user is logged in
	useEffect(() => {
		if (!isLoggedIn() || hasFetched.current || isSmallDevice) {
			setNewsToShow(null)

			hasFetched.current = false
			return
		}

		const fetchNewsState = async () => {
			try {
				const a = await newsApi.getNewsState()

				if (!a.canShowNews) {
					setNewsToShow(null)

					hasFetched.current = true
					return
				}

				const localActiveNews = getActiveNews(t)

				// Filter news by feature flags - only show news if user has the required flag enabled
				const newsWithEnabledFlags = localActiveNews.filter((news) => {
					if (!news.featureFlag) return true // No flag required, show to everyone
					return checkFlag(news.featureFlag)
				})

				const unseenOrUntriedNews = newsWithEnabledFlags.filter((news) => {
					const fromApi = a.state.find((s) => s.newsId === news.id)
					return !fromApi || !fromApi.seen || !fromApi.tried
				})

				const newsItemToShow =
					unseenOrUntriedNews.length > 0 ? unseenOrUntriedNews[0] : null

				const itemFromApi = newsItemToShow
					? a.state.find((s) => s.newsId === newsItemToShow.id)
					: null

				const withState = newsItemToShow
					? {
							...newsItemToShow,
							userState: {
								seen: itemFromApi ? itemFromApi.seen : false,
								tried: itemFromApi ? itemFromApi.tried : false,
							},
						}
					: null
				setNewsToShow(withState)
				hasFetched.current = true
			} catch {
				// On any error (network, HTTP 4xx/5xx, timeout, etc.)
				// silently fail and don't show any news popup
				setNewsToShow(null)
				hasFetched.current = true
			}
		}

		fetchNewsState()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoggedIn, hasFetched, isSmallDevice])

	// Automatically show popup when there are unseen news
	useEffect(() => {
		if (
			!isLoggedIn() ||
			newsToShow === null ||
			newsToShow.userState.seen ||
			alreadyShownRef.current
		) {
			return
		}

		const timer = setTimeout(() => {
			setIsPopupOpen(true)
			alreadyShownRef.current = true
		}, POPUP_AUTO_SHOW_DELAY_MS)

		return () => clearTimeout(timer)
	}, [isLoggedIn, newsToShow])

	const closePopup = useCallback(() => {
		setIsPopupOpen(false)
	}, [])

	const enableSpotlight = useCallback(() => {
		setSpotlightEnabled(true)
	}, [])

	const markAsTried = useCallback(async () => {
		if (!newsToShow) {
			return
		}

		// Fire and forget API call with error handling
		newsApi.markAsTried({ newsId: newsToShow.id }).catch(() => {
			// Silently ignore errors - state is already updated optimistically
		})

		setNewsToShow((prev) =>
			prev
				? {
						...prev,
						userState: {
							...prev.userState,
							tried: true,
						},
					}
				: null,
		)
	}, [newsApi, newsToShow])

	const markAsSeen = useCallback(async () => {
		if (!newsToShow) {
			return
		}

		// Fire and forget API call with error handling
		newsApi.markAsSeen({ newsId: newsToShow.id }).catch(() => {
			// Silently ignore errors - state is already updated optimistically
		})

		setNewsToShow((prev) =>
			prev
				? {
						...prev,
						userState: {
							...prev.userState,
							seen: true,
						},
					}
				: null,
		)
	}, [newsApi, newsToShow])

	const getHighlightForComponent = useCallback(
		(component: NewsTargetComponent): NewsItem | null => {
			if (!isLoggedIn()) return null
			if (!newsToShow) return null
			if (newsToShow.tutorial?.targetComponent === component) {
				return newsToShow
			}
			return null
		},
		[newsToShow, isLoggedIn],
	)

	return {
		newsToShow,
		isPopupOpen,
		spotlightEnabled,
		enableSpotlight,
		closePopup,
		markAsSeen,
		markAsTried,
		getHighlightForComponent,
	}
}
export function NewsProvider({ children }: { children: React.ReactNode }) {
	const data = useNewsProvider()
	return <NewsContext.Provider value={data}>{children}</NewsContext.Provider>
}

/**
 * Hook for accessing news context.
 */
export function useNews() {
	const r = useContext(NewsContext)
	if ((r as any).uninitialized) {
		throw new Error('useNews was used outside of a NewsProvider')
	}
	return r
}

/**
 * Hook for getting highlight news for a specific component.
 * Usage: const highlight = useNewsHighlight('smart-search-toggle')
 */
export function useNewsHighlight(component: NewsTargetComponent) {
	const { getHighlightForComponent, markAsTried } = useNews()

	const newsItem = getHighlightForComponent(component)

	// Check if news has steps or just highlightText
	const hasSteps =
		newsItem?.tutorial?.steps && newsItem.tutorial.steps.length > 0

	// For multi-step highlights, we use local state to track current step
	// (steps are UI-only, not persisted to backend)
	const [currentStep, setCurrentStep] = useState(0)

	// Reset step when news item changes
	useEffect(() => {
		setCurrentStep(0)
	}, [newsItem?.id])

	const totalSteps = newsItem?.tutorial?.steps?.length || 0

	// Current step (if has steps) or fallback to highlightText
	const currentStepData = hasSteps
		? newsItem?.tutorial?.steps?.[currentStep]
		: null
	const highlightText = currentStepData?.text
	const triggerOn = currentStepData?.triggerOn ?? 'click'
	const isLastStep = hasSteps ? currentStep >= totalSteps - 1 : true
	const spotlight = currentStepData?.spotlight

	// Handler for completing a step
	const handleAdvanceStep = useCallback(() => {
		if (newsItem) {
			if (hasSteps && !isLastStep) {
				// Move to next step
				setCurrentStep((prev) => prev + 1)
			} else {
				// Last step or no steps - mark as tried
				markAsTried()
				setCurrentStep((prev) => prev + 1)
			}
		}
	}, [newsItem, hasSteps, isLastStep, markAsTried])

	return {
		isHighlighted: !!newsItem,
		newsItem,
		highlightText,
		/** How current step is completed */
		triggerOn,
		/** Current step number (0-indexed) */
		currentStep,
		/** Total number of steps */
		totalSteps,
		/** Whether we're on the last step */
		isLastStep,
		/** Spotlight settings for current step (true, string selector, or undefined) */
		spotlight,
		/** Target component ID (for spotlight) */
		targetComponent: newsItem?.tutorial?.targetComponent,
		/** Advance to next step (or complete if last) */
		onAdvanceStep: handleAdvanceStep,
	}
}
