import MenuItem, {
	TeamBarMenuTypes,
} from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/LeftPanel/components/MenuItem'
import TeamBottomMenuItem from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/LeftPanel/components/TeamBottomMenuItem'
import { Box } from '@/common/ui'
import { useTranslations } from 'next-intl'
import { ComponentProps } from 'react'

type MenuItem = ComponentProps<typeof MenuItem>

type ItemType = TeamBarMenuTypes
export default function TeamBottomMenu() {
	const t = useTranslations('teams.menu')
	
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-around',
				alignItems: 'center',
			}}
			paddingX={1}
			gap={1}
		>
			<TeamBottomMenuItem item={'playlists'} />
			<TeamBottomMenuItem item={'songlist'} title={t('songs')} />
			<TeamBottomMenuItem item={'overview'} />
			<TeamBottomMenuItem item={'people'} />
		</Box>
	)
}
