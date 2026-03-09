'use client'
/**
 * AdminEditOverlay
 *
 * Attaches global DOM event listeners (contextmenu, mouseup) for admin users.
 * When the admin right-clicks on an element, the element is visually highlighted
 * and a small floating proposal panel appears next to it.
 * When text is selected (mouseup), the floating panel appears near the selection.
 *
 * Renders no visible DOM by itself — it is a pure side-effect component.
 */
import useAuth from '@/hooks/auth/useAuth'
import { useEffect, useRef } from 'react'
import { captureElement, captureTextSelection, isEditableTarget } from './captureUtils'
import { useEditProposals } from './useEditProposals'

/** Data attribute used to mark UI elements that should NOT trigger captures */
export const EDIT_PROPOSALS_UI_ATTR = 'data-edit-proposals-ui'

/** CSS applied to a right-clicked element to highlight it */
const HIGHLIGHT_OUTLINE = '2px solid #2563eb'
const HIGHLIGHT_OUTLINE_OFFSET = '2px'

/** Shape stored for cleaning up the highlight on close */
type HighlightEntry = {
	el: HTMLElement
	origOutline: string
	origOutlineOffset: string
}

export default function AdminEditOverlay() {
	const { isAdmin } = useAuth()
	const { openProposalFor, pendingCapture } = useEditProposals()

	// Keep stable refs so event listeners don't need to be re-registered on
	// every state update.
	const openProposalForRef = useRef(openProposalFor)
	const pendingCaptureRef = useRef(pendingCapture)

	// Tracks which element is currently highlighted so we can restore it
	const highlightRef = useRef<HighlightEntry | null>(null)

	useEffect(() => {
		openProposalForRef.current = openProposalFor
	}, [openProposalFor])

	useEffect(() => {
		pendingCaptureRef.current = pendingCapture
	}, [pendingCapture])

	// Remove highlight whenever the pending capture is cleared (dialog confirmed
	// or cancelled).
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
		// Remove any previous highlight first
		removeHighlight()
		highlightRef.current = {
			el,
			origOutline: el.style.outline,
			origOutlineOffset: el.style.outlineOffset,
		}
		el.style.outline = HIGHLIGHT_OUTLINE
		el.style.outlineOffset = HIGHLIGHT_OUTLINE_OFFSET
	}

	useEffect(() => {
		if (!isAdmin()) return

		// ── Right-click context menu ────────────────────────────────────────
		const handleContextMenu = (e: MouseEvent) => {
			const target = e.target as Element | null
			if (!target) return

			// Don't intercept on editable fields — let browser handle it
			if (isEditableTarget(target)) return

			// While a proposal dialog is open, ignore additional right-clicks
			// so the admin can focus on the current proposal
			if (pendingCaptureRef.current !== null) return

			// Skip elements that are part of our own admin UI
			if (target.closest(`[${EDIT_PROPOSALS_UI_ATTR}]`)) return

			e.preventDefault()

			// Highlight the target element
			applyHighlight(target as HTMLElement)

			const capture = captureElement(target)
			openProposalForRef.current(capture)
		}

		// ── Text selection (mouseup) ────────────────────────────────────────
		const handleMouseUp = (e: MouseEvent) => {
			// We only act when there IS a selection
			const selection = window.getSelection()
			const selectedText = selection?.toString().trim() ?? ''
			if (!selectedText) return

			const target = e.target as Element | null
			if (!target) return

			// Don't intercept inside editable fields
			if (isEditableTarget(target)) return

			// While a proposal dialog is open, don't trigger new captures
			if (pendingCaptureRef.current !== null) return

			// Skip elements that are part of our own admin UI
			if (target.closest(`[${EDIT_PROPOSALS_UI_ATTR}]`)) return

			const anchorNode = selection?.anchorNode
			const anchorEl =
				anchorNode instanceof Element
					? anchorNode
					: anchorNode?.parentElement ?? target

			const capture = captureTextSelection(selectedText, anchorEl)
			openProposalForRef.current(capture)
		}

		document.addEventListener('contextmenu', handleContextMenu)
		document.addEventListener('mouseup', handleMouseUp)

		return () => {
			document.removeEventListener('contextmenu', handleContextMenu)
			document.removeEventListener('mouseup', handleMouseUp)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAdmin()])

	return null
}
