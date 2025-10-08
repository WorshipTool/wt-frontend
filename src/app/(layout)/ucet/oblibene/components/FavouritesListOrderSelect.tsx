import Menu from '@/common/components/Menu/Menu'
import { Box } from '@/common/ui'
import { Typography } from '@/common/ui/Typography'
import { ArrowDropDown } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export type FavouritesOrderOptions = 'addedAt' | 'title'

type Item = {
	label: string
	type: FavouritesOrderOptions
}

type FavouritesOrderSelectProps = {
	onChange: (type: FavouritesOrderOptions) => void
	startValue?: FavouritesOrderOptions
}

export default function FavouritesListOrderSelect(
	props: FavouritesOrderSelectProps
) {
	const t = useTranslations('account.favourites')
	const [open, setOpen] = useState(false)
	const [anchor, setAnchor] = useState<null | HTMLElement>(null)

	const items: Item[] = [
		{ label: t('sortBy.dateAdded'), type: 'addedAt' },
		{ label: t('sortBy.title'), type: 'title' },
	]
	const [selected, setSelected] = useState<Item>(
		props.startValue
			? items.find((a) => a.type === props.startValue) || items[0]
			: items[0]
	)

	return (
		<Box display={'flex'} gap={1}>
			<Typography color="grey.500" thin>
				{t('sortBy.label')}
			</Typography>
			<Typography
				strong
				onClick={(e) => {
					setAnchor(e.currentTarget)
					setOpen(true)
				}}
				sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
			>
				{selected.label}
				<ArrowDropDown />
			</Typography>
			<Menu
				open={open}
				onClose={() => setOpen(false)}
				anchor={anchor}
				items={items.map((a) => {
					return {
						title: a.label,
						onClick: () => {
							setOpen(false)
							setSelected(a)
							props.onChange(a.type)
						},
						selected: a.label === selected.label,
					}
				})}
			/>
		</Box>
	)
}
