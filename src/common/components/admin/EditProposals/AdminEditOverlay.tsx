'use client'
/**
 * AdminEditOverlay
 *
 * Attaches a global `contextmenu` DOM event listener for admin users.
 *
 * Behaviour:
 *  - Right-click always shows the native browser context menu (no suppression).
 *  - If the admin right-clicks WITH text selected → a compact floating admin
 *    action button appears anchored to the bottom of the selected text.
 *    Clicking that button opens the proposal panel for the selected text.
 *  - The floating button stays visible while the selection exists and closes
 *    automatically when: the selection is cleared, Escape is pressed, the
 *    button is clicked, or the proposal dialog is already open.
 *
 * Renders: the compact AdminContextMenu when a text-selection right-click is
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

	/** Prevents creating a duplicate floating button when already open */
	const isMenuOpenRef = useRef(false)

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

	const handleContextMenuClose = () => {
		setContextMenu(null)
		removeHighlight()
		isMenuOpenRef.current = false
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

			// Only show the admin edit button when the user has text selected.
			if (!selectedText) return

			// If a proposal dialog is already open, don't stack another one
			if (pendingCaptureRef.current !== null) return

			// If the floating button is already showing, don't create a duplicate.
			// The native browser context menu will still appear normally.
			if (isMenuOpenRef.current) return

			// NOTE: We deliberately do NOT call e.preventDefault() here.
			// The native browser context menu will appear at the cursor as usual.
			// Our floating admin button appears separately, anchored to the selection.

			const anchorNode = selection?.anchorNode
			const anchorEl =
				anchorNode instanceof Element
					? anchorNode
					: (anchorNode?.parentElement ?? target)

			// Highlight the element containing the selection
			applyHighlight(anchorEl as HTMLElement)

			const capture = captureTextSelection(selectedText, anchorEl)

			// Position the floating button at the bottom-centre of the selected text,
			// so it does not conflict with the native context menu at the cursor.
			let menuX = e.clientX
			let menuY = e.clientY
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0)
				const rect = range.getBoundingClientRect()
				menuX = rect.left + rect.width / 2
				menuY = rect.bottom + 8
			}

			setContextMenu({ x: menuX, y: menuY, capture })
			isMenuOpenRef.current = true
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
