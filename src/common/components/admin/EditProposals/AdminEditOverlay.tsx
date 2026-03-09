'use client'
/**
 * AdminEditOverlay
 *
 * Attaches a global `contextmenu` DOM event listener for admin users.
 *
 * Behaviour:
 *  - If the admin right-clicks WITHOUT any text selected → the native browser
 *    context menu is shown as usual (no interception).
 *  - If the admin right-clicks WITH text selected → the native context menu is
 *    suppressed and a compact custom context menu appears at the cursor with a
 *    single "Navrhnout úpravu" action. Clicking that action opens the proposal
 *    panel for the selected text.
 *
 * Renders: the custom AdminContextMenu when a text-selection right-click is
 * in progress.
 */
import useAuth from '@/hooks/auth/useAuth'
import { useEffect, useRef, useState } from 'react'
import AdminContextMenu, { ContextMenuState } from './AdminContextMenu'
import { captureTextSelection, isEditableTarget } from './captureUtils'
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

	const highlightRef = useRef<HighlightEntry | null>(null)
	const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

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

	// Also remove highlight when context menu is closed without opening the dialog
	const handleContextMenuClose = () => {
		setContextMenu(null)
		removeHighlight()
	}

	const handleEditFromContextMenu = (capture: Parameters<typeof openProposalFor>[0]) => {
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

			// Only intercept when the user has text selected.
			// Without a selection, let the native browser context menu show normally.
			if (!selectedText) return

			// If a proposal dialog is already open, don't stack another one
			if (pendingCaptureRef.current !== null) return

			e.preventDefault()

			const anchorNode = selection?.anchorNode
			const anchorEl =
				anchorNode instanceof Element
					? anchorNode
					: (anchorNode?.parentElement ?? target)

			// Highlight the element containing the selection
			applyHighlight(anchorEl as HTMLElement)

			const capture = captureTextSelection(selectedText, anchorEl)
			setContextMenu({ x: e.clientX, y: e.clientY, capture })
		}

		document.addEventListener('contextmenu', handleContextMenu)
		return () => {
			document.removeEventListener('contextmenu', handleContextMenu)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAdmin()])

	if (!contextMenu) return null

	return (
		<AdminContextMenu
			state={contextMenu}
			onEdit={handleEditFromContextMenu}
			onClose={handleContextMenuClose}
		/>
	)
}
