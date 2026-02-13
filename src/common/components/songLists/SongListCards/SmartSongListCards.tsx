'use client'
import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { Masonry } from '@/common/ui/Masonry'
import { Grid } from '@/common/ui/mui/Grid'
import SongGroupCard from '@/common/ui/SongCard/SongGroupCard'
import { ResponsiveStyleValue } from '@mui/system'
import { ComponentProps, memo, useCallback, useMemo } from 'react'
import { BasicVariantPack } from '../../../../api/dtos'
import { SongVariantCard } from '../../../ui/SongCard'

type CommmonProps = {
	data: SearchSongDto[]
	properties?: ComponentProps<typeof SongVariantCard>['properties']
	cardToLinkProps?: ComponentProps<typeof SongVariantCard>['toLinkProps']
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
	columns?: ResponsiveStyleValue<string | number>
}

type RowProps = CommmonProps & {
	variant: 'row'
	columns?: ResponsiveStyleValue<string | number>
}

type SmartSongListCardsProps = ListProps | MasonryGridProps | RowProps

export const SmartSongListCard = memo(function SongListCards({
	data: _data,
	...props
}: SmartSongListCardsProps) {
	// Sort by popularity (translationLikes + published date)
	const sortByPopularity = (songs: SearchSongDto[]): SearchSongDto[] => {
		return [...songs].sort((a, b) => {
			const aVariant = a.found[0]
			const bVariant = b.found[0]

			// Primary sort: translation likes (higher is better)
			const likesA = aVariant.translationLikes || 0
			const likesB = bVariant.translationLikes || 0
			if (likesB !== likesA) {
				return likesB - likesA
			}

			// Secondary sort: published date (older is more established)
			const dateA = aVariant.publishedAt?.getTime() || 0
			const dateB = bVariant.publishedAt?.getTime() || 0
			return dateA - dateB
		})
	}

	// unique
	const data = sortByPopularity(_data)
	// .filter((v) => v !== undefined)
	// .filter((v, i, a) => a.findIndex((t) => t.packGuid === v.packGuid) === i)

	const spacing = 1

	const variant = props.variant

	let columns: ResponsiveStyleValue<number> = useMemo(() => {
		switch (variant) {
			case 'list':
				return 1
			case undefined:
			case 'masonrygrid':
			case 'row':
				return {
					xs: 1,
					md: 2,
					lg: 4,
					xl: 5,
				}
		}
	}, [props])

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
			{data
				.map((v) => {
					if (!useGroupCards) {
						return v.found.map((v) => (
							<SongVariantCard
								data={v}
								key={v.packGuid}
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
								properties={['SHOW_PRIVATE_LABEL']}
							/>
						)),

						...(publicPacks.length > 0
							? [
									<PackGroupCommonCard
										packs={publicPacks}
										original={v.original}
										key={v.found[0].packGuid}
									/>,
							  ]
							: []),
					].flat()
				})
				.flat()}
		</Masonry>
	)
})
export default SmartSongListCard
