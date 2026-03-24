'use client'
import { Typography, useTheme } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import { Grid } from '@/common/ui/mui/Grid'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import ContainerGrid from '../../../../common/components/ContainerGrid'
import SongListCards, {
	SongListCardsProps,
} from '../../../../common/components/songLists/SongListCards/SongListCards'
import SongCardSkeleton from './SongCardSkeleton'
import useRecommendedSongs from './hooks/useRecommendedSongs'

const GridContainer = styled(Grid)(({ theme }) => ({
	padding: 10,
	paddingTop: 8,
}))

type RecommendedSongsListProps = {
	listType?: SongListCardsProps['variant']
}

const containerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.15,
		},
	},
}

const itemVariants = {
	hidden: { opacity: 0, y: 24, scale: 0.96 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.5,
			ease: [0.16, 1, 0.3, 1],
		},
	},
}

export default function RecommendedSongsList({
	listType = 'row',
}: RecommendedSongsListProps) {
	const theme = useTheme()
	const tHome = useTranslations('home')
	const { data, isLoading, isError } = useRecommendedSongs()

	const [init, setInit] = useState(false)
	useEffect(() => {
		setInit(true)
	}, [])

	return (
		<ContainerGrid
			sx={{
				width: '100%',
			}}
		>
			<Typography
				strong
				key={'idea'}
				sx={{
					background: `linear-gradient(135deg, ${theme.palette.grey[700]}, ${theme.palette.primary.dark})`,
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					backgroundClip: 'text',
					letterSpacing: '0.02em',
				}}
			>
				{tHome('recommended.idea')}
			</Typography>

			{isError && (
				<Typography>{tHome('recommended.error')}</Typography>
			)}

			<GridContainer
				container
				columns={{ xs: 1, sm: 2, md: 4 }}
				sx={{ padding: 0 }}
			>
				{(!init || isLoading) && (
					<Grid
						container
						columns={{ xs: 1, md: 2, lg: 4 }}
						spacing={1.5}
						sx={{
							width: `calc(100% + ${theme.spacing(2)})`,
						}}
					>
						{Array.from({ length: 4 }).map((_, i) => (
							<Grid item xs={1} key={i}>
								<SongCardSkeleton />
							</Grid>
						))}
					</Grid>
				)}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					style={{
						display: 'contents',
					}}
				>
					<SongListCards
						data={data.slice(0, 4)}
						variant={listType}
					/>
				</motion.div>
			</GridContainer>
		</ContainerGrid>
	)
}
