'use client'

import { Box, Button, IconButton } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha } from '@/common/ui/mui'
import { Close, Delete, Send, TextFields } from '@mui/icons-material'
import type { ElementSuggestion } from './types'

const ACCENT = '#FF6B35'
const ACCENT_DARK = '#d45520'

type AdminFeedbackPanelProps = {
	suggestions: ElementSuggestion[]
	isSubmitting: boolean
	onClose: () => void
	onRemove: (id: string) => void
	onClearAll: () => void
	onSubmitAll: () => void
	submitDisabled: boolean
}

export default function AdminFeedbackPanel({
	suggestions,
	isSubmitting,
	onClose,
	onRemove,
	onClearAll,
	onSubmitAll,
	submitDisabled,
}: AdminFeedbackPanelProps) {
	return (
		<Box
			data-feedback-popup="true"
			sx={{
				position: 'fixed',
				bottom: 100,
				right: 24,
				width: 380,
				maxHeight: '70vh',
				zIndex: 99998,
				bgcolor: 'white',
				borderRadius: 2.5,
				boxShadow: '0 12px 40px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.12)',
				border: '1.5px solid',
				borderColor: alpha(ACCENT, 0.3),
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
			}}
			onContextMenu={(e: React.MouseEvent) => e.stopPropagation()}
		>
			{/* Header */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					px: 2,
					py: 1.25,
					bgcolor: alpha(ACCENT, 0.07),
					borderBottom: '1px solid',
					borderColor: alpha(ACCENT, 0.15),
					flexShrink: 0,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
					<Box
						sx={{
							width: 20,
							height: 20,
							borderRadius: '50%',
							bgcolor: ACCENT,
							color: 'white',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '0.7rem',
							fontWeight: 700,
							flexShrink: 0,
						}}
					>
						{suggestions.length}
					</Box>
					<Typography variant="subtitle1" strong={600} sx={{ color: ACCENT_DARK, fontSize: '0.85rem' }}>
						Navrhované úpravy
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<IconButton
						small
						onClick={onClearAll}
						aria-label="Smazat vše"
					>
						<Delete fontSize="inherit" />
					</IconButton>
					<IconButton small onClick={onClose} aria-label="Zavřít panel">
						<Close fontSize="inherit" />
					</IconButton>
				</Box>
			</Box>

			{/* Suggestion list */}
			<Box
				sx={{
					flex: 1,
					overflowY: 'auto',
					px: 1.5,
					py: 1,
					display: 'flex',
					flexDirection: 'column',
					gap: 0.75,
					width: '100%',
				}}
			>
				{suggestions.map((s, i) => (
					<Box
						key={s.id}
						sx={{
							p: 1.25,
							borderRadius: 1.5,
							border: '1px solid',
							borderColor: alpha('#000', 0.08),
							bgcolor: alpha(ACCENT, 0.025),
							position: 'relative',
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
							<Box
								sx={{
									width: 18,
									height: 18,
									borderRadius: '50%',
									bgcolor: alpha(ACCENT, 0.15),
									color: ACCENT_DARK,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '0.65rem',
									fontWeight: 700,
									flexShrink: 0,
									mt: '1px',
								}}
							>
								{i + 1}
							</Box>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								{/* Element info */}
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
									<TextFields sx={{ fontSize: 11, color: 'grey.400', flexShrink: 0 }} />
									<Typography
										variant="normal"
										size="0.68rem"
										color="grey.500"
										sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
									>
										{s.elementDescription}
									</Typography>
								</Box>

								{/* Selected text or element preview */}
								{(s.selectedText || s.elementTextPreview) && (
									<Typography
										variant="normal"
										size="0.7rem"
										color="grey.600"
										sx={{ display: 'block', mb: 0.5, fontStyle: s.selectedText ? 'italic' : 'normal', lineHeight: 1.3 }}
									>
										{s.selectedText
											? `"${s.selectedText.length > 50 ? s.selectedText.slice(0, 50) + '…' : s.selectedText}"`
											: (s.elementTextPreview.length > 50 ? s.elementTextPreview.slice(0, 50) + '…' : s.elementTextPreview)
										}
									</Typography>
								)}

								{/* Suggestion text */}
								<Typography
									variant="normal"
									size="0.78rem"
									color="grey.900"
									sx={{ lineHeight: 1.4 }}
								>
									{s.suggestion}
								</Typography>
							</Box>

							<IconButton
								small
								onClick={() => onRemove(s.id)}
								aria-label={`Odebrat návrh ${i + 1}`}
								sx={{ flexShrink: 0 }}
							>
								<Close sx={{ fontSize: 12 }} />
							</IconButton>
						</Box>
					</Box>
				))}
			</Box>

			<Gap value={0.5} />

			{/* Footer */}
			<Box
				sx={{
					px: 1.5,
					pb: 1.5,
					flexShrink: 0,
					borderTop: '1px solid',
					borderColor: alpha('#000', 0.06),
					pt: 1,
				}}
			>
				<Typography variant="normal" size="0.7rem" color="grey.400" sx={{ display: 'block', mb: 0.75, textAlign: 'center' }}>
					Všechny návrhy budou odeslány jako jeden task k implementaci
				</Typography>
				<Button
					color="primarygradient"
					onClick={onSubmitAll}
					loading={isSubmitting}
					disabled={submitDisabled}
					sx={{
						borderRadius: 2,
						py: 1,
						fontSize: '0.85rem',
						fontWeight: 600,
						background: !submitDisabled
							? `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`
							: undefined,
						gap: 0.75,
					}}
				>
					<Send sx={{ fontSize: 16 }} />
					Odeslat {suggestions.length} {suggestions.length === 1 ? 'návrh' : suggestions.length < 5 ? 'návrhy' : 'návrhů'}
				</Button>
			</Box>
		</Box>
	)
}
