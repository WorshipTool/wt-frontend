'use client'

import TeamBottomMenuItem from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/LeftPanel/components/TeamBottomMenuItem'
import BrandSheepIcon from '@/assets/icon.svg'
import {
	TAB_ICON_SIZE,
	TabItem,
} from '@/common/components/MobileAppTabBar/TabItem'
import { Box } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { useTranslations } from 'next-intl'

/**
 * The items of the team's bottom bar: the way out, then the team's sections.
 *
 * Because this bar takes the app tab bar's place, it has to offer what the app
 * bar offered first of all — a way back to the app. It leads with the brand
 * sheep: the same icon, the same destination and the same wording the Nástroje
 * menu already uses for it, so leaving a team looks the same wherever you do it
 * from. A hairline then separates the app's item from the team's own.
 */
export default function TeamBottomMenu() {
	const tNav = useTranslations('navigation')
	const tTeam = useTranslations('teams.menu')

	return (
		<>
			{/* one of five equal columns, exactly like a tab of the app bar it
			    stands in for — the hairline says which side it belongs to, its
			    width doesn't */}
			<Link to="home" params={{ hledat: undefined }} style={{ flex: 1, minWidth: 0 }}>
				<TabItem
					icon={<BrandSheepIcon width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} />}
					label={tNav('toolsMenu.outsideTeam')}
				/>
			</Link>

			<Box sx={{ alignSelf: 'stretch', width: '1px', bgcolor: 'grey.200' }} />

			<TeamBottomMenuItem item="overview" />
			<TeamBottomMenuItem item="songlist" title={tTeam('songs')} />
			<TeamBottomMenuItem item="playlists" />
			<TeamBottomMenuItem item="people" />
		</>
	)
}
