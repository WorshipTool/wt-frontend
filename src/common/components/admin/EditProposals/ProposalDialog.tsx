'use client'
/**
 * ProposalDialog
 *
 * A focused modal that appears when the admin right-clicks an element or
 * selects text.  The admin writes a free-text description of the desired
 * change.  Confirming adds the proposal to the collection; cancelling
 * dismisses the dialog without adding anything.
 */
import Popup from '@/common/components/Popup/Popup'
import { Box, Button, IconButton, TextField } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha } from '@/common/ui/mui'
import { Close, EditNote, TextFields } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { ElementCapture } from './types'
import { useEditProposals } from './useEditProposals'

const ACCENT = '#2563eb' // blue-600

export default function ProposalDialog() {
	const { pendingCapture, confirmProposal, cancelPendingProposal } =
		useEditProposals()
	const [proposalText, setProposalText] = useState('')
	const isOpen = pendingCapture !== null

	// Reset textarea whenever a new capture comes in
	useEffect(() => {
		if (pendingCapture) {
			setProposalText('')
		}
	}, [pendingCapture])

	const handleConfirm = () => {
		const trimmed = proposalText.trim()
		if (!trimmed) return
		confirmProposal(trimmed)
		setProposalText('')
	}

	const handleClose = () => {
		cancelPendingProposal()
		setProposalText('')
	}

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

	return (
		<Popup open={isOpen} onClose={handleClose} width={480}>
			{/* data-edit-proposals-ui prevents the overlay from re-triggering
			    on mouseup / contextmenu events inside this dialog */}
			<Box
				data-edit-proposals-ui
				sx={{
					position: 'relative',
					overflow: 'hidden',
					'&::before': {
						content: '""',
						position: 'absolute',
						inset: -100,
						background: `radial-gradient(400px 300px at 50% 50%, ${alpha(ACCENT, 0.08)} 0%, transparent 70%)`,
						zIndex: 0,
						filter: 'blur(16px)',
						pointerEvents: 'none',
					},
				}}
			>
				{/* Header */}
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						zIndex: 1,
						position: 'relative',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 0.75,
							bgcolor: alpha(ACCENT, 0.1),
							color: ACCENT,
							px: '10px',
							py: '4px',
							borderRadius: 2,
						}}
					>
						<EditNote sx={{ fontSize: 16 }} />
						<Typography variant="subtitle1" strong={600}>
							Navrhnout úpravu
						</Typography>
					</Box>
					<IconButton small onClick={handleClose}>
						<Close fontSize="inherit" />
					</IconButton>
				</Box>

				<Gap value={1.5} />

				{/* Context preview */}
				{pendingCapture && (
					<CapturePreview capture={pendingCapture} />
				)}

				<Gap value={1.5} />

				{/* Proposal textarea */}
				<Box
					onKeyDown={handleKeyDown}
					sx={{
						border: '1.5px solid',
						borderColor: alpha(ACCENT, 0.35),
						borderRadius: 2,
						px: 1.5,
						py: 1,
						bgcolor: 'rgba(255,255,255,0.7)',
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
						sx={{ minHeight: 80 }}
					/>
				</Box>

				<Gap value={0.5} />
				<Typography
					variant="normal"
					size="0.72rem"
					color="grey.400"
					sx={{ textAlign: 'right' }}
				>
					Ctrl+Enter pro přidání
				</Typography>

				<Gap value={1} />

				{/* Actions */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
					<Button color="secondary" onClick={handleClose}>
						Zrušit
					</Button>
					<Button
						color="primary"
						onClick={handleConfirm}
						disabled={!proposalText.trim()}
					>
						Přidat návrh
					</Button>
				</Box>
			</Box>
		</Popup>
	)
}

// ─── Capture preview ─────────────────────────────────────────────────────────

function CapturePreview({ capture }: { capture: ElementCapture }) {
	const isTextSelection = capture.type === 'text-selection'
	const displayText = isTextSelection
		? capture.selectedText
		: capture.elementText

	return (
		<Box
			sx={{
				bgcolor: alpha('#000', 0.03),
				border: '1px solid',
				borderColor: alpha('#000', 0.08),
				borderRadius: 2,
				px: 1.5,
				py: 1,
				display: 'flex',
				flexDirection: 'column',
				gap: 0.5,
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
				<TextFields sx={{ fontSize: 13, color: 'grey.500' }} />
				<Typography variant="normal" size="0.72rem" color="grey.500">
					{isTextSelection ? 'Označený text' : `Element <${capture.elementTag}>`}
					{' · '}
					<span style={{ fontFamily: 'monospace' }}>{capture.elementPath}</span>
				</Typography>
			</Box>
			{displayText && (
				<Typography
					variant="normal"
					size="0.82rem"
					color="grey.700"
					sx={{
						fontStyle: 'italic',
						overflow: 'hidden',
						display: '-webkit-box',
						WebkitLineClamp: 3,
						WebkitBoxOrient: 'vertical',
					}}
				>
					&quot;{displayText}&quot;
				</Typography>
			)}
		</Box>
	)
}
