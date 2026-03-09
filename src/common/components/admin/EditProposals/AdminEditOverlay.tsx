'use client'
/**
 * AdminEditOverlay
 *
 * Attaches a global `contextmenu` DOM event listener for admin users.
 *
 * Behaviour:
 *  - When the admin right-clicks WITH text selected, the native browser
 *    context menu is suppressed and a custom admin context menu appears at
 *    the cursor position with an "Upravit" option.
 *  - A 300 ms cooldown prevents the menu from appearing on rapid double
 *    right-clicks.
 *  - Without text selected, right-click behaves normally (no interception).
 *  - The floating menu closes when: the admin clicks "Upravit" (opens the
 *    proposal panel), the selection is cleared, Escape is pressed, or the
 *    proposal dialog is already open.
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

	/** Timestamp of the last contextmenu event we showed a menu for.
	 *  Used to prevent re-triggering on rapid double right-clicks. */
	const lastContextMenuTimeRef = useRef(0)

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

			// Only intercept when the admin has text selected.
			if (!selectedText) return

			// Suppress the native browser context menu — our custom menu replaces it.
			// This also prevents the browser from clearing the selection on right-click,
			// which eliminates the "double right-click re-triggers the menu" bug.
			e.preventDefault()

			// If a proposal dialog is already open, don't stack another one.
			if (pendingCaptureRef.current !== null) return

			// If the floating menu is already visible, don't create a duplicate.
			if (isMenuOpenRef.current) return

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

			// Position the custom menu at the cursor so it appears where the native
			// context menu would normally appear.
			setContextMenu({ x: e.clientX, y: e.clientY, capture })
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
