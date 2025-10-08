import { GetTeamStatisticsOutDto } from '@/api/generated'
import TeamStatisticsCard from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/statistiky/components/TeamStatisticsCard'
import { getStatisticsColorFromString } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/statistiky/tech/statistics.tech'
import OnlyAdmin from '@/common/components/admin/OnlyAdmin'
import { Box, Typography, useTheme } from '@/common/ui'
import { BarChart } from '@mui/x-charts'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

type DataItem = {
	songTitle: string
	trend: number
}

type MostTrendSongProps = {
	data: GetTeamStatisticsOutDto['mostTrendingSongs']
}

export default function MostTrendSong(props: MostTrendSongProps) {
	const t = useTranslations('teams.statistics')
	const theme = useTheme()
	const dataset: DataItem[] = useMemo(() => {
		const data = [
			...props.data
				.map((item) => {
					// Make title from multiple songs title, max three, separated by comma, then add and x more if there are more songs
					const title = item.song.title
					return {
						songTitle: title,
						trend: item.trending,
					}
				})
				.sort((a, b) => b.trend - a.trend),
		]

		return data
	}, [props.data])

	return (
		<TeamStatisticsCard
			label={t('trendingSongs')}
			rightLabel={t('timeFrame')}
		>
			{dataset.length > 0 ? (
				<>
					<Box display={'flex'} flexWrap={'wrap'} gap={0.5}>
						<Typography>{t('mostTrendSong')}</Typography>
						<Typography
							strong
							color={getStatisticsColorFromString(dataset[0].songTitle)}
						>
							{dataset[0].songTitle}
						</Typography>
					</Box>
					<BarChart
						dataset={dataset}
						yAxis={[
							{
								dataKey: 'trend',
							},
						]}
						xAxis={[
							{
								// data: ['a', 'b', 'c', 'd', 'e'],
								dataKey: 'songTitle',
								scaleType: 'band',

								colorMap: {
									type: 'ordinal',
									colors: dataset.map((item) => {
										return getStatisticsColorFromString(item.songTitle)
									}),
								},
							},
						]}
						series={[
							{
								dataKey: 'trend',
								// label: 'Počet přehrání',
								valueFormatter: (v) => v + '%',
							},
						]}
						layout="vertical"
						// {...chartSetting}
						height={376}
					/>
				</>
			) : (
				<>
					<Typography italic>{t('noDataAvailable')}</Typography>
					<Box display={'flex'}>
						<OnlyAdmin notCollapse>
							<Typography italic small>
								{t('needAtLeastOneSong')}
							</Typography>
						</OnlyAdmin>
					</Box>
				</>
			)}
		</TeamStatisticsCard>
	)
}
