'use client'
/**
 * ProposalCornerButton
 *
 * Appears in the bottom-right corner once the admin has at least one pending
 * proposal.  Shows a badge with the count and opens a review panel where the
 * admin can inspect, remove, or submit all proposals at once.
 */
import { CornerStack } from '@/common/components/CornerStack'
import { Box, Button, IconButton } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { Badge, Collapse, Paper, alpha } from '@/common/ui/mui'
import {
	CheckCircleOutline,
	Close,
	DeleteOutline,
	EditNote,
	RateReview,
} from '@mui/icons-material'
import { useState } from 'react'
import { EditProposal } from './types'
import { useEditProposals } from './useEditProposals'

const ACCENT = '#2563eb' // blue-600

export default function ProposalCornerButton() {
	const {
		proposals,
		isCollecting,
		removeProposal,
		clearProposals,
		submitAll,
		isSubmitting,
	} = useEditProposals()

	const [panelOpen, setPanelOpen] = useState(false)

	if (!isCollecting && proposals.length === 0) return null

	return (
		<CornerStack corner="bottom-right" order={2}>
			<Box data-edit-proposals-ui>
				{/* Review panel (slides open above the button) */}
				<Collapse in={panelOpen} unmountOnExit>
					<ReviewPanel
						proposals={proposals}
						onRemove={removeProposal}
						onClearAll={clearProposals}
						onSubmit={async () => {
							await submitAll()
							setPanelOpen(false)
						}}
						onClose={() => setPanelOpen(false)}
						isSubmitting={isSubmitting}
					/>
					<Gap value={1} />
				</Collapse>

				{/* Corner toggle button */}
				<Badge
					badgeContent={proposals.length > 0 ? proposals.length : undefined}
					sx={{
						'& .MuiBadge-badge': {
							right: 8,
							top: 4,
							pointerEvents: 'none',
							bgcolor: ACCENT,
							color: 'white',
							border: '2px solid white',
							fontSize: '0.7rem',
							minWidth: 18,
							height: 18,
						},
					}}
				>
					<IconButton
						size="small"
						onClick={() => setPanelOpen((v) => !v)}
						sx={{
							bgcolor: panelOpen ? ACCENT : alpha(ACCENT, 0.12),
							color: panelOpen ? 'white' : ACCENT,
							border: '2px solid',
							borderColor: alpha(ACCENT, 0.3),
							'&:hover': {
								bgcolor: panelOpen ? alpha(ACCENT, 0.85) : alpha(ACCENT, 0.2),
							},
							transition: 'background 0.2s, color 0.2s',
						}}
					>
						<RateReview fontSize="small" />
					</IconButton>
				</Badge>
			</Box>
		</CornerStack>
	)
}

// ─── Review Panel ─────────────────────────────────────────────────────────────

type ReviewPanelProps = {
	proposals: EditProposal[]
	onRemove: (id: string) => void
	onClearAll: () => void
	onSubmit: () => Promise<void>
	onClose: () => void
	isSubmitting: boolean
}

function ReviewPanel({
	proposals,
	onRemove,
	onClearAll,
	onSubmit,
	onClose,
	isSubmitting,
}: ReviewPanelProps) {
	return (
		<Paper
			elevation={4}
			sx={{
				width: 340,
				maxWidth: 'calc(100vw - 4rem)',
				borderRadius: 3,
				overflow: 'hidden',
				bgcolor: 'white',
			}}
		>
			{/* Header */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					px: 2,
					py: 1.5,
					bgcolor: alpha(ACCENT, 0.06),
					borderBottom: '1px solid',
					borderColor: alpha(ACCENT, 0.12),
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
					<EditNote sx={{ fontSize: 18, color: ACCENT }} />
					<Typography variant="subtitle1" strong={600} sx={{ color: ACCENT }}>
						Navržené úpravy
					</Typography>
					<Box
						sx={{
							bgcolor: ACCENT,
							color: 'white',
							borderRadius: 10,
							px: 0.75,
							py: 0.1,
							fontSize: '0.7rem',
							fontWeight: 700,
							lineHeight: 1.6,
						}}
					>
						{proposals.length}
					</Box>
				</Box>
				<IconButton small onClick={onClose}>
					<Close fontSize="inherit" />
				</IconButton>
			</Box>

			{/* Proposal list */}
			<Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
				{proposals.length === 0 ? (
					<Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
						<Typography variant="normal" size="0.85rem" color="grey.400">
							Žádné návrhy
						</Typography>
					</Box>
				) : (
					proposals.map((p) => (
						<ProposalItem key={p.id} proposal={p} onRemove={onRemove} />
					))
				)}
			</Box>

			{/* Footer actions */}
			{proposals.length > 0 && (
				<Box
					sx={{
						px: 2,
						py: 1.5,
						borderTop: '1px solid',
						borderColor: alpha('#000', 0.08),
						display: 'flex',
						gap: 1,
						justifyContent: 'space-between',
					}}
				>
					<Button
						color="secondary"
						onClick={onClearAll}
						disabled={isSubmitting}
						sx={{ fontSize: '0.8rem' }}
					>
						Zahodit vše
					</Button>
					<Button
						color="primary"
						onClick={onSubmit}
						loading={isSubmitting}
						disabled={proposals.length === 0}
						sx={{
							fontSize: '0.8rem',
							bgcolor: ACCENT,
							'&:hover': { bgcolor: alpha(ACCENT, 0.85) },
						}}
					>
						<CheckCircleOutline sx={{ fontSize: 16, mr: 0.5 }} />
						Odeslat k implementaci
					</Button>
				</Box>
			)}
		</Paper>
	)
}

// ─── Single proposal item ─────────────────────────────────────────────────────

function ProposalItem({
	proposal,
	onRemove,
}: {
	proposal: EditProposal
	onRemove: (id: string) => void
}) {
	const { capture, proposalText } = proposal
	const isTextSel = capture.type === 'text-selection'
	const contextLabel = isTextSel ? capture.selectedText : capture.elementText
	const shortContext =
		contextLabel && contextLabel.length > 60
			? contextLabel.slice(0, 60) + '…'
			: contextLabel

	return (
		<Box
			sx={{
				px: 2,
				py: 1.25,
				borderBottom: '1px solid',
				borderColor: alpha('#000', 0.06),
				'&:last-child': { borderBottom: 'none' },
				display: 'flex',
				gap: 1,
				alignItems: 'flex-start',
			}}
		>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				{/* Element context */}
				<Typography
					variant="normal"
					size="0.7rem"
					color="grey.400"
					sx={{
						display: 'block',
						fontFamily: 'monospace',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{`<${capture.elementTag}>`} {capture.elementPath}
				</Typography>

				{/* Selected text / element text */}
				{shortContext && (
					<Typography
						variant="normal"
						size="0.75rem"
						color="grey.500"
						sx={{
							display: 'block',
							fontStyle: 'italic',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						&quot;{shortContext}&quot;
					</Typography>
				)}

				{/* Proposal text */}
				<Typography
					variant="normal"
					size="0.82rem"
					color="grey.800"
					sx={{ display: 'block', mt: 0.25, lineHeight: 1.4 }}
				>
					{proposalText.length > 100
						? proposalText.slice(0, 100) + '…'
						: proposalText}
				</Typography>
			</Box>

			<IconButton
				small
				onClick={() => onRemove(proposal.id)}
				sx={{ color: 'grey.400', '&:hover': { color: 'error.main' }, mt: 0.25 }}
			>
				<DeleteOutline fontSize="inherit" />
			</IconButton>
		</Box>
	)
}
