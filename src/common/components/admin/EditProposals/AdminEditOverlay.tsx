'use client'
/**
 * AdminEditOverlay
 *
 * Attaches a global `contextmenu` DOM event listener for admin users.
 *
 * Behaviour (Option B — floating button next to native menu):
 *  - When the admin right-clicks WITH text selected, the native browser
 *    context menu is allowed to open normally (no preventDefault).
 *  - A compact floating "Upravit" pill button appears ABOVE the text
 *    selection, so it does not overlap the native menu.
 *  - The admin can use the native menu (Copy, etc.) and then click the
 *    floating button to open the proposal dialog, or the button auto-
 *    dismisses after a timeout / scroll / click elsewhere.
 *  - Without text selected, right-click behaves 100 % normally.
 *  - A 300 ms cooldown prevents the button from re-appearing on rapid
 *    double right-clicks.
 *
 * Renders: the compact FloatingEditButton when a text-selection right-click
 * is detected.
 */
import useAuth from '@/hooks/auth/useAuth'
import { useEffect, useRef, useState } from 'react'
import FloatingEditButton, {
	FloatingEditButtonState,
} from './FloatingEditButton'
import {
	captureTextSelection,
	isEditableTarget,
} from './captureUtils'
import { useEditProposals } from './useEditProposals'

/** Data attribute used to mark UI elements that should NOT trigger captures */
export const EDIT_PROPOSALS_UI_ATTR = 'data-edit-proposals-ui'

/** CSS applied to the element whose text is being captured */
const HIGHLIGHT_OUTLINE = '2px solid #2563eb'
const HIGHLIGHT_OUTLINE_OFFSET = '2px'

type HighlightEntry = {
	el: HTMLElement
	origOutline: string
	origOutlineOffset: string
}

export default function AdminEditOverlay() {
	const { isAdmin } = useAuth()
	const { openProposalFor, pendingCapture } = useEditProposals()

	const openProposalForRef = useRef(openProposalFor)
	const pendingCaptureRef = useRef(pendingCapture)

	/** Prevents creating a duplicate floating button when already open */
	const isButtonOpenRef = useRef(false)

	/** Timestamp of the last contextmenu event we showed a button for.
	 *  Used to prevent re-triggering on rapid double right-clicks. */
	const lastContextMenuTimeRef = useRef(0)

	const highlightRef = useRef<HighlightEntry | null>(null)
	const [buttonState, setButtonState] =
		useState<FloatingEditButtonState | null>(null)

	useEffect(() => {
		openProposalForRef.current = openProposalFor
	}, [openProposalFor])

	useEffect(() => {
		pendingCaptureRef.current = pendingCapture
	}, [pendingCapture])

	// Remove highlight when the proposal dialog is closed
	useEffect(() => {
		if (pendingCapture === null) {
			removeHighlight()
		}
	}, [pendingCapture])

	function removeHighlight() {
		if (highlightRef.current) {
			const { el, origOutline, origOutlineOffset } = highlightRef.current
			el.style.outline = origOutline
			el.style.outlineOffset = origOutlineOffset
			highlightRef.current = null
		}
	}

	function applyHighlight(el: HTMLElement) {
		removeHighlight()
		highlightRef.current = {
			el,
			origOutline: el.style.outline,
			origOutlineOffset: el.style.outlineOffset,
		}
		el.style.outline = HIGHLIGHT_OUTLINE
		el.style.outlineOffset = HIGHLIGHT_OUTLINE_OFFSET
	}

	const handleButtonClose = () => {
		setButtonState(null)
		removeHighlight()
		isButtonOpenRef.current = false
	}

	const handleEditFromButton = (
		capture: Parameters<typeof openProposalFor>[0]
	) => {
		openProposalForRef.current(capture)
		// Highlight is kept while the proposal dialog is open;
		// it will be cleared by the pendingCapture effect above.
	}

	useEffect(() => {
		if (!isAdmin()) return

		const handleContextMenu = (e: MouseEvent) => {
			const target = e.target as Element | null
			if (!target) return

			// Never intercept inside editable fields
			if (isEditableTarget(target)) return

			// Never intercept inside our own admin UI
			if (target.closest(`[${EDIT_PROPOSALS_UI_ATTR}]`)) return

			const selection = window.getSelection()
			const selectedText = selection?.toString().trim() ?? ''

			// Only show the floating button when the admin has text selected.
			if (!selectedText) return

			// *** Option B: Do NOT call e.preventDefault() ***
			// The native browser context menu opens normally.

			// If a proposal dialog is already open, don't stack another one.
			if (pendingCaptureRef.current !== null) return

			// If the floating button is already visible, don't create a duplicate.
			if (isButtonOpenRef.current) return

			// Cooldown: ignore a second right-click within 300 ms of the first.
			const now = Date.now()
			if (now - lastContextMenuTimeRef.current < 300) return
			lastContextMenuTimeRef.current = now

			const anchorNode = selection?.anchorNode
			const anchorEl =
				anchorNode instanceof Element
					? anchorNode
					: (anchorNode?.parentElement ?? target)

			// Highlight the element containing the selection
			applyHighlight(anchorEl as HTMLElement)

			const capture = captureTextSelection(selectedText, anchorEl)

			// Use the selection's bounding rect for button placement (above the text).
			const range =
				selection && selection.rangeCount > 0
					? selection.getRangeAt(0)
					: null
			const rangeRect = range?.getBoundingClientRect()
			const selectionRect = rangeRect && rangeRect.width > 0
				? {
						top: rangeRect.top,
						left: rangeRect.left,
						right: rangeRect.right,
						bottom: rangeRect.bottom,
						width: rangeRect.width,
						height: rangeRect.height,
					}
				: capture.anchorRect!

			setButtonState({ selectionRect, capture })
			isButtonOpenRef.current = true
		}

		document.addEventListener('contextmenu', handleContextMenu)
		return () => {
			document.removeEventListener('contextmenu', handleContextMenu)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAdmin()])

	if (!buttonState) return null

	return (
		<FloatingEditButton
			state={buttonState}
			onEdit={handleEditFromButton}
			onClose={handleButtonClose}
		/>
	)
}
