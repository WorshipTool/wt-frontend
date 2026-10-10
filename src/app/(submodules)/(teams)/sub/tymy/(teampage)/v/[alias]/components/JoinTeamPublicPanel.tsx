'use client'
import JoinTeamPopup from '@/app/(layout)/sub/tymy/components/JoinTeamPopup'
import { SURFACE_CARD_SX, SURFACE_SHADOW } from '@/common/constants/surfaces'
import { Box, Button, Typography, useTheme } from '@/common/ui'
import useAuth from '@/hooks/auth/useAuth'
import { useState } from 'react'

export default function JoinTeamPublicPanel() {
	const theme = useTheme()
	const { user } = useAuth()

	const [open, setOpen] = useState(false)
	return (
		<Box
			display={'flex'}
			flexDirection={'row'}
			alignItems={'center'}
			justifyContent={'center'}
			gap={2}
			zIndex={1}
			sx={{
				...SURFACE_CARD_SX,
				padding: 1.5,
				paddingX: 3,
				boxShadow: SURFACE_SHADOW.raised,
				// width: 500,

				[theme.breakpoints.up('md')]: {
					position: 'absolute',
					top: 16,
					left: '50%',
					transform: 'translateX(-50%)',
				},
			}}
		>
			{user ? (
				<>
					<Typography size={'large'} sx={{ userSelect: 'none' }}>
						Připojte se k týmu pomocí kódu
					</Typography>
					<Button
						color="primarygradient"
						size="small"
						onClick={() => setOpen(true)}
					>
						Připojit se
					</Button>

					<JoinTeamPopup open={open} onClose={() => setOpen(false)} />
				</>
			) : (
				<>
					<Typography
						size={'large'}
						sx={{
							userSelect: 'none',
						}}
					>
						Pro zobrazení více možností se přihlaste
					</Typography>
				</>
			)}
		</Box>
	)
}
