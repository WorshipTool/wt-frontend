'use client'

import { Box, Typography } from '@/common/ui'
import { ReactNode } from 'react'

/** Icon box size shared by every tab (and by the tab bar's playground story). */
export const TAB_ICON_SIZE = 25

type TabItemProps = {
	icon: ReactNode
	/** Shown instead of `icon` while active — the filled twin of an outlined icon. */
	activeIcon?: ReactNode
	label: string
	active?: boolean
}

/**
 * One item of the phone's bottom bar: icon over a small label, grey at rest and
 * brand blue when it is the current one.
 *
 * It lives in its own module rather than inside MobileAppTabBar because it is
 * the bottom bar's visual unit, not the app bar's: the team module's own bar
 * takes the app bar's place on its routes and is built from these same items,
 * so the two read as one bar that changes contents.
 */
export function TabItem({ icon, activeIcon, label, active }: TabItemProps) {
	const iconColor = active ? 'primary.main' : 'grey.500'
	const labelColor = active ? 'primary.main' : 'grey.700'
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 0.6,
				minWidth: 0,
			}}
		>
			<Box
				sx={{
					color: iconColor,
					display: 'flex',
					paddingX: 1.5,
					paddingY: 0.25,
					'& svg': { fontSize: TAB_ICON_SIZE },
				}}
			>
				{active ? activeIcon ?? icon : icon}
			</Box>
			<Typography
				noWrap
				size="0.65rem"
				strong={active ? 700 : 500}
				color={labelColor}
				sx={{ lineHeight: 1.2 }}
			>
				{label}
			</Typography>
		</Box>
	)
}
