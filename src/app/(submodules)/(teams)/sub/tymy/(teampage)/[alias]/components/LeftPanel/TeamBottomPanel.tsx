'use client'

import TeamBottomMenu from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/LeftPanel/components/TeamBottomMenu'
import { useTeamSideBar } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/SmartTeamPage/hooks/useTeamSideBar'
import useBottomPanel from '@/app/providers/BottomPanelProvider'
import { ABOVE_TABBAR_SLOT_ID } from '@/common/components/MobileAppTabBar/nav.constants'
import { Box } from '@/common/ui'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const TRANSITION = 'all 0.2s'
const HEIGHT = 60

/**
 * The team's own section tabs (Přehled / Zpěvník / Playlisty / Lidé) on small
 * screens.
 *
 * It goes into the app tab bar's slot rather than fixing itself to the bottom:
 * both bars want `bottom: 0`, and the app bar wins on z-index, so fixing this
 * one there hid the team's navigation completely. The slot stacks it directly
 * on top of the bar by layout, so neither needs to know the other's height.
 *
 * Without the bar (no shell on this route, or a wider screen that still counts
 * as small) it falls back to fixing itself, which is what it always did.
 */
export default function TeamBottomPanel() {
	const { darkMode, setHidden } = useTeamSideBar()
	const { setHeight } = useBottomPanel()

	const [slot, setSlot] = useState<HTMLElement | null>(null)
	useEffect(() => {
		setSlot(document.getElementById(ABOVE_TABBAR_SLOT_ID))
	}, [])

	useEffect(() => {
		setHidden(true)
		setHeight(HEIGHT)

		return () => {
			setHeight(0)
		}
	}, [])

	const bar = (
		<Box
			sx={{
				bgcolor: darkMode ? 'grey.900' : 'grey.100',
				minHeight: HEIGHT,
				maxHeight: HEIGHT,
				...(slot
					? { width: '100%' }
					: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2 }),
				boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1)',
				transition: TRANSITION,
				color: darkMode ? 'grey.100' : 'grey.800',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
			}}
		>
			<TeamBottomMenu />
		</Box>
	)

	return (
		<>
			{slot ? createPortal(bar, slot) : bar}
			{/* its own height, so content can scroll clear of it — the tab bar adds
			    its own on top of this */}
			<Box sx={{ height: HEIGHT }} />
		</>
	)
}
