'use client'
import { GetTeamStatisticsOutDto } from '@/api/generated'
import TeamStatisticsCard from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/statistiky/components/TeamStatisticsCard'
import { getStatisticsColorFromString } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/statistiky/tech/statistics.tech'
import { BarChart } from '@mui/x-charts'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

type DataItem = {
	song: string
	playedCount: number
}

type LeastPlayedSongsEverCardProps = {
	data: GetTeamStatisticsOutDto['leastPlayedSongs']
}

export default function LeastPlayedSongsEverCard(
	props: LeastPlayedSongsEverCardProps
) {
	const t = useTranslations('teams.statistics')
	
	const dataset: DataItem[] = useMemo(() => {
		return props.data
			.map((item) => {
				return item.songs.map((song) => ({
					song: song.title,
					playedCount: item.playedCount,
				}))
			})
			.flat()
			.sort((a, b) => a.playedCount - b.playedCount)
			.slice(0, 10)
	}, [props.data])

	return (
		<TeamStatisticsCard
			label={t('leastPlayedSongs')}
			rightLabel={t('allTime')}
		>
			<BarChart
				dataset={dataset}
				yAxis={[
					{
						scaleType: 'band',
						dataKey: 'song',
						colorMap: {
							type: 'ordinal',
							colors: dataset.map((item) => {
								return getStatisticsColorFromString(item.song)
							}),
						},
					},
				]}
				series={[
					{
						dataKey: 'playedCount',
						// label: 'Počet přehrání',
						valueFormatter: (v) => v + '',
					},
				]}
				layout="horizontal"
				height={400}
				margin={{
					left: 150,
				}}
			/>
		</TeamStatisticsCard>
	)
}
