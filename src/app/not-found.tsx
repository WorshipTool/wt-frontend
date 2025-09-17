import { Link } from '@/common/ui/Link/Link'
import { Container, Paper, Stack } from '@/common/ui/mui'
import { Box, Button, Typography } from '@/common/ui'
import { SearchOff, Home, ArrowBack } from '@mui/icons-material'

export default function NotFoundPage() {
	const handleBackClick = () => {
		if (typeof window !== 'undefined') {
			window.history.back()
		}
	}

	const handleHomeClick = () => {
		window.location.href = '/'
	}

	return (
		<Container
			maxWidth="md"
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
					p: { xs: 4, md: 8 },
					textAlign: 'center',
					borderRadius: 4,
					background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
					border: '1px solid',
					borderColor: 'divider',
					maxWidth: '600px',
					width: '100%',
					animation: 'fadeInUp 0.8s ease-out',
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
					<Box
						sx={{
							p: 4,
							borderRadius: '50%',
							background: 'linear-gradient(135deg, #EBBC1E, #f5d042)',
							boxShadow: '0 12px 40px rgba(235, 188, 30, 0.3)',
							animation: 'rotateIn 0.8s ease-out 0.3s both',
							'@keyframes rotateIn': {
								'0%': {
									transform: 'scale(0) rotate(-180deg)',
								},
								'100%': {
									transform: 'scale(1) rotate(0deg)',
								},
							},
						}}
					>
						<SearchOff
							sx={{
								fontSize: 80,
								color: 'white',
							}}
						/>
					</Box>

					<Box>
						<Typography 
							variant="h2" 
							sx={{ 
								fontWeight: 700, 
								color: '#2d3748',
								fontSize: { xs: '2.5rem', md: '3.5rem' },
								mb: 2,
								animation: 'slideInUp 0.6s ease-out 0.5s both',
								'@keyframes slideInUp': {
									'0%': {
										opacity: 0,
										transform: 'translateY(20px)',
									},
									'100%': {
										opacity: 1,
										transform: 'translateY(0)',
									},
								},
							}}
						>
							404
						</Typography>
						
						<Typography 
							variant="h4" 
							sx={{ 
								fontWeight: 600, 
								color: '#4a5568',
								mb: 2,
								animation: 'slideInUp 0.6s ease-out 0.6s both',
								'@keyframes slideInUp': {
									'0%': {
										opacity: 0,
										transform: 'translateY(20px)',
									},
									'100%': {
										opacity: 1,
										transform: 'translateY(0)',
									},
								},
							}}
						>
							Stránka nenalezena
						</Typography>

						<Typography 
							variant="normal" 
							color="text.secondary" 
							sx={{ 
								fontSize: '1.2rem', 
								lineHeight: 1.6,
								maxWidth: '480px',
								margin: '0 auto',
								animation: 'slideInUp 0.6s ease-out 0.7s both',
								'@keyframes slideInUp': {
									'0%': {
										opacity: 0,
										transform: 'translateY(20px)',
									},
									'100%': {
										opacity: 1,
										transform: 'translateY(0)',
									},
								},
							}}
						>
							Zdá se, že jste zabloudili do neprobádaných končin aplikace.
							<br />
							Stránka, kterou hledáte, neexistuje nebo byla přesunuta.
						</Typography>
					</Box>

					<Stack 
						direction={{ xs: 'column', sm: 'row' }} 
						spacing={3} 
						sx={{ 
							mt: 4,
							animation: 'slideInUp 0.6s ease-out 0.8s both',
							'@keyframes slideInUp': {
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
						<Button
							variant="contained"
							size="large"
							onClick={handleHomeClick}
							startIcon={<Home />}
							sx={{
								px: 5,
								py: 2,
								borderRadius: 3,
								textTransform: 'none',
								fontSize: '1.1rem',
								fontWeight: 600,
								background: 'linear-gradient(135deg, #0085FF, #532EE7)',
								boxShadow: '0 6px 24px rgba(0, 133, 255, 0.3)',
								minWidth: '180px',
								transition: 'all 0.3s ease',
								'&:hover': {
									background: 'linear-gradient(135deg, #0070e0, #4a27d1)',
									boxShadow: '0 8px 32px rgba(0, 133, 255, 0.4)',
									transform: 'translateY(-2px)',
								},
							}}
						>
							Hlavní stránka
						</Button>
						
						<Button
							variant="outlined"
							size="large"
							onClick={handleBackClick}
							startIcon={<ArrowBack />}
							sx={{
								px: 5,
								py: 2,
								borderRadius: 3,
								textTransform: 'none',
								fontSize: '1.1rem',
								fontWeight: 600,
								borderColor: '#EBBC1E',
								color: '#EBBC1E',
								minWidth: '180px',
								transition: 'all 0.3s ease',
								'&:hover': {
									borderColor: '#d4a91a',
									color: '#d4a91a',
									backgroundColor: 'rgba(235, 188, 30, 0.04)',
									transform: 'translateY(-2px)',
								},
							}}
						>
							Zpět
						</Button>
					</Stack>
				</Stack>
			</Paper>
		</Container>
	)
}
