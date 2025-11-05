import Menu from '@/common/components/Menu/Menu'
import { IconButton } from '@/common/ui'
import ChildrenCounter from '@/tech/portal/ChildrenCounter'
import { ExpandCircleDown } from '@mui/icons-material'
import { useState } from 'react'

export const PLAYLIST_MORE_BUTTON_ID = 'playlist-more-button'

export default function PlaylistMoreButton() {
	const [childrenCount, setChildrenCount] = useState(0)

	const onCountChange = (count: number) => {
		setChildrenCount(count)
	}
	const [menuOpen, setMenuOpen] = useState(false)
	const [anchor, setAnchor] = useState<null | HTMLElement>(null)
	const onClick = (e: React.MouseEvent) => {
		setAnchor(e.currentTarget as HTMLElement)
		setMenuOpen(true)
	}

	return (
		<>
			{childrenCount > 0 && (
				<IconButton onClick={onClick} color="primary.light">
					<ExpandCircleDown />
				</IconButton>
			)}

			<Menu
				open={menuOpen}
				anchor={anchor}
				onClose={() => setMenuOpen(false)}
				keepMounted
			>
				<ChildrenCounter onCountChange={onCountChange}>
					<div id={PLAYLIST_MORE_BUTTON_ID}></div>
				</ChildrenCounter>
			</Menu>
		</>
	)
}
