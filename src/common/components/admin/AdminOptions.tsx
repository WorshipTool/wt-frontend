'use client'
import useBottomPanel from '@/app/providers/BottomPanelProvider'
import Menu from '@/common/components/Menu/Menu'
import { Box, IconButton } from '@/common/ui'
import { Badge } from '@/common/ui/mui'
import { grey } from '@/common/ui/mui/colors'
import useAuth from '@/hooks/auth/useAuth'
import ChildrenCounter from '@/tech/portal/ChildrenCounter'
import { AdminPanelSettings } from '@mui/icons-material'
import { useEffect, useState } from 'react'

export const ADMIN_OPTIONS_PROVIDER_ID = 'admin-options-provider'
export const ADMIN_OPTIONS_PROVIDER_NOTIFY_ID = 'admin-options-notify-provider'

export const CLOSE_ADMIN_OPTIONS_EVENT_NAME = 'close-admin-options'

export default function AdminOptionsProvider() {
	const [open, setOpen] = useState(false)
	const [anchor, setAnchor] = useState<null | HTMLElement>(null)

	const onClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchor(event.currentTarget)
		setOpen(true)
	}

	const [basicItemsCount, setBasicItemsCount] = useState(0)
	const [notifyItemsCount, setNotifyItemsCount] = useState(0)

	const itemsCount = basicItemsCount + notifyItemsCount

	useEffect(() => {
		const closeAdminOptions = () => {
			setOpen(false)
		}

		window.addEventListener(CLOSE_ADMIN_OPTIONS_EVENT_NAME, closeAdminOptions)

		return () => {
			window.removeEventListener(
				CLOSE_ADMIN_OPTIONS_EVENT_NAME,
				closeAdminOptions
			)
		}
	}, [])
	const { isAdmin } = useAuth()

	const { height } = useBottomPanel()

	// FAB is at bottom: 30, height: 56px → admin button goes above it: 30 + 56 + 10 = 96
	// zIndex: 1051 ensures it's always above MUI Fab (theme z-index: 1050)
	return !isAdmin() ? null : (
		<>
			{itemsCount > 0 && (
				<Box
					sx={{
						position: 'fixed',
						bottom: 96 + height,
						right: 30,
						zIndex: 1051,
					}}
				>
					<Badge
						badgeContent={notifyItemsCount}
						// overlap="circular"
						// variant="dot"
						sx={{
							'& .MuiBadge-badge': {
								right: 8,
								top: 4,
								pointerEvents: 'none',
								bgcolor: 'grey.900',
								color: 'white',
								border: '3px solid',
								borderColor: grey[200],
							},
						}}
					>
						<IconButton
							size="small"
							color="black"
							onClick={onClick}
							variant="contained"
						>
							<AdminPanelSettings />
						</IconButton>
					</Badge>
				</Box>
			)}

			<Menu
				anchor={anchor}
				open={open}
				onClose={() => setOpen(false)}
				keepMounted
				anchorOrigin={{
					horizontal: 'right',
					vertical: 'bottom',
				}}
				transformOrigin={{
					horizontal: 'right',
					vertical: 'bottom',
				}}
			>
				<ChildrenCounter onCountChange={setBasicItemsCount}>
					<div id={ADMIN_OPTIONS_PROVIDER_ID}></div>
				</ChildrenCounter>

				<ChildrenCounter onCountChange={setNotifyItemsCount}>
					<div id={ADMIN_OPTIONS_PROVIDER_NOTIFY_ID}></div>
				</ChildrenCounter>
			</Menu>
		</>
	)
}
