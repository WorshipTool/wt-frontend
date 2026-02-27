'use client'
import useBottomPanel from '@/app/providers/BottomPanelProvider'
import Menu from '@/common/components/Menu/Menu'
import { Box } from '@/common/ui'
import { Badge, Fab } from '@/common/ui/mui'
import useAuth from '@/hooks/auth/useAuth'
import ChildrenCounter from '@/tech/portal/ChildrenCounter'
import { AdminPanelSettings } from '@mui/icons-material'
import { motion } from 'framer-motion'
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

	// FAB (FloatingAddButton) is at bottom: 30, height: 56px → top edge at 86px
	// Admin button sits above FAB: 30 + 56 + 10 = 96px from bottom
	// Always render the button in the DOM (visibility: hidden when no items) so it
	// never gets conditionally removed and then re-rendered behind the FAB.
	// zIndex: 1100 (MUI appBar level) reliably renders above FAB (zIndex.fab = 1050).
	return !isAdmin() ? null : (
		<>
			<Box
				sx={{
					position: 'fixed',
					bottom: 96 + height,
					right: 24,
					zIndex: 1100,
					visibility: itemsCount > 0 ? 'visible' : 'hidden',
					pointerEvents: itemsCount > 0 ? 'auto' : 'none',
				}}
			>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={
						itemsCount > 0
							? notifyItemsCount > 0
								? {
										scale: [1, 1.04, 1],
										opacity: 1,
								  }
								: { scale: 1, opacity: 1 }
							: { scale: 0.8, opacity: 0 }
					}
					transition={{
						duration: notifyItemsCount > 0 ? 2.5 : 0.3,
						repeat: notifyItemsCount > 0 ? Infinity : 0,
						ease: 'easeInOut',
					}}
					style={{ display: 'inline-flex', borderRadius: 40 }}
				>
					<Badge
						badgeContent={notifyItemsCount}
						sx={{
							'& .MuiBadge-badge': {
								right: 10,
								top: 10,
								pointerEvents: 'none',
								bgcolor: '#e53935',
								color: 'white',
								border: '2px solid white',
								fontWeight: 700,
								fontSize: '0.65rem',
								minWidth: 20,
								height: 20,
								borderRadius: 10,
								boxShadow: '0 2px 6px rgba(229, 57, 53, 0.6)',
							},
						}}
					>
						<Fab
							onClick={onClick}
							variant="extended"
							size="large"
							aria-label="Admin panel"
							sx={{
								background:
									'linear-gradient(135deg, #532EE7 0%, #0085FF 100%)',
								color: 'white',
								height: 52,
								px: 2.5,
								gap: 1,
								borderRadius: 40,
								boxShadow:
									'0 4px 20px rgba(83, 46, 231, 0.5), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
								fontWeight: 700,
								fontSize: '0.82rem',
								letterSpacing: '0.08em',
								textTransform: 'uppercase',
								minWidth: 130,
								'&:hover': {
									background:
										'linear-gradient(135deg, #3d21b0 0%, #006bcc 100%)',
									boxShadow:
										'0 8px 28px rgba(83, 46, 231, 0.65), 0 4px 10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
									transform: 'translateY(-3px) scale(1.03)',
								},
								'&:active': {
									transform: 'translateY(0) scale(0.97)',
									boxShadow:
										'0 2px 10px rgba(83, 46, 231, 0.4)',
								},
								transition:
									'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
							}}
						>
							<AdminPanelSettings sx={{ fontSize: 22 }} />
							Admin
						</Fab>
					</Badge>
				</motion.div>
			</Box>

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
