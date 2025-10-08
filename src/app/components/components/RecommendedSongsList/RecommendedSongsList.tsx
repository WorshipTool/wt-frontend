'use client'
import { Typography, useTheme } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import { Grid } from '@/common/ui/mui/Grid'
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
	paddingTop: 5,
}))

type RecommendedSongsListProps = {
	listType?: SongListCardsProps['variant']
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
			<Typography strong key={'idea'}>
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
						spacing={1}
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
				<SongListCards
					data={data.slice(0, 4)}
					variant={listType}
					// properties={['SHOW_ADDED_BY_LOADER']}
				/>
			</GridContainer>
		</ContainerGrid>
	)
}
