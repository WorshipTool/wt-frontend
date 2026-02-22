'use client'

/**
 * Broadcast Message Popup Component
 *
 * Displays an admin-configured broadcast message to the user.
 * The user can dismiss it; the dismissal is persisted to localStorage.
 */

import Popup from '@/common/components/Popup/Popup'
import { Box, Button, IconButton } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { Close } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useBroadcastMessage } from './BroadcastMessageContext'

export function BroadcastMessagePopup() {
	const { isPopupOpen, messageToShow, dismissMessage } = useBroadcastMessage()
	const t = useTranslations('broadcastMessage')

	if (!messageToShow) {
		return null
	}

	return (
		<Popup open={isPopupOpen} onClose={dismissMessage} width={480}>
			<Box>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Box
						sx={{
							bgcolor: 'warning.light',
							color: 'warning.contrastText',
							width: 'fit-content',
							padding: '2px 12px',
							borderRadius: 2,
						}}
					>
						<Typography variant="subtitle1" strong={500}>
							{t('popupLabel')}
						</Typography>
					</Box>

					<IconButton small onClick={dismissMessage}>
						<Close fontSize="inherit" />
					</IconButton>
				</Box>
				<Gap value={2} />
				<Box
					display="flex"
					flexDirection="column"
					gap={2}
					maxHeight="60vh"
					sx={{ overflowY: 'auto' }}
				>
					<Typography variant="h4" strong sx={{ letterSpacing: '0.02em' }}>
						{messageToShow.title}
					</Typography>
					<Typography variant="subtitle1" strong={300}>
						{messageToShow.description}
					</Typography>
				</Box>
				<Gap value={2} />
				<Box sx={{ display: 'flex', justifyContent: 'center' }}>
					<Button
						sx={{ borderRadius: 3, paddingX: 5 }}
						variant="contained"
						onClick={dismissMessage}
					>
						{t('popupDismiss')}
					</Button>
				</Box>
				<Gap value={1} />
			</Box>
		</Popup>
	)
}
