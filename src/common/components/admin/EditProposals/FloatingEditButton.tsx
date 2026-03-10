'use client'
/**
 * FloatingEditButton
 *
 * A compact pill-shaped button that appears ABOVE the text selection when an
 * admin right-clicks.  The native browser context menu is NOT suppressed —
 * it opens normally beneath / beside this button.
 *
 * Positioning: placed above the top edge of the selection range rect,
 * so it does not overlap the native context menu (which opens downward from
 * the cursor).
 *
 * Auto-dismisses when:
 *  - The admin clicks the button (opens proposal dialog).
 *  - A mousedown occurs outside the button (native menu closed, user
 *    clicked elsewhere, etc.) — with a 600 ms grace period so the button
 *    isn't immediately dismissed by the native menu's own dismiss event.
 *  - The Escape key is pressed.
 *  - The page is scrolled or resized.
 *  - A 10-second timeout elapses.
 */
import { EditNote } from '@mui/icons-material'
import { useEffect, useRef } from 'react'
import { AnchorRect, ElementCapture } from './types'

export type FloatingEditButtonState = {
	/** Viewport-relative rect of the text selection */
	selectionRect: AnchorRect
	/** Pre-captured element data (captured at right-click time) */
	capture: ElementCapture
}

type Props = {
	state: FloatingEditButtonState
	onEdit: (capture: ElementCapture) => void
	onClose: () => void
}

const BUTTON_HEIGHT = 30
const GAP = 6 // space between button bottom edge and selection top
const MARGIN = 6 // min distance from viewport edge
const AUTO_DISMISS_MS = 10_000
const GRACE_PERIOD_MS = 600

export default function FloatingEditButton({ state, onEdit, onClose }: Props) {
	const btnRef = useRef<HTMLButtonElement | null>(null)
	const mountedAt = useRef(Date.now())

	// ── Auto-dismiss listeners ────────────────────────────────────────────────
	useEffect(() => {
		const timer = setTimeout(onClose, AUTO_DISMISS_MS)

		const handleMouseDown = (e: MouseEvent) => {
			// Grace period: ignore mousedown events that fire right after mount
			// (e.g. the native context menu sending a dismiss mousedown).
			if (Date.now() - mountedAt.current < GRACE_PERIOD_MS) return
			if (btnRef.current && btnRef.current.contains(e.target as Node)) return
			onClose()
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}

		const handleDismiss = () => onClose()

		document.addEventListener('mousedown', handleMouseDown, true)
		document.addEventListener('keydown', handleKeyDown)
		window.addEventListener('scroll', handleDismiss, true)
		window.addEventListener('resize', handleDismiss)

		return () => {
			clearTimeout(timer)
			document.removeEventListener('mousedown', handleMouseDown, true)
			document.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('scroll', handleDismiss, true)
			window.removeEventListener('resize', handleDismiss)
		}
	}, [onClose])

	// ── Position calculation ──────────────────────────────────────────────────
	const { selectionRect } = state
	const vw = typeof window !== 'undefined' ? window.innerWidth : 800

	// Place ABOVE the selection
	let top = selectionRect.top - BUTTON_HEIGHT - GAP
	if (top < MARGIN) {
		// Not enough space above → fall below the selection
		top = selectionRect.bottom + GAP
	}

	let left = selectionRect.left
	const btnWidthEstimate = 120
	if (left + btnWidthEstimate > vw - MARGIN) left = vw - btnWidthEstimate - MARGIN
	if (left < MARGIN) left = MARGIN

	// ── Handlers ──────────────────────────────────────────────────────────────
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		e.preventDefault()
		onEdit(state.capture)
		onClose()
	}

	return (
		<button
			ref={btnRef}
			data-edit-proposals-ui
			data-testid="floating-edit-button"
			onClick={handleClick}
			style={{
				position: 'fixed',
				top,
				left,
				zIndex: 10000,
				display: 'inline-flex',
				alignItems: 'center',
				gap: 5,
				height: BUTTON_HEIGHT,
				padding: '0 12px 0 8px',
				border: 'none',
				borderRadius: 15,
				backgroundColor: '#2563eb',
				color: '#ffffff',
				fontSize: 13,
				fontWeight: 600,
				fontFamily: 'system-ui, -apple-system, sans-serif',
				cursor: 'pointer',
				boxShadow:
					'0 2px 8px rgba(37, 99, 235, 0.35), 0 1px 3px rgba(0,0,0,0.18)',
				userSelect: 'none',
				whiteSpace: 'nowrap',
				transition: 'background-color 0.15s, transform 0.15s',
				animation: 'editBtnFadeIn 0.18s ease-out',
			}}
			onMouseEnter={(e) => {
				;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1d4ed8'
				;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'
			}}
			onMouseLeave={(e) => {
				;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2563eb'
				;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
			}}
		>
			<EditNote style={{ fontSize: 16, flexShrink: 0 }} />
			Upravit
			{/* Inline keyframe for the fade-in animation */}
			<style>{`
				@keyframes editBtnFadeIn {
					from { opacity: 0; transform: translateY(4px); }
					to   { opacity: 1; transform: translateY(0); }
				}
			`}</style>
		</button>
	)
}
