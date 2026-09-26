'use client'

import ToolsMenuItem from '@/common/components/Toolbar/components/RightAccountPanel/Toolsmenu/components/MenuItem'
import useToolsMenuItems from '@/common/components/Toolbar/components/RightAccountPanel/Toolsmenu/hooks/useToolsMenuItems'
import { Box, useTheme } from '@/common/ui'
import { alpha, Fade } from '@/common/ui/mui'

/**
 * Mobile "Nástroje" menu — the phone counterpart of the desktop Apps menu.
 * Rendered as an overlay icon grid anchored just above the tab bar near the
 * Nástroje tab (mirroring the desktop overlay), reusing the same grid items
 * (playlists, my songs, favourites, teams…). Taps outside close it.
 */
export default function MobileToolsMenu({ onClose }: { onClose: () => void }) {
	const theme = useTheme()
	const { items } = useToolsMenuItems()
	const visible = items.filter((i) => !i.hidden)

	return (
		<>
			{/* click-catching backdrop */}
			<Box
				onClick={onClose}
				sx={{
					position: 'fixed',
					inset: 0,
					zIndex: 11,
					bgcolor: alpha(theme.palette.common.black, 0.12),
				}}
			/>

			{/* full-width anchor so the card lines up with the bar */}
			<Box
				sx={{
					position: 'fixed',
					left: 0,
					right: 0,
					bottom: 0,
					height: 0,
					zIndex: 12,
					pointerEvents: 'none',
				}}
			>
				<Fade in>
					<Box
						sx={{
							position: 'absolute',
							bottom: 'calc(env(safe-area-inset-bottom) + 92px)',
							right: 8,
							pointerEvents: 'auto',
							bgcolor: 'background.paper',
							borderRadius: 3,
							boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
							padding: 1,
							transformOrigin: 'bottom right',
						}}
					>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: 'repeat(3, 80px)',
								gap: 0.5,
							}}
						>
							{visible.map((item, i) => (
								<ToolsMenuItem
									{...item}
									key={`${item.title}-${i}`}
									action={() => {
										item.action?.()
										if (!item.disabled) onClose()
									}}
								/>
							))}
						</Box>
					</Box>
				</Fade>
			</Box>
		</>
	)
}
