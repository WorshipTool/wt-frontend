'use client'
/**
 * AdminEditOverlay
 *
 * Attaches a global `contextmenu` DOM event listener for admin users.
 *
 * Behaviour (Option B — floating button next to native menu):
 *  - When the admin right-clicks on ANY element, the native browser
 *    context menu is allowed to open normally (no preventDefault).
 *  - A compact floating "Upravit" pill button appears near the
 *    right-clicked element or text selection.
 *  - If text is selected, the button appears above the selection range.
 *  - If no text is selected, the button appears near the clicked element.
 *  - The admin can use the native menu and then click the floating button
 *    to open the proposal dialog, or the button auto-dismisses after a
 *    timeout / scroll / click elsewhere.
 *  - A 300 ms cooldown prevents the button from re-appearing on rapid
 *    double right-clicks.
 *
 * Renders: the compact FloatingEditButton when an admin right-click
 * is detected.
 */
import useAuth from '@/hooks/auth/useAuth'
import { useEffect, useRef, useState } from 'react'
import FloatingEditButton, {
	FloatingEditButtonState,
} from './FloatingEditButton'
import {
	captureElement,
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

			const selection = window.getSelection()
			const selectedText = selection?.toString().trim() ?? ''

			let capture: ReturnType<typeof captureTextSelection>
			let selectionRect: typeof capture.anchorRect

			if (selectedText) {
				// ── Text selection mode ────────────────────────────────────
				const anchorNode = selection?.anchorNode
				const anchorEl =
					anchorNode instanceof Element
						? anchorNode
						: (anchorNode?.parentElement ?? target)

				applyHighlight(anchorEl as HTMLElement)

				capture = captureTextSelection(selectedText, anchorEl)

				const range =
					selection && selection.rangeCount > 0
						? selection.getRangeAt(0)
						: null
				const rangeRect = range?.getBoundingClientRect()
				selectionRect = rangeRect && rangeRect.width > 0
					? {
							top: rangeRect.top,
							left: rangeRect.left,
							right: rangeRect.right,
							bottom: rangeRect.bottom,
							width: rangeRect.width,
							height: rangeRect.height,
						}
					: capture.anchorRect!
			} else {
				// ── Element mode (no text selected) ───────────────────────
				const el = target as HTMLElement
				applyHighlight(el)

				capture = captureElement(el)

				// Position the button near the mouse cursor (where the
				// user right-clicked), using a small virtual rect around
				// the cursor point so FloatingEditButton can place itself.
				selectionRect = {
					top: e.clientY,
					left: e.clientX,
					right: e.clientX,
					bottom: e.clientY,
					width: 0,
					height: 0,
				}
			}

			setButtonState({ selectionRect: selectionRect!, capture })
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
