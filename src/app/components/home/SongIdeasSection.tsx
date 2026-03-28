'use client'

import useRecommendedSongs from '@/app/components/components/RecommendedSongsList/hooks/useRecommendedSongs'
import { Box, Typography } from '@/common/ui'
import { useTheme } from '@/common/ui'
import { useMediaQuery } from '@/common/ui/mui'
import { SongVariantCard } from '@/common/ui/SongCard'
import { styled } from '@mui/system'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import SongCardSkeleton from './SongCardSkeleton'

const SectionWrapper = styled(Box)(({ theme }) => ({
	width: '100%',
	padding: '48px 0 40px',
}))

const SectionHeader = styled(Box)({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	marginBottom: 24,
	paddingLeft: 24,
	paddingRight: 24,
	maxWidth: 1320,
	marginLeft: 'auto',
	marginRight: 'auto',
})

const ScrollContainer = styled(Box)({
	display: 'flex',
	gap: 16,
	overflowX: 'auto',
	overflowY: 'hidden',
	scrollBehavior: 'smooth',
	scrollSnapType: 'x mandatory',
	paddingLeft: 24,
	paddingRight: 24,
	paddingBottom: 8,
	'&::-webkit-scrollbar': {
		height: 4,
	},
	'&::-webkit-scrollbar-track': {
		background: 'transparent',
	},
	'&::-webkit-scrollbar-thumb': {
		background: 'rgba(0, 0, 0, 0.12)',
		borderRadius: 4,
	},
})

const CardWrapper = styled(Box)({
	flexShrink: 0,
	scrollSnapAlign: 'start',
	width: 260,
})

const ScrollIndicator = styled(Box)({
	display: 'flex',
	gap: 6,
	justifyContent: 'center',
	marginTop: 20,
})

const Dot = styled(Box)<{ active?: boolean }>(({ active }) => ({
	width: 6,
	height: 6,
	borderRadius: '50%',
	backgroundColor: active ? 'rgba(0, 133, 255, 0.6)' : 'rgba(0, 0, 0, 0.12)',
	transition: 'background-color 0.3s ease',
}))

export default function SongIdeasSection() {
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down(700))
	const tHome = useTranslations('home')
	const { data, isLoading } = useRecommendedSongs()
	const scrollRef = useRef<HTMLDivElement>(null)
	const [activeIndex, setActiveIndex] = useState(0)

	const handleScroll = () => {
		if (!scrollRef.current) return
		const scrollLeft = scrollRef.current.scrollLeft
		const cardWidth = 260 + 16
		const newIndex = Math.round(scrollLeft / cardWidth)
		setActiveIndex(newIndex)
	}

	const songs = data.slice(0, 8)
	const totalDots = Math.min(songs.length, 8)

	return (
		<SectionWrapper>
			<SectionHeader>
				<Box>
					<Typography
						variant="h4"
						strong={700}
						sx={{ letterSpacing: '-0.02em' }}
					>
						{tHome('recommended.idea')}
					</Typography>
					<Typography
						color="grey.500"
						sx={{ mt: 0.5, fontSize: '0.9rem' }}
					>
						{tHome('hero.subtitle')}
					</Typography>
				</Box>
			</SectionHeader>

			<ScrollContainer ref={scrollRef} onScroll={handleScroll}>
				{isLoading &&
					Array.from({ length: 4 }).map((_, i) => (
						<CardWrapper key={`skeleton-${i}`}>
							<motion.div
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: i * 0.08 }}
							>
								<SongCardSkeleton />
							</motion.div>
						</CardWrapper>
					))}

				{!isLoading &&
					songs.map((song, i) => (
						<CardWrapper key={song.packGuid}>
							<motion.div
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.35, delay: i * 0.06 }}
							>
								<SongVariantCard
									data={song}
									flexibleHeight
								/>
							</motion.div>
						</CardWrapper>
					))}
			</ScrollContainer>

			{isMobile && totalDots > 1 && (
				<ScrollIndicator>
					{Array.from({ length: totalDots }).map((_, i) => (
						<Dot key={i} active={i === activeIndex} />
					))}
				</ScrollIndicator>
			)}
		</SectionWrapper>
	)
}
