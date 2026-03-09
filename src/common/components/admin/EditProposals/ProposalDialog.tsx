'use client'
/**
 * ProposalDialog
 *
 * A compact floating panel that appears next to the element the admin
 * right-clicked (or near a text selection).  The admin writes a free-text
 * description of the desired change.  Confirming adds the proposal to the
 * collection; cancelling (or pressing Escape / clicking outside) dismisses
 * the panel without adding anything.
 *
 * Unlike a modal, this panel does NOT block the rest of the page — it sits
 * at a fixed position calculated from the element's bounding rect so the
 * highlighted element stays visible while the admin writes their note.
 */
import { Box, Button, IconButton, TextField } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha, Paper } from '@/common/ui/mui'
import { Close, EditNote, TextFields } from '@mui/icons-material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnchorRect, ElementCapture } from './types'
import { useEditProposals } from './useEditProposals'

const ACCENT = '#2563eb' // blue-600
const PANEL_WIDTH = 320
const PANEL_HEIGHT_APPROX = 260 // used for placement; actual height may vary
const MARGIN = 10 // minimum distance from viewport edges
const GAP = 8 // gap between the element and the panel

// ─── Position calculation ─────────────────────────────────────────────────────

type PanelPosition = { top: number; left: number }

function calcPosition(
	anchorRect: AnchorRect,
	panelWidth: number,
	panelHeightApprox: number
): PanelPosition {
	const vw = window.innerWidth
	const vh = window.innerHeight

	// Prefer placing the panel BELOW the element
	let top =
		anchorRect.bottom + GAP + panelHeightApprox <= vh - MARGIN
			? anchorRect.bottom + GAP
			: anchorRect.top - panelHeightApprox - GAP

	// Align to the left edge of the element, then clamp to viewport
	let left = anchorRect.left
	if (left + panelWidth > vw - MARGIN) left = vw - panelWidth - MARGIN
	if (left < MARGIN) left = MARGIN

	// Clamp top to viewport
	if (top < MARGIN) top = MARGIN
	if (top + panelHeightApprox > vh - MARGIN) top = vh - panelHeightApprox - MARGIN

	return { top, left }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProposalDialog() {
	const { pendingCapture, confirmProposal, cancelPendingProposal } =
		useEditProposals()
	const [proposalText, setProposalText] = useState('')
	const panelRef = useRef<HTMLDivElement | null>(null)
	const isOpen = pendingCapture !== null

	// Reset textarea whenever a new capture comes in
	useEffect(() => {
		if (pendingCapture) {
			setProposalText('')
		}
	}, [pendingCapture])

	const handleConfirm = useCallback(() => {
		const trimmed = proposalText.trim()
		if (!trimmed) return
		confirmProposal(trimmed)
		setProposalText('')
	}, [proposalText, confirmProposal])

	const handleClose = useCallback(() => {
		cancelPendingProposal()
		setProposalText('')
	}, [cancelPendingProposal])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			e.preventDefault()
			handleConfirm()
		}
		if (e.key === 'Escape') {
			e.preventDefault()
			handleClose()
		}
	}

	// Close when clicking outside the panel
	useEffect(() => {
		if (!isOpen) return
		const handleMouseDown = (e: MouseEvent) => {
			if (
				panelRef.current &&
				!panelRef.current.contains(e.target as Node)
			) {
				handleClose()
			}
		}
		// Delay by one tick so the very mousedown that opened the panel
		// (right-click) doesn't immediately close it
		const timer = setTimeout(
			() => document.addEventListener('mousedown', handleMouseDown),
			0
		)
		return () => {
			clearTimeout(timer)
			document.removeEventListener('mousedown', handleMouseDown)
		}
	}, [isOpen, handleClose])

	const position = useMemo<PanelPosition | null>(() => {
		if (!pendingCapture?.anchorRect) return null
		return calcPosition(pendingCapture.anchorRect, PANEL_WIDTH, PANEL_HEIGHT_APPROX)
	}, [pendingCapture])

	if (!isOpen) return null

	return (
		<Paper
			ref={panelRef}
			elevation={8}
			data-edit-proposals-ui
			sx={{
				position: 'fixed',
				top: position?.top ?? '50%',
				left: position?.left ?? '50%',
				transform: position ? 'none' : 'translate(-50%, -50%)',
				width: PANEL_WIDTH,
				zIndex: 2000,
				borderRadius: 2.5,
				overflow: 'hidden',
				bgcolor: 'white',
				border: '1px solid',
				borderColor: alpha(ACCENT, 0.18),
				boxShadow: `0 8px 32px ${alpha(ACCENT, 0.14)}, 0 2px 8px rgba(0,0,0,0.12)`,
			}}
		>
			{/* Header */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					px: 1.5,
					py: 1,
					bgcolor: alpha(ACCENT, 0.06),
					borderBottom: '1px solid',
					borderColor: alpha(ACCENT, 0.1),
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<EditNote sx={{ fontSize: 15, color: ACCENT }} />
					<Typography variant="subtitle1" strong={600} sx={{ color: ACCENT, fontSize: '0.82rem' }}>
						Navrhnout úpravu
					</Typography>
				</Box>
				<IconButton small onClick={handleClose} sx={{ p: 0.25 }}>
					<Close sx={{ fontSize: 14 }} />
				</IconButton>
			</Box>

			<Box sx={{ px: 1.5, py: 1.25 }}>
				{/* Context preview */}
				{pendingCapture && (
					<CapturePreview capture={pendingCapture} />
				)}

				<Gap value={1} />

				{/* Proposal textarea */}
				<Box
					onKeyDown={handleKeyDown}
					sx={{
						border: '1.5px solid',
						borderColor: alpha(ACCENT, 0.3),
						borderRadius: 1.5,
						px: 1,
						py: 0.75,
						bgcolor: 'rgba(255,255,255,0.9)',
						transition: 'border-color 0.2s',
						'&:focus-within': { borderColor: ACCENT },
					}}
				>
					<TextField
						value={proposalText}
						onChange={setProposalText}
						placeholder="Popiš požadovanou změnu..."
						multiline
						autoFocus
						sx={{ minHeight: 64, fontSize: '0.85rem' }}
					/>
				</Box>

				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mt: 0.75,
					}}
				>
					<Typography
						variant="normal"
						size="0.68rem"
						color="grey.400"
					>
						Ctrl+Enter
					</Typography>
					<Box sx={{ display: 'flex', gap: 0.75 }}>
						<Button
							color="secondary"
							onClick={handleClose}
							sx={{ fontSize: '0.78rem', py: 0.5, px: 1.25, minWidth: 0 }}
						>
							Zrušit
						</Button>
						<Button
							color="primary"
							onClick={handleConfirm}
							disabled={!proposalText.trim()}
							sx={{
								fontSize: '0.78rem',
								py: 0.5,
								px: 1.25,
								minWidth: 0,
								bgcolor: ACCENT,
								'&:hover': { bgcolor: alpha(ACCENT, 0.85) },
							}}
						>
							Přidat návrh
						</Button>
					</Box>
				</Box>
			</Box>
		</Paper>
	)
}

// ─── Capture preview ─────────────────────────────────────────────────────────

function CapturePreview({ capture }: { capture: ElementCapture }) {
	const isTextSelection = capture.type === 'text-selection'
	const displayText = isTextSelection ? capture.selectedText : capture.elementText

	return (
		<Box
			sx={{
				bgcolor: alpha('#000', 0.03),
				border: '1px solid',
				borderColor: alpha('#000', 0.07),
				borderRadius: 1.5,
				px: 1,
				py: 0.75,
				display: 'flex',
				flexDirection: 'column',
				gap: 0.3,
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
				<TextFields sx={{ fontSize: 11, color: 'grey.500' }} />
				<Typography variant="normal" size="0.68rem" color="grey.500">
					{isTextSelection ? 'Označený text' : `Element <${capture.elementTag}>`}
					{' · '}
					<span style={{ fontFamily: 'monospace' }}>{capture.elementPath}</span>
				</Typography>
			</Box>
			{displayText && (
				<Typography
					variant="normal"
					size="0.75rem"
					color="grey.700"
					sx={{
						fontStyle: 'italic',
						overflow: 'hidden',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
					}}
				>
					&quot;{displayText}&quot;
				</Typography>
			)}
		</Box>
	)
}
