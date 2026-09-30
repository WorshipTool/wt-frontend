'use client'

import { MOBILE_NAV_CLEARANCE } from '@/common/components/MobileAppTabBar/nav.constants'
import { Divider } from '@/common/ui'
import { ListItemText, Menu, MenuItem } from '@/common/ui/mui'
import { useTranslations } from 'next-intl'
import useAuth from '../../../../../hooks/auth/useAuth'
import { Gap } from '../../../../ui/Gap'
import { Link } from '../../../../ui/Link/Link'

/**
 * On the phone the menu hangs over the tab bar, and MUI's backdrop would cover
 * it — so a tap on Písně would buy nothing but the menu closing and the tab
 * would have to be pressed twice (docs/design/MOBILE.md, "a backdrop stops
 * below the bar"). The backdrop stops above the bar instead, the root lets taps
 * through, and only the backdrop and the menu itself catch them.
 */
const PHONE_SLOTS = {
	root: { sx: { pointerEvents: 'none' } },
	backdrop: {
		sx: { pointerEvents: 'auto', bottom: MOBILE_NAV_CLEARANCE },
	},
	// the same air the Nástroje sheet leaves over the bar
	paper: { sx: { pointerEvents: 'auto', marginTop: '-8px' } },
} as const

interface AccountMenuProps {
	anchor: Element | null
	open: boolean
	/**
	 * An item was pressed. It closes, and leaves alone anything that press set
	 * in motion — on a phone the menu stands on a history entry of its own, and
	 * taking that entry back out here would pop the navigation "Spravovat účet"
	 * had just started (see common/hooks/useCloseOnBack).
	 */
	onClose: () => void
	/** Never mind — the backdrop, or Escape. Defaults to `onClose`. */
	onDismiss?: () => void
	/**
	 * Open above the anchor instead of below it — for the phone's bottom tab
	 * bar. Left to hang downwards there, the menu has nowhere to go and MUI
	 * shoves it back up over the bar, covering the tabs it grew out of.
	 */
	openUpwards?: boolean
}

export default function AccountMenu({
	anchor,
	open,
	onClose,
	onDismiss,
	openUpwards,
}: AccountMenuProps) {
	const { logout, user } = useAuth()
	const tNavigation = useTranslations('navigation')
	const dismiss = onDismiss ?? onClose

	// Signing out stays on the page, so this is a dismissal like any other.
	const onLogoutClick = () => {
		logout()
		dismiss()
	}

	return (
		<Menu
			disableScrollLock
			anchorEl={anchor}
			open={open}
			onClose={dismiss}
			MenuListProps={{
				'aria-labelledby': 'basic-button',
			}}
			anchorOrigin={{
				vertical: openUpwards ? 'top' : 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: openUpwards ? 'bottom' : 'top',
				horizontal: 'right',
			}}
			slotProps={openUpwards ? PHONE_SLOTS : undefined}
		>
			<Link to="account" params={{}}>
				<MenuItem onClick={onClose}>
					<ListItemText
						primary={user?.firstName + ' ' + user?.lastName}
						secondary={tNavigation('accountMenu.manageAccount')}
					/>
				</MenuItem>
			</Link>
			<Gap value={0.5} />
			<Divider />
			<Gap value={0.5} />
			<MenuItem onClick={onLogoutClick}>{tNavigation('logout')}</MenuItem>
		</Menu>
	)
}
