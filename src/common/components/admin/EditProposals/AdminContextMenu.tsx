'use client'
/**
 * AdminContextMenu
 *
 * A custom context menu shown when the admin right-clicks on selected text.
 * It appears at the mouse cursor position and provides an "Upravit" (Edit) action
 * that opens the proposal dialog.
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

	// Close on click outside or on Escape
	useEffect(() => {
		const handleMouseDown = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose()
			}
		}
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault()
				onClose()
			}
		}
		// Also close on any contextmenu fired while we're open
		const handleContextMenu = () => onClose()

		// Slight delay so the originating right-click doesn't immediately close us
		const timer = setTimeout(() => {
			document.addEventListener('mousedown', handleMouseDown)
			document.addEventListener('keydown', handleKeyDown)
			document.addEventListener('contextmenu', handleContextMenu)
		}, 0)

		return () => {
			clearTimeout(timer)
			document.removeEventListener('mousedown', handleMouseDown)
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('contextmenu', handleContextMenu)
		}
	}, [onClose])

	// Clamp position so the menu stays inside the viewport
	const menuWidth = 200
	const menuHeight = 36 // single item
	const margin = 4
	const vw = typeof window !== 'undefined' ? window.innerWidth : 800
	const vh = typeof window !== 'undefined' ? window.innerHeight : 600
	const left = Math.min(state.x, vw - menuWidth - margin)
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
