'use client'

import { ErrorPageProps } from '@/common/types'
import { Box, Button, Typography } from '@/common/ui'
import { Container, Paper, Stack } from '@/common/ui/mui'
import { LockPerson, ErrorOutline, Refresh, Home } from '@mui/icons-material'
import { useEffect, useMemo } from 'react'

type ErrorType = 'forbidden' | 'default'

export default function Error({ error, reset }: ErrorPageProps) {
	const errorType: ErrorType = useMemo(() => {
		return error.message.includes('Forbidden') ? 'forbidden' : 'default'
	}, [error])

	useEffect(() => {
		console.error(error)
		//TODO: send report to admin
	}, [error])

	const handleHomeClick = () => {
		window.location.href = '/'
	}

	return (
		<Container
			maxWidth="sm"
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				py: 4,
			}}
		>
			<Paper
				elevation={8}
				sx={{
					p: 6,
					textAlign: 'center',
					borderRadius: 4,
					background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
					border: '1px solid',
					borderColor: 'divider',
					animation: 'fadeInUp 0.6s ease-out',
					'@keyframes fadeInUp': {
						'0%': {
							opacity: 0,
							transform: 'translateY(30px)',
						},
						'100%': {
							opacity: 1,
							transform: 'translateY(0)',
						},
					},
				}}
			>
				<Stack spacing={4} alignItems="center">
					{errorType === 'forbidden' ? (
						<>
							<Box
								sx={{
									p: 3,
									borderRadius: '50%',
									background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
									boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
									animation: 'scaleIn 0.5s ease-out 0.2s both',
									'@keyframes scaleIn': {
										'0%': {
											transform: 'scale(0)',
										},
										'100%': {
											transform: 'scale(1)',
										},
									},
								}}
							>
								<LockPerson
									sx={{
										fontSize: 64,
										color: 'white',
									}}
								/>
							</Box>
							<Box>
								<Typography variant="h4" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
									Přístup zakázán
								</Typography>
								<Typography variant="normal" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
									K zobrazení tohoto obsahu nemáte dostatečná oprávnění.
									<br />
									Kontaktujte administrátora pro více informací.
								</Typography>
							</Box>
						</>
					) : (
						<>
							<Box
								sx={{
									p: 3,
									borderRadius: '50%',
									background: 'linear-gradient(135deg, #0085FF, #532EE7)',
									boxShadow: '0 8px 32px rgba(0, 133, 255, 0.3)',
									animation: 'scaleIn 0.5s ease-out 0.2s both',
									'@keyframes scaleIn': {
										'0%': {
											transform: 'scale(0)',
										},
										'100%': {
											transform: 'scale(1)',
										},
									},
								}}
							>
								<ErrorOutline
									sx={{
										fontSize: 64,
										color: 'white',
									}}
								/>
							</Box>
							<Box>
								<Typography variant="h4" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
									Něco se pokazilo
								</Typography>
								<Typography variant="normal" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
									Nastala neočekávaná chyba při načítání stránky.
									<br />
									Zkuste to prosím znovu nebo se vraťte na hlavní stránku.
								</Typography>
							</Box>
						</>
					)}

					<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
						<Button
							variant="contained"
							size="large"
							onClick={reset}
							startIcon={<Refresh />}
							sx={{
								px: 4,
								py: 1.5,
								borderRadius: 3,
								textTransform: 'none',
								fontSize: '1rem',
								fontWeight: 600,
								background: 'linear-gradient(135deg, #0085FF, #532EE7)',
								boxShadow: '0 4px 20px rgba(0, 133, 255, 0.3)',
								transition: 'all 0.3s ease',
								'&:hover': {
									background: 'linear-gradient(135deg, #0070e0, #4a27d1)',
									boxShadow: '0 6px 24px rgba(0, 133, 255, 0.4)',
									transform: 'translateY(-2px)',
								},
							}}
						>
							Zkusit znovu
						</Button>
						<Button
							variant="outlined"
							size="large"
							onClick={handleHomeClick}
							startIcon={<Home />}
							sx={{
								px: 4,
								py: 1.5,
								borderRadius: 3,
								textTransform: 'none',
								fontSize: '1rem',
								fontWeight: 600,
								borderColor: '#0085FF',
								color: '#0085FF',
								transition: 'all 0.3s ease',
								'&:hover': {
									borderColor: '#532EE7',
									color: '#532EE7',
									backgroundColor: 'rgba(0, 133, 255, 0.04)',
									transform: 'translateY(-2px)',
								},
							}}
						>
							Hlavní stránka
						</Button>
					</Stack>
				</Stack>
			</Paper>
		</Container>
	)
}
