'use client'
import JoinTeamPopup from '@/app/(layout)/sub/tymy/components/JoinTeamPopup'
import { Box, Button, Typography, useTheme } from '@/common/ui'
import { grey } from '@/common/ui/mui/colors'
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
				bgcolor: grey[300],
				padding: 1.5,
				paddingX: 3,
				borderRadius: 3,
				boxShadow: '0px 0px 10px 0px rgba(0,2px,0,0.1)',
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
