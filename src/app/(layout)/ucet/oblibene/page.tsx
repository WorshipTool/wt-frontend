'use client'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import FavouritesListOrderSelect, {
	FavouritesOrderOptions,
} from '@/app/(layout)/ucet/oblibene/components/FavouritesListOrderSelect'
import FavouritesRowItem from '@/app/(layout)/ucet/oblibene/components/FavouritesRowItem'
import { MobileSongListView } from '@/common/components/MobileAppHeader'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import Pager from '@/common/components/Pager/Pager'
import { Box, Typography } from '@/common/ui'
import { useFavourites } from '@/hooks/favourites/useFavourites'
import { useSelection } from '@/hooks/playlist/useSelection'
import { useUrlState } from '@/hooks/urlstate/useUrlState'
import {
	PlaylistGuid,
	PlaylistItemDto,
} from '@/interfaces/playlist/playlist.types'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

export default SmartPage(page, ['middleWidth', 'topPadding'])

export type FavouriteItem = {
	data: PlaylistItemDto
	teamAlias?: string
	teamName?: string
}

function page() {
	const t = useTranslations('account.favourites')
	const phoneVersion = useIsPhone()
	const { selectionGuid, items: bsItems } = useFavourites()

	const { items: allItems, loading } = useSelection(selectionGuid as PlaylistGuid)

	const [sortOption, setSortOption] = useUrlState<FavouritesOrderOptions>(
		'sortKey',
		'addedAt'
	)

	// sort items
	const items: FavouriteItem[] = useMemo(() => {
		const arr = allItems
			.sort((a, b) => {
				if (sortOption === 'addedAt') {
					return a.order > b.order ? -1 : 1
				}
				if (sortOption === 'title') {
					return a.pack.title.localeCompare(b.pack.title)
				}
				return 0
			})
			.map((variant, index) => {
				const team = bsItems?.find(
					(item) => item.packGuid === variant.pack.packGuid
				)
				return {
					data: variant,
					teamAlias: team?.teamAlias,
					teamName: team?.teamName,
				}
			})
		return [...arr]
	}, [allItems, sortOption, bsItems])

	if (phoneVersion) {
		return (
			<MobileSongListView
				title={t('title')}
				subtitle={
					loading ? undefined : t('totalSongs', { count: items.length.toString() })
				}
				backTo="account"
				items={items.map((i) => i.data.pack)}
				loading={loading}
				emptyText={t('noFavourites')}
			/>
		)
	}

	return (
		<Box display={'flex'} flexDirection={'column'} gap={2}>
			<Box display={'flex'} gap={2} alignItems={'center'}>
				<Typography
					variant="h4"
					strong
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1,
					}}
				>
					{/* <Favorite /> */}
{t('title')}
				</Typography>

				<Typography thin color="grey.500">
{t('totalSongs', { count: items.length.toString() })}
				</Typography>
				<Box flex={1} />

				<FavouritesListOrderSelect
					onChange={setSortOption}
					startValue={sortOption || undefined}
				/>
			</Box>

			{items.length === 0 ? (
				<Typography
					italic
					color="grey.500"
					sx={{
						textAlign: 'center',
					}}
				>
{t('noFavourites')}
				</Typography>
			) : (
				<></>
			)}

			<Pager data={items} take={5}>
				{(part, loading, startIndex) => {
					return (
						<Box display={'flex'} flexDirection={'column'} gap={1}>
							{part.map((item, index) => {
								return (
									<FavouritesRowItem
										key={item.data.guid}
										data={item}
										index={startIndex + index}
									/>
								)
							})}
						</Box>
					)
				}}
			</Pager>
		</Box>
	)
}
