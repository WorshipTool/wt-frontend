'use client'
import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { Masonry } from '@/common/ui/Masonry'
import { Grid } from '@/common/ui/mui/Grid'
import { groupSearchResults } from '@/common/components/songLists/songGroups'
import SongGroupCard from '@/common/ui/SongCard/SongGroupCard'
import { ResponsiveStyleValue } from '@mui/system'
import { ComponentProps, memo, useCallback, useMemo } from 'react'
import { BasicVariantPack } from '../../../../api/dtos'
import { SongVariantCard } from '../../../ui/SongCard'

type CommmonProps = {
	data: SearchSongDto[]
	properties?: ComponentProps<typeof SongVariantCard>['properties']
	cardToLinkProps?: ComponentProps<typeof SongVariantCard>['toLinkProps']
	dense?: boolean
	/** What a search matched, lit up in every card's title. */
	highlight?: string
	onCardClick?: (data: BasicVariantPack) => void

	// Selecting
	onCardSelect?: (data: BasicVariantPack) => void
	onCardDeselect?: (data: BasicVariantPack) => void
	selectable?: boolean
	cardIcons?: ComponentProps<typeof SongVariantCard>['icons']
}

type ListProps = CommmonProps & {
	variant: 'list'
}

type MasonryGridProps = CommmonProps & {
	variant?: 'masonrygrid'
	columns?: ResponsiveStyleValue<number>
}

type RowProps = CommmonProps & {
	variant: 'row'
	columns?: ResponsiveStyleValue<number>
}

type SmartSongListCardsProps = ListProps | MasonryGridProps | RowProps

export const SmartSongListCard = memo(function SongListCards({
	data: _data,
	...props
}: SmartSongListCardsProps) {
	// unique
	const data = _data
	// .filter((v) => v !== undefined)
	// .filter((v, i, a) => a.findIndex((t) => t.packGuid === v.packGuid) === i)

	const spacing = 1

	const variant = props.variant

	// `columns` is the caller's when it passes one — it was declared and then
	// dropped, so a list that asked for wider cards silently got these four.
	const asked = 'columns' in props ? props.columns : undefined
	const columns: ResponsiveStyleValue<number> = useMemo(() => {
		if (variant === 'list') return 1
		return asked ?? { xs: 1, md: 2, lg: 4, xl: 5 }
	}, [variant, asked])

	const PackGroupCommonCard = useCallback(
		({
			packs,
			original,
			flexibleHeight = true,
		}: {
			packs: BasicVariantPack[]
			original?: BasicVariantPack
			flexibleHeight?: boolean
		}) => {
			return (
				<SongGroupCard
					packs={packs}
					original={original}
					flexibleHeight={flexibleHeight}
					dense={props.dense}
					highlight={props.highlight}
				/>
			)
		},
		[props]
	)

	const useGroupCards = useFlag('group_translations')

	return data.length === 0 ? (
		<></>
	) : variant === 'row' ? (
		<Grid container columns={{ xs: 1, md: 2, lg: 4, xl: 5 }} spacing={spacing}>
			{data.map((v) => {
				return (
					<Grid item key={v.found[0].packGuid} xs={1}>
						{data
							.map((v) => {
								if (!useGroupCards) {
									return v.found.map((v) => (
										<SongVariantCard
											data={v}
											key={v.packGuid}
											dense={props.dense}
											highlight={props.highlight}
											properties={['SHOW_PRIVATE_LABEL']}
										/>
									))
								}

								const publicPacks = v.found.filter((v) => v.public)
								const privatePacks = v.found.filter((v) => !v.public)
								return [
									privatePacks.map((v) => (
										<SongVariantCard
											data={v}
											key={v.packGuid}
											dense={props.dense}
											highlight={props.highlight}
											properties={['SHOW_PRIVATE_LABEL']}
										/>
									)),
									<PackGroupCommonCard
										packs={publicPacks}
										original={v.original}
										key={v.found[0].packGuid}
									/>,
								].flat()
							})
							.flat()}
					</Grid>
				)
			})}
		</Grid>
	) : (
		<Masonry columns={columns} sx={{}} spacing={spacing}>
			{/* one card per line of results — a song on its own, or a song with its
			    translations stacked behind it. The rule for which is which is shared
			    with the phone's rows (songGroups), so the two cannot drift apart. */}
			{groupSearchResults(data, useGroupCards).map((entry) =>
				entry.kind === 'group' ? (
					<PackGroupCommonCard
						key={entry.packs[0].packGuid}
						packs={entry.packs}
						original={entry.original}
					/>
				) : (
					<SongVariantCard
						data={entry.pack}
						key={entry.pack.packGuid}
						dense={props.dense}
						highlight={props.highlight}
						properties={['SHOW_PRIVATE_LABEL']}
					/>
				)
			)}
		</Masonry>
	)
})
export default SmartSongListCard
