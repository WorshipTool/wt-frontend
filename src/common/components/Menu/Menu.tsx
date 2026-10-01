import MenuItem, { MenuItemObjectType } from '@/common/components/Menu/MenuItem'
import { Menu as MuiMenu } from '@/common/ui/mui'
import { ComponentProps, ReactNode } from 'react'

/**
 * Origins for a menu whose button sits at the bottom of the screen — the song
 * page's floating dock, a selection panel — so it opens upward, its bottom-right
 * corner at the button's top-right.
 *
 * MUI's Popover does not flip on its own: with no room below the anchor it keeps
 * the menu below and slides it back into the window, which is how the dock's
 * menus came to stand 200px from the button they belong to, over the dock
 * itself. A menu with room below it needs none of this — it already lands on
 * its button, which is what a desktop looks like.
 */
export const ABOVE_ANCHOR = {
	anchorOrigin: { vertical: 'top', horizontal: 'right' },
	transformOrigin: { vertical: 'bottom', horizontal: 'right' },
} as const

type MenuProps = {
	open: boolean
	onClose: () => void
	anchor: Element | null
	anchorOrigin?: ComponentProps<typeof MuiMenu>['anchorOrigin']
	transformOrigin?: ComponentProps<typeof MuiMenu>['transformOrigin']

	items?: MenuItemObjectType[]
	children?: ReactNode
	id?: string

	keepMounted?: boolean
}

export default function Menu({ ...props }: MenuProps) {
	const onClose = () => {
		props.onClose?.()
	}

	return (
		<MuiMenu
			id={props.id}
			anchorEl={props.anchor}
			open={props.open}
			onClose={onClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'left',
				...props.anchorOrigin,
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'left',
				...props.transformOrigin,
			}}
			MenuListProps={{
				'aria-labelledby': 'basic-button',
			}}
			disablePortal
			disableScrollLock
			keepMounted={props.keepMounted}
		>
			{props.children}
			{props.items?.map((item, index) => {
				return (
					<MenuItem
						key={index}
						{...item}
						onClick={async (e) => {
							const r = await item.onClick?.(e)
							if (r !== false) onClose()
						}}
					/>
				)
			})}
		</MuiMenu>
	)
}
