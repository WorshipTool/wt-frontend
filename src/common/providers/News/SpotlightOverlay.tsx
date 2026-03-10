'use client'

/**
 * Spotlight Overlay Component
 *
 * Creates dark overlay over entire page with a "hole" around highlighted element.
 * Used for tutorial/onboarding effects.
 */

import { Box } from '@/common/ui'
import { Z_INDEX } from '@/common/constants/zIndex'
import { keyframes } from '@emotion/react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
// SVG overlay with hole utilities
function roundedRectPath(
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
	const rr = Math.max(0, Math.min(r, w / 2, h / 2))
	return `\n    M ${x + rr} ${y}\n    H ${
		x + w - rr
	}\n    A ${rr} ${rr} 0 0 1 ${x + w} ${y + rr}\n    V ${
		y + h - rr
	}\n    A ${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}\n    H ${
		x + rr
	}\n    A ${rr} ${rr} 0 0 1 ${x} ${y + h - rr}\n    V ${
		y + rr
	}\n    A ${rr} ${rr} 0 0 1 ${x + rr} ${y}\n    Z\n  `
}

function OverlayWithHole({
	rect,
	radius = 10,
	onOverlayClick,
}: {
	rect: { left: number; top: number; width: number; height: number }
	radius?: number
	onOverlayClick: () => void
}) {
	const W = window.innerWidth
	const H = window.innerHeight
	const outer = `M0 0 H${W} V${H} H0 Z`
	const inner = roundedRectPath(
		rect.left,
		rect.top,
		rect.width,
		rect.height,
		radius
	)
	const d = `${outer} ${inner}`
	return (
		<Box
			component="svg"
			onClick={onOverlayClick}
			sx={{
				position: 'fixed',
				inset: 0,
				zIndex: Z_INDEX.OVERLAY,
				width: '100vw',
				height: '100vh',
				pointerEvents: 'none',
				animation: `${fadeIn} 0.3s ease-out`,
			}}
			viewBox={`0 0 ${W} ${H}`}
			preserveAspectRatio="none"
		>
			<path d={d} fill="rgba(0,0,0,0.6)" fillRule="evenodd" />
		</Box>
	)
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

type ElementRect = {
	top: number
	left: number
	width: number
	height: number
}

type SpotlightOverlayProps = {
	/** CSS selector of element or data-news-target value */
	selector: string
	/** Whether overlay is active */
	active: boolean
	/** Padding around element in px */
	padding?: number
	/** Border radius of hole in px */
	borderRadius?: number
	/** Callback when clicking on overlay (outside element) */
	onOverlayClick?: () => void
}

/**
 * Component for spotlight effect - dims page except for selected element.
 */
export function SpotlightOverlay({
	selector,
	active,
	padding = 0,
	borderRadius = 8,
	onOverlayClick,
}: SpotlightOverlayProps) {
	const [rect, setRect] = useState<ElementRect | null>(null)
	const [mounted, setMounted] = useState(false)

	// Find element and get its position
	const updateRect = useCallback(() => {
		// If selector starts with [ or ., it's a direct CSS selector
		// Otherwise we search by data-news-target
		const isDirectSelector =
			selector.startsWith('[') ||
			selector.startsWith('.') ||
			selector.startsWith('#')

		const element = isDirectSelector
			? document.querySelector(selector)
			: document.querySelector(`[data-news-target="${selector}"]`) ||
			  document.getElementById(selector)

		if (element) {
			const boundingRect = element.getBoundingClientRect()
			setRect({
				top: boundingRect.top - padding,
				left: boundingRect.left - padding,
				width: boundingRect.width + padding * 2,
				height: boundingRect.height + padding * 2,
			})
		} else {
			setRect(null)
		}
	}, [selector, padding])

	// Update position on change or scroll
	useEffect(() => {
		if (!active) {
			setRect(null)
			return
		}

		// Initial update
		updateRect()

		// Update on scroll and resize
		const handleUpdate = () => {
			requestAnimationFrame(updateRect)
		}

		window.addEventListener('scroll', handleUpdate, true)
		window.addEventListener('resize', handleUpdate)

		// Watch DOM changes (in case element moves)
		const observer = new MutationObserver(handleUpdate)
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
		})

		return () => {
			window.removeEventListener('scroll', handleUpdate, true)
			window.removeEventListener('resize', handleUpdate)
			observer.disconnect()
		}
	}, [active, updateRect])

	// Mount detection for portal
	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted || !active || !rect) {
		return null
	}

	const overlayContent = rect && (
		<OverlayWithHole
			rect={rect}
			radius={borderRadius}
			onOverlayClick={onOverlayClick || (() => {})}
		/>
	)

	return createPortal(<>{overlayContent}</>, document.body)
}
