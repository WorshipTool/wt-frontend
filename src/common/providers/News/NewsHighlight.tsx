'use client'

/**
 * News Highlight Component
 *
 * Component for highlighting an element with news information.
 * Wraps target component and displays tooltip/badge with news.
 */

import { Z_INDEX } from '@/common/constants/zIndex'
import { Box } from '@/common/ui'
import { Typography } from '@/common/ui/Typography'
import { alpha } from '@/common/ui/mui'
import { AutoAwesome } from '@mui/icons-material'
import { keyframes, SxProps, Theme } from '@mui/system'
import {
	cloneElement,
	isValidElement,
	ReactElement,
	ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useNews, useNewsHighlight } from './NewsContext'
import { SpotlightOverlay } from './SpotlightOverlay'
import { NewsTargetComponent } from './news.types'

/** Delay before showing tooltip (in ms) */
const TOOLTIP_SHOW_DELAY_MS = 1000

/** Duration to keep updating tooltip position after scroll/resize (in ms) */
const TOOLTIP_POSITION_UPDATE_DURATION_MS = 2000

/**
 * Animation for pulsing effect
 */
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(83, 46, 231, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(83, 46, 231, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(83, 46, 231, 0);
  }
`

const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

/**
 * Utility function for wrapping child element with click handler.
 * Preserves original onClick handler if it exists.
 */
function wrapChildWithClickHandler(
	children: ReactNode,
	handler: () => void
): ReactNode {
	if (!isValidElement(children)) {
		return children
	}

	return cloneElement(children as ReactElement, {
		onClick: (e: React.MouseEvent) => {
			handler()
			// Call original onClick if it exists
			const originalOnClick = (children as ReactElement).props?.onClick
			if (originalOnClick) {
				originalOnClick(e)
			}
		},
	})
}

type NewsHighlightWrapperProps = {
	/** Component identifier for pairing with news */
	targetComponent: NewsTargetComponent
	/** Component to be highlighted */
	children: ReactNode
	/** Position of tooltip/badge relative to component */
	tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right'
	/** Custom styles for wrapper */
	sx?: SxProps<Theme>
	/** Disable pulse animation */
	disablePulse?: boolean
}

/**
 * Wrapper component for highlighting element with news.
 *
 * Usage:
 * ```tsx
 * <NewsHighlightWrapper targetComponent="smart-search-toggle">
 *   <IconButton onClick={handleClick}>
 *     <AutoAwesome />
 *   </IconButton>
 * </NewsHighlightWrapper>
 * ```
 */
export function NewsHighlightWrapper({
	targetComponent,
	children,
	tooltipPlacement = 'bottom',
	sx,
	disablePulse = false,
}: NewsHighlightWrapperProps) {
	const { isHighlighted, highlightText, triggerOn, onAdvanceStep, spotlight } =
		useNewsHighlight(targetComponent)
	const { isPopupOpen, spotlightEnabled } = useNews()
	const [showTooltip, setShowTooltip] = useState(false)
	const [mounted, setMounted] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

	// Determine selector for spotlight
	const spotlightSelector =
		typeof spotlight?.selector === 'string'
			? spotlight.selector
			: targetComponent

	// Mount detection for portal
	useEffect(() => {
		setMounted(true)
	}, [])

	// Calculate position function
	const calculatePosition = useCallback(() => {
		const rect = wrapperRef.current?.getBoundingClientRect()
		if (!rect) return null

		let top = 0
		let left = 0

		switch (tooltipPlacement) {
			case 'bottom':
				top = rect.bottom + 8
				left = rect.left + rect.width / 2
				break
			case 'top':
				top = rect.top - 8
				left = rect.left + rect.width / 2
				break
			case 'left':
				top = rect.top + rect.height / 2
				left = rect.left - 8
				break
			case 'right':
				top = rect.top + rect.height / 2
				left = rect.right + 8
				break
		}

		return { top, left }
	}, [tooltipPlacement])

	// Synchronous position calculation before paint
	useLayoutEffect(() => {
		if (!isHighlighted || !wrapperRef.current) return

		const pos = calculatePosition()
		if (pos) {
			setTooltipPosition(pos)
		}
	}, [isHighlighted, calculatePosition])

	// Update tooltip position on scroll/resize
	useEffect(() => {
		if (!isHighlighted || !wrapperRef.current) return

		let rafId: number | null = null
		let timeoutId: ReturnType<typeof setTimeout> | null = null
		let isAnimating = false

		const updatePosition = () => {
			const pos = calculatePosition()
			if (pos) {
				setTooltipPosition((prev) => {
					if (prev.top !== pos.top || prev.left !== pos.left) {
						return pos
					}
					return prev
				})
			}
		}

		// Smooth animation loop using requestAnimationFrame
		const tick = () => {
			updatePosition()
			if (isAnimating) {
				rafId = requestAnimationFrame(tick)
			}
		}

		// Start smooth updates for 2 seconds after scroll/resize
		const startSmoothUpdate = () => {
			if (timeoutId) clearTimeout(timeoutId)

			if (!isAnimating) {
				isAnimating = true
				tick()
			}

			// Stop after period of inactivity
			timeoutId = setTimeout(() => {
				isAnimating = false
				if (rafId) {
					cancelAnimationFrame(rafId)
					rafId = null
				}
			}, TOOLTIP_POSITION_UPDATE_DURATION_MS)
		}

		const handleScrollOrResize = () => {
			startSmoothUpdate()
		}

		// Update on scroll and resize
		window.addEventListener('scroll', handleScrollOrResize, true)
		window.addEventListener('resize', handleScrollOrResize)

		return () => {
			window.removeEventListener('scroll', handleScrollOrResize, true)
			window.removeEventListener('resize', handleScrollOrResize)
			isAnimating = false
			if (rafId) cancelAnimationFrame(rafId)
			if (timeoutId) clearTimeout(timeoutId)
		}
	}, [isHighlighted, tooltipPlacement])

	// Show tooltip after small delay, but not when popup is open
	useEffect(() => {
		if (isHighlighted && !isPopupOpen) {
			const timer = setTimeout(() => {
				setShowTooltip(true)
			}, TOOLTIP_SHOW_DELAY_MS)
			return () => clearTimeout(timer)
		} else {
			setShowTooltip(false)
		}
	}, [isHighlighted, isPopupOpen])

	// Handler for clicking on component
	const handleClick = useCallback(() => {
		if (isHighlighted && triggerOn === 'click') {
			onAdvanceStep()
		}
	}, [isHighlighted, triggerOn, onAdvanceStep])

	// Handler for clicking OK button
	const handleConfirm = useCallback(() => {
		if (isHighlighted) {
			onAdvanceStep()
		}
	}, [isHighlighted, onAdvanceStep])

	// If not highlighted, return only children
	if (!isHighlighted) {
		return <>{children}</>
	}

	const childWithHandler = wrapChildWithClickHandler(children, handleClick)

	// Don't show tooltip when popup is open
	const shouldShowTooltip = showTooltip && highlightText && !isPopupOpen

	// Whether spotlight is active for this step
	// Spotlight shows only if user clicked "Try" in popup (spotlightEnabled)
	const isSpotlightActive = !!spotlight && showTooltip && !isPopupOpen && spotlightEnabled

	// Transform for tooltip based on placement
	const getTooltipTransform = () => {
		switch (tooltipPlacement) {
			case 'bottom':
				return 'translateX(-50%)'
			case 'top':
				return 'translateX(-50%) translateY(-100%)'
			case 'left':
				return 'translateX(-100%) translateY(-50%)'
			case 'right':
				return 'translateY(-50%)'
		}
	}

	// Tooltip rendered via portal
	const tooltipPortal =
		mounted && shouldShowTooltip
			? createPortal(
					<Box
						sx={{
							position: 'fixed',
							top: tooltipPosition.top,
							left: tooltipPosition.left,
							transform: getTooltipTransform(),
							zIndex: Z_INDEX.TOOLTIP,
							whiteSpace: 'nowrap',
							pointerEvents: triggerOn === 'confirm' ? 'auto' : 'none',
							animation: `${fadeInAnimation} 0.2s ease-out`,
						}}
					>
						<Box
							sx={{
								backgroundColor: 'primary.main',
								color: 'white',
								padding: '8px 12px',
								borderRadius: 2,
								boxShadow: 3,
								// animation: `${glowAnimation} 2s ease-in-out infinite`,
							}}
						>
							<Box display="flex" alignItems="center" gap={1}>
								<AutoAwesome sx={{ fontSize: 18 }} />
								<Typography
									variant="normal"
									size="0.875rem"
									color="inherit"
									strong={500}
								>
									{highlightText}
								</Typography>
								{triggerOn === 'confirm' && (
									<Box
										component="button"
										onClick={handleConfirm}
										sx={{
											marginLeft: 1,
											padding: '4px 12px',
											backgroundColor: 'white',
											color: 'primary.main',
											border: 'none',
											borderRadius: 1,
											cursor: 'pointer',
											fontWeight: 600,
											fontSize: '0.75rem',
											'&:hover': {
												backgroundColor: alpha('#ffffff', 0.9),
											},
										}}
									>
										OK
									</Box>
								)}
							</Box>
						</Box>
					</Box>,
					document.body
			  )
			: null

	return (
		<Box
			ref={wrapperRef}
			data-news-target={targetComponent}
			sx={{
				position: 'relative',
				display: 'inline-flex',
				// Vyšší z-index když je spotlight aktivní
				...(isSpotlightActive && {
					zIndex: Z_INDEX.OVERLAY,
				}),
				...(!disablePulse && {
					'&::before': {
						content: '""',
						position: 'absolute',
						inset: -2,
						borderRadius: '50%',
						animation: `${pulseAnimation} 2s ease-in-out infinite`,
						pointerEvents: 'none',
					},
				}),
				...sx,
			}}
		>
			{childWithHandler}

			{/* Tooltip rendered via portal for correct z-index */}
			{tooltipPortal}

			{/* Spotlight overlay - dims page except for element */}
			{spotlightSelector && (
				<SpotlightOverlay
					selector={spotlightSelector}
					active={isSpotlightActive}
					padding={spotlight?.padding}
					borderRadius={spotlight?.radius}
				/>
			)}
		</Box>
	)
}

/**
 * Component for displaying badge with news count.
 * Can be used for example in navigation.
 */
type NewsBadgeProps = {
	children: ReactNode
	count: number
	sx?: SxProps<Theme>
}

export function NewsBadge({ children, count, sx }: NewsBadgeProps) {
	if (count === 0) {
		return <>{children}</>
	}

	return (
		<Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
			{children}
			<Box
				sx={{
					position: 'absolute',
					top: -4,
					right: -4,
					backgroundColor: 'error.main',
					color: 'white',
					borderRadius: '50%',
					minWidth: 18,
					height: 18,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 11,
					fontWeight: 600,
					border: '2px solid white',
				}}
			>
				{count > 9 ? '9+' : count}
			</Box>
		</Box>
	)
}

/**
 * Simple component for highlighting with pulse without tooltip.
 * Suitable for elements where tooltip is not desired.
 */
type SimpleHighlightProps = {
	targetComponent: NewsTargetComponent
	children: ReactNode
	sx?: SxProps<Theme>
}

export function SimpleNewsHighlight({
	targetComponent,
	children,
	sx,
}: SimpleHighlightProps) {
	const { isHighlighted, onAdvanceStep } = useNewsHighlight(targetComponent)

	const handleClick = useCallback(() => {
		if (isHighlighted) {
			onAdvanceStep()
		}
	}, [isHighlighted, onAdvanceStep])

	if (!isHighlighted) {
		return <>{children}</>
	}

	const childWithHandler = wrapChildWithClickHandler(children, handleClick)

	return (
		<Box
			sx={{
				position: 'relative',
				display: 'inline-flex',
				'&::after': {
					content: '""',
					position: 'absolute',
					inset: -3,
					borderRadius: 2,
					border: (theme) =>
						`2px solid ${alpha(theme.palette.primary.main, 0.6)}`,
					animation: `${pulseAnimation} 2s ease-in-out infinite`,
					pointerEvents: 'none',
				},
				...sx,
			}}
		>
			{childWithHandler}
		</Box>
	)
}
