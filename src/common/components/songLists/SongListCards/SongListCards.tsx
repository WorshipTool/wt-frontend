'use client'
import { Masonry } from '@/common/ui/Masonry'
import { Grid } from '@/common/ui/mui/Grid'
import { ResponsiveStyleValue } from '@mui/system'
import { ComponentProps, memo, useCallback, useMemo } from 'react'
import { BasicVariantPack } from '../../../../api/dtos'
import { SongVariantCard } from '../../../ui/SongCard'

type CommmonProps = {
	data: BasicVariantPack[]
	properties?: ComponentProps<typeof SongVariantCard>['properties']
	cardToLinkProps?: ComponentProps<typeof SongVariantCard>['toLinkProps']
	dense?: boolean
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

export type SongListCardsProps = ListProps | MasonryGridProps | RowProps

export const SongListCard = memo(function SongListCards({
	data: _data,
	...props
}: SongListCardsProps) {
	// unique
	const data = _data
		.filter((v) => v !== undefined)
		.filter((v, i, a) => a.findIndex((t) => t.packGuid === v.packGuid) === i)

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

	const CommonCard = useCallback(
		({
			v,
			flexibleHeight = true,
		}: {
			v: BasicVariantPack
			flexibleHeight?: boolean
		}) => {
			return (
				<SongVariantCard
					data={v}
					key={v.packGuid}
					flexibleHeight={flexibleHeight}
					dense={props.dense}
					toLinkProps={props.cardToLinkProps}
					properties={props.properties}
					onClick={() => {
						props.onCardClick && props.onCardClick(v)
					}}
					selectable={props.selectable}
					onSelect={() => {
						props.onCardSelect && props.onCardSelect(v)
					}}
					onDeselect={() => {
						props.onCardDeselect && props.onCardDeselect(v)
					}}
					icons={props.cardIcons}
				/>
			)
		},
		[props]
	)

	return data.length === 0 ? (
		<></>
	) : variant === 'row' ? (
		<Grid container columns={{ xs: 1, md: 2, lg: 4, xl: 5 }} spacing={spacing}>
			{data.map((v) => {
				return (
					<Grid item key={v.packGuid} xs={1}>
						<CommonCard v={v} flexibleHeight={false} />
					</Grid>
				)
			})}
		</Grid>
	) : (
		<Masonry columns={columns} sx={{}} spacing={spacing}>
			{data.map((v) => {
				return <CommonCard v={v} key={v.packGuid} />
			})}
		</Masonry>
	)
})
export default SongListCard
