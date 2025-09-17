import TeamCard from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TeamCard/TeamCard'
import { TeamPageTitle } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TopPanel/components/TeamPageTitle'
import { Typography, Button } from '@/common/ui'
import { Stack } from '@/common/ui/mui'
import { LibraryMusicOutlined, ArrowBack } from '@mui/icons-material'

export default function NotFound() {
	const handleBackClick = () => {
		if (typeof window !== 'undefined') {
			window.history.back()
		}
	}

	return (
		<TeamCard>
			<Stack 
				spacing={3} 
				alignItems="center" 
				sx={{ 
					py: 4,
					animation: 'fadeInUp 0.6s ease-out',
					'@keyframes fadeInUp': {
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
				<LibraryMusicOutlined
					sx={{
						fontSize: 64,
						color: '#0085FF',
						filter: 'drop-shadow(0 4px 8px rgba(0, 133, 255, 0.3))',
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
				/>

				<TeamPageTitle>Píseň nenalezena</TeamPageTitle>
				
				<Typography 
					variant="normal" 
					sx={{ 
						textAlign: 'center', 
						color: 'text.secondary',
						fontSize: '1.1rem',
						lineHeight: 1.6,
						maxWidth: '400px'
					}}
				>
					Požadovaná píseň neexistuje nebo byla odstraněna z tohoto týmu.
					<br />
					Zkuste se vrátit zpět a vybrat jinou píseň.
				</Typography>

				<Button
					variant="contained"
					onClick={handleBackClick}
					startIcon={<ArrowBack />}
					sx={{
						px: 4,
						py: 1.5,
						borderRadius: 3,
						textTransform: 'none',
						fontSize: '1rem',
						fontWeight: 600,
						background: 'linear-gradient(135deg, #0085FF, #532EE7)',
						boxShadow: '0 4px 16px rgba(0, 133, 255, 0.3)',
						transition: 'all 0.3s ease',
						animation: 'slideInUp 0.6s ease-out 0.4s both',
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
						'&:hover': {
							background: 'linear-gradient(135deg, #0070e0, #4a27d1)',
							boxShadow: '0 6px 20px rgba(0, 133, 255, 0.4)',
						},
					}}
				>
					Zpět na tým
				</Button>
			</Stack>
		</TeamCard>
	)
}
