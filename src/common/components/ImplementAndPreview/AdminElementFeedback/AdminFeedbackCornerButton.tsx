'use client'

import { CornerStack } from '@/common/components/CornerStack'
import { Box, IconButton } from '@/common/ui'
import { Badge } from '@/common/ui/mui'
import { RateReview } from '@mui/icons-material'
import { useState } from 'react'
import { useAdminElementFeedback } from './AdminElementFeedbackContext'
import AdminFeedbackPanel from './AdminFeedbackPanel'

const ACCENT = '#FF6B35'

/**
 * Corner button shown when admin has pending element suggestions queued.
 * Opens the panel to review and submit all suggestions at once.
 */
export default function AdminFeedbackCornerButton() {
	const { suggestions, isCollectingMode, removeSuggestion, clearAll, submitAll, isSubmitting } =
		useAdminElementFeedback()
	const [panelOpen, setPanelOpen] = useState(false)

	if (!isCollectingMode) return null

	const handleSubmitAll = async () => {
		await submitAll()
		setPanelOpen(false)
	}

	const handleClearAll = () => {
		clearAll()
		setPanelOpen(false)
	}

	return (
		<>
			{/* Corner button */}
			<CornerStack corner="bottom-right" order={2}>
				<Box sx={{ position: 'relative' }}>
					<Badge
						badgeContent={suggestions.length}
						sx={{
							'& .MuiBadge-badge': {
								right: 6,
								top: 4,
								pointerEvents: 'none',
								bgcolor: ACCENT,
								color: 'white',
								border: '2px solid white',
								fontWeight: 700,
								fontSize: '0.65rem',
								minWidth: 18,
								height: 18,
							},
						}}
					>
						<IconButton
							size="small"
							onClick={() => setPanelOpen((prev) => !prev)}
							variant="contained"
							aria-label={`Zobrazit ${suggestions.length} navrhovaných úprav`}
							sx={{
								bgcolor: ACCENT,
								color: 'white',
								'&:hover': { bgcolor: '#d45520' },
								boxShadow: `0 4px 14px rgba(255, 107, 53, 0.45)`,
								animation: panelOpen ? 'none' : 'feedbackPulse 2s infinite',
								'@keyframes feedbackPulse': {
									'0%, 100%': { boxShadow: `0 4px 14px rgba(255, 107, 53, 0.45)` },
									'50%': { boxShadow: `0 4px 20px rgba(255, 107, 53, 0.75)` },
								},
							}}
						>
							<RateReview />
						</IconButton>
					</Badge>
				</Box>
			</CornerStack>

			{/* Panel */}
			{panelOpen && (
				<AdminFeedbackPanel
					suggestions={suggestions}
					isSubmitting={isSubmitting}
					onClose={() => setPanelOpen(false)}
					onRemove={removeSuggestion}
					onClearAll={handleClearAll}
					onSubmitAll={handleSubmitAll}
					submitDisabled={suggestions.length === 0 || isSubmitting}
				/>
			)}
		</>
	)
}
