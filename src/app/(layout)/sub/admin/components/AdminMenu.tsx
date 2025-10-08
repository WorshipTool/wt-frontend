'use client'
import { Box, Typography } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { alpha } from '@/common/ui/mui'
import { RoutesKeys } from '@/routes'
import { useSmartMatch } from '@/routes/useSmartMatch'
import {
	Add,
	Dashboard,
	MusicNote,
	Publish,
	Schedule,
	Tag,
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'

type ItemProps = {
	label: string
	icon?: React.ReactNode
	to?: RoutesKeys
	selected?: boolean
	disabled?: boolean
}
function Item(props: ItemProps) {
	const selectedColor = alpha('#fff', 0.1)
	const smartSelected = useSmartMatch(props.to || 'home')
	const selected = props.selected || smartSelected
	return (
		<Link
			to={props.to || 'home'}
			params={{}}
			disabled={!props.to || props.disabled}
		>
			<Box
				color={'white'}
				sx={{
					padding: 2,
					paddingX: 2,
					bgcolor: selected ? selectedColor : 'transparent',
					borderRadius: 2,
					display: 'flex',
					gap: 3,
					alignItems: 'center',
					'&:hover': {
						bgcolor: selectedColor,
					},
					userSelect: 'none',
					cursor: 'pointer',
					transition: 'all 0.3s',

					...(props.disabled && {
						opacity: 0.3,
						cursor: 'not-allowed',
					}),
				}}
			>
				{props.icon}
				<Typography strong={selected}>{props.label}</Typography>
			</Box>
		</Link>
	)
}

export default function AdminMenu() {
	const t = useTranslations('admin')

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				// gap: 1,
			}}
		>
			<Item
				label={t('menu.dashboard')}
				icon={<Dashboard fontSize="small" />}
				to={'admin'}
			/>
			<Item
				label={t('menu.addSong')}
				icon={<Add fontSize="small" />}
				to={'adminCreateSong'}
			/>
			<Item
				label={t('menu.songs')}
				icon={<MusicNote fontSize="small" />}
				to={'adminSongs'}
			/>
			<Item
				label={t('menu.pendingApproval')}
				icon={<Publish fontSize="small" />}
				to="adminPublishApproval"
			/>
			<Item
				label={t('menu.recent')}
				icon={<Schedule fontSize="small" />}
				to="adminLastAdded"
			/>
			<Item label={t('menu.tags')} icon={<Tag fontSize="small" />} disabled />
		</Box>
	)
}
