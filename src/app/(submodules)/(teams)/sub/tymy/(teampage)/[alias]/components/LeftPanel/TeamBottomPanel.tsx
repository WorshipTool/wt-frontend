'use client'

import TeamBottomMenu from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/LeftPanel/components/TeamBottomMenu'
import { useTeamSideBar } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/SmartTeamPage/hooks/useTeamSideBar'
import useBottomPanel from '@/app/providers/BottomPanelProvider'
import MobileBottomDock from '@/common/components/MobileAppTabBar/MobileBottomDock'
import { MOBILE_NAV_BAR_HEIGHT } from '@/common/components/MobileAppTabBar/nav.constants'
import { useEffect } from 'react'

/**
 * The team's own section tabs (Přehled / Zpěvník / Playlisty / Lidé) on a phone.
 *
 * It is not a second bar under the app's: it *is* the bottom bar while you are
 * inside a team, in the same dock, in the same visual language — the app's tab
 * bar steps aside on these routes (see `hasContextualBottomBar`) and the team's
 * sections carry the way back out as their first item.
 */
export default function TeamBottomPanel() {
	const { setHidden } = useTeamSideBar()
	const { setHeight } = useBottomPanel()

	useEffect(() => {
		setHidden(true)
		setHeight(MOBILE_NAV_BAR_HEIGHT)

		return () => {
			setHeight(0)
		}
	}, [])

	return (
		<MobileBottomDock>
			<TeamBottomMenu />
		</MobileBottomDock>
	)
}
