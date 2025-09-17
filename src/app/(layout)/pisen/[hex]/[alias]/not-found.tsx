import { Box, Button } from '@/common/ui'
import { Paper, Stack } from '@/common/ui/mui'
import { Typography } from '../../../../../common/ui/Typography/Typography'
import { LibraryMusicOutlined, ArrowBack, Home } from '@mui/icons-material'

export default function NotFound() {
	const handleBackClick = () => {
		if (typeof window !== 'undefined') {
			window.history.back()
		}
	}

	const handleHomeClick = () => {
		window.location.href = '/'
	}

	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '60vh',
				p: 3,
			}}
		>
			<Paper
				elevation={6}
				sx={{
					p: 6,
					textAlign: 'center',
					borderRadius: 3,
					background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
					border: '1px solid',
					borderColor: 'divider',
					maxWidth: '500px',
					width: '100%',
					animation: 'fadeInScale 0.6s ease-out',
					'@keyframes fadeInScale': {
						'0%': {
							opacity: 0,
							transform: 'scale(0.9)',
						},
						'100%': {
							opacity: 1,
							transform: 'scale(1)',
						},
					},
				}}
			>
				<Stack spacing={3} alignItems="center">
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
						<LibraryMusicOutlined
							sx={{
								fontSize: 48,
								color: 'white',
							}}
						/>
					</Box>

					<Box>
						<Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
							Píseň nebyla nalezena
						</Typography>
						<Typography variant="normal" color="text.secondary" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
							Zdá se, že hledaná píseň neexistuje nebo byla odstraněna.
							<br />
							Zkuste se vrátit zpět nebo přejít na hlavní stránku.
						</Typography>
					</Box>

					<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
						<Button
							variant="outlined"
							size="medium"
							onClick={handleBackClick}
							startIcon={<ArrowBack />}
							sx={{
								px: 3,
								py: 1,
								borderRadius: 2,
								textTransform: 'none',
								fontSize: '0.95rem',
								fontWeight: 500,
								borderColor: '#0085FF',
								color: '#0085FF',
								transition: 'all 0.3s ease',
								'&:hover': {
									borderColor: '#532EE7',
									color: '#532EE7',
									backgroundColor: 'rgba(0, 133, 255, 0.04)',
								},
							}}
						>
							Zpět
						</Button>
						<Button
							variant="contained"
							size="medium"
							onClick={handleHomeClick}
							startIcon={<Home />}
							sx={{
								px: 3,
								py: 1,
								borderRadius: 2,
								textTransform: 'none',
								fontSize: '0.95rem',
								fontWeight: 500,
								background: 'linear-gradient(135deg, #0085FF, #532EE7)',
								boxShadow: '0 4px 16px rgba(0, 133, 255, 0.3)',
								transition: 'all 0.3s ease',
								'&:hover': {
									background: 'linear-gradient(135deg, #0070e0, #4a27d1)',
									boxShadow: '0 6px 20px rgba(0, 133, 255, 0.4)',
								},
							}}
						>
							Hlavní stránka
						</Button>
					</Stack>
				</Stack>
			</Paper>
		</Box>
	)
}
