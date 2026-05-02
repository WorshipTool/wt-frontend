'use client'

import useLastAddedSongs from '@/app/components/components/LastAddedSongsList/hooks/useLastAddedSongs'
import { Box, Button, Typography } from '@/common/ui'
import { useTheme } from '@/common/ui'
import { useMediaQuery } from '@/common/ui/mui'
import { Grid } from '@/common/ui/mui/Grid'
import { SongVariantCard } from '@/common/ui/SongCard'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { styled } from '@mui/system'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import SongCardSkeleton from './SongCardSkeleton'

const SectionWrapper = styled(Box)({
	width: '100%',
	maxWidth: 1320,
	marginLeft: 'auto',
	marginRight: 'auto',
	padding: '40px 24px 56px',
})

const SectionHeader = styled(Box)({
	display: 'flex',
	alignItems: 'flex-end',
	justifyContent: 'space-between',
	marginBottom: 28,
	gap: 16,
})

const DividerLine = styled(Box)(({ theme }) => ({
	height: 1,
	background: `linear-gradient(90deg, ${theme.palette.grey[200]} 0%, transparent 100%)`,
	marginBottom: 40,
	maxWidth: 1320,
	marginLeft: 'auto',
	marginRight: 'auto',
	paddingLeft: 24,
	paddingRight: 24,
}))

export default function RecentlyAddedSection() {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down(700))
	const tHome = useTranslations('home')
	const { data, isLoading } = useLastAddedSongs()

	const songs = data.slice(0, isMobile ? 4 : 8)
	const columns = isMobile ? 1 : 4

	return (
		<>
			<Box sx={{ px: 3, maxWidth: 1320, mx: 'auto' }}>
				<DividerLine />
			</Box>

			<SectionWrapper>
				<SectionHeader>
					<Box>
						<Typography
							variant="h4"
							strong={700}
							sx={{ letterSpacing: '-0.02em' }}
						>
							{tHome('lastAdded.title')}
						</Typography>
					</Box>
					<Button
						to="songsList"
						toParams={{}}
						variant="text"
						size="small"
						sx={{
							textTransform: 'none',
							fontWeight: 500,
							gap: 0.5,
							color: theme.palette.primary.main,
							'&:hover': {
								backgroundColor: 'rgba(0, 133, 255, 0.04)',
							},
						}}
					>
						{tHome('allList.browse')}
						<ArrowForwardIcon sx={{ fontSize: '1rem' }} />
					</Button>
				</SectionHeader>

				<Grid container spacing={2} columns={columns}>
					{isLoading &&
						Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => (
							<Grid item xs={1} key={`skeleton-${i}`}>
								<motion.div
									initial={{ opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: i * 0.08 }}
								>
									<SongCardSkeleton />
								</motion.div>
							</Grid>
						))}

					{!isLoading &&
						songs.map((song, i) => (
							<Grid item xs={1} key={song.packGuid}>
								<motion.div
									initial={{ opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4, delay: i * 0.05 }}
								>
									<SongVariantCard
										data={song}
										flexibleHeight
										properties={['SHOW_PUBLISHED_DATE']}
									/>
								</motion.div>
							</Grid>
						))}
				</Grid>
			</SectionWrapper>
		</>
	)
}
