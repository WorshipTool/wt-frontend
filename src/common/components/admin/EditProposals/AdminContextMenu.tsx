'use client'
/**
 * AdminContextMenu
 *
 * A compact floating admin action button that appears anchored to the bottom
 * of a text selection when an admin right-clicks on selected text.
 *
 * Positioning: anchored to the selection bounding rect, NOT the cursor —
 * so it does not visually conflict with the native browser context menu
 * that appears at the cursor position.
 *
 * Closes when:
 *  - The admin clicks the "Navrhnout úpravu" button (opens the proposal dialog).
 *  - The text selection is cleared (selectionchange event).
 *  - The Escape key is pressed.
 *
 * Styled to blend with the native browser context menu aesthetic — minimal,
 * with a subtle shadow and hover effects.
 */
import { EditNote } from '@mui/icons-material'
import { useEffect, useRef } from 'react'
import { ElementCapture } from './types'

export type ContextMenuState = {
	x: number
	y: number
	capture: ElementCapture
}

type Props = {
	state: ContextMenuState
	onEdit: (capture: ElementCapture) => void
	onClose: () => void
}

export default function AdminContextMenu({ state, onEdit, onClose }: Props) {
	const menuRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault()
				onClose()
			}
		}

		// Close when the text selection is cleared (e.g. user clicks elsewhere)
		const handleSelectionChange = () => {
			const sel = window.getSelection()
			if (!sel || sel.toString().trim() === '') {
				onClose()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('selectionchange', handleSelectionChange)

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('selectionchange', handleSelectionChange)
		}
	}, [onClose])

	// Clamp position so the menu stays inside the viewport.
	// state.x is the horizontal centre of the selection; state.y is its bottom edge.
	const menuWidth = 200
	const menuHeight = 36 // single item
	const margin = 4
	const vw = typeof window !== 'undefined' ? window.innerWidth : 800
	const vh = typeof window !== 'undefined' ? window.innerHeight : 600
	const left = Math.max(margin, Math.min(state.x - menuWidth / 2, vw - menuWidth - margin))
	const top = Math.min(state.y, vh - menuHeight - margin)

	const handleEditClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		onEdit(state.capture)
		onClose()
	}

	return (
		<div
			ref={menuRef}
			data-edit-proposals-ui
			style={{
				position: 'fixed',
				top,
				left,
				zIndex: 9999,
				minWidth: menuWidth,
				backgroundColor: '#ffffff',
				border: '1px solid rgba(0,0,0,0.15)',
				borderRadius: 6,
				boxShadow: '0 4px 16px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)',
				padding: '3px 0',
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: 13,
				userSelect: 'none',
			}}
		>
			<button
				onClick={handleEditClick}
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					width: '100%',
					padding: '5px 12px',
					border: 'none',
					background: 'none',
					cursor: 'pointer',
					color: '#1e293b',
					fontSize: 13,
					textAlign: 'left',
					borderRadius: 0,
					transition: 'background-color 0.1s',
				}}
				onMouseEnter={(e) => {
					const el = e.currentTarget as HTMLButtonElement
					el.style.backgroundColor = '#2563eb'
					el.style.color = '#fff'
				}}
				onMouseLeave={(e) => {
					const el = e.currentTarget as HTMLButtonElement
					el.style.backgroundColor = 'transparent'
					el.style.color = '#1e293b'
				}}
			>
				<EditNote style={{ fontSize: 15, flexShrink: 0, color: 'inherit' }} />
				Navrhnout úpravu
			</button>
		</div>
	)
}
