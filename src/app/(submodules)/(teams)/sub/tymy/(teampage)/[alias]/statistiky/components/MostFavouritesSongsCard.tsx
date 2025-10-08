import { GetTeamStatisticsOutDto } from '@/api/generated'
import TeamStatisticsCard from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/statistiky/components/TeamStatisticsCard'
import OnlyAdmin from '@/common/components/admin/OnlyAdmin'
import { Box, Gap, Typography } from '@/common/ui'
import { useTranslations } from 'next-intl'

type MostFavouritesSongsCardProps = {
	data: GetTeamStatisticsOutDto['mostFavouriteSongs']
}

export default function MostFavouritesSongsCard(
	props: MostFavouritesSongsCardProps
) {
	const t = useTranslations('teams.statistics')
	
	const items = props.data
		.sort((a, b) => b.favouriteCount - a.favouriteCount)
		.filter((item) => item.favouriteCount > 0)
		.slice(0, 5)
	return (
		<TeamStatisticsCard label={t('favoriteSongs')}>
			<Gap value={0.5} />
			{items.length < 3 ? (
				<>
					<Typography italic>{t('dataNotAvailable')}</Typography>
					<Box display={'flex'}>
						<OnlyAdmin notCollapse>
							<Typography italic small>
								{t('favoriteSongsRequirement')}
							</Typography>
						</OnlyAdmin>
					</Box>
				</>
			) : (
				<>
					{items.map((item, index) => (
						<Typography key={item.song.title} {...(index === 0 ? {} : {})}>
							{index + 1}. {item.song.title}
						</Typography>
					))}
				</>
			)}
		</TeamStatisticsCard>
	)
}
