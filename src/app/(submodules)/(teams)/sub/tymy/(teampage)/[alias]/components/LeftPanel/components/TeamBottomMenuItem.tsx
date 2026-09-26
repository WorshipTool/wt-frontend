'use client'

import { TeamBarMenuTypes } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/LeftPanel/components/MenuItem'
import { useTeamLeftMenuItems } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/LeftPanel/hooks/useTeamLeftMenuItems'
import { TabItem } from '@/common/components/MobileAppTabBar/TabItem'
import { Link } from '@/common/ui/Link/Link'
import { useSmartMatch } from '@/routes/useSmartMatch'

type Props = {
	item: TeamBarMenuTypes
	title?: string
}

/**
 * One section of the team's bottom bar, built from the same menu definition the
 * desktop left panel uses — and rendered as an app tab, because on a phone this
 * bar stands in for the app's.
 */
export default function TeamBottomMenuItem({ item, title }: Props) {
	const items = useTeamLeftMenuItems()

	const data = items.find((itm) => itm.id === item) || null

	const isOn = useSmartMatch(data?.to || null)

	// `hidden` is how the menu says this section isn't yours (statistics, people
	// and settings are manager-only) — the left panel honours it, so does this
	if (!data || data.hidden) return null

	return (
		<Link to={data.to} params={data.toParams} style={{ flex: 1, minWidth: 0 }}>
			<TabItem
				icon={data.iconOutlined ?? data.icon}
				activeIcon={data.icon}
				label={title || data.title}
				active={isOn}
			/>
		</Link>
	)
}
