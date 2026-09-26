'use client'

import { ABOVE_TABBAR_SLOT_ID } from '@/common/components/MobileAppTabBar/nav.constants'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { Box } from '@/common/ui'
import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type PageActionProps = {
	/** The action itself — a Button, or whatever the page already had. */
	children: ReactNode
}

/**
 * A page's own primary action, written once where it belongs in the page and
 * placed by the shell.
 *
 * On desktop it renders exactly where it sits, so nothing about the existing
 * layout changes. On a phone it moves to the strip directly above the tab bar:
 * within reach of the thumb, and out of a top row that on phones was carrying
 * global navigation the tab bar already provides.
 *
 * Declaration and usage are the same place on purpose. A page states its action
 * once, in its own markup, and does not also have to know where the shell will
 * show it — that is the one thing this component owns.
 *
 * Not for global navigation (account, tools, search): that belongs to the tab
 * bar, which is always there. This is for what the current page can do.
 */
export default function PageAction({ children }: PageActionProps) {
	const phone = useIsPhone()
	const [slot, setSlot] = useState<HTMLElement | null>(null)

	// the slot only exists while the tab bar is rendered — on a phone, on an
	// app-shell route — so re-read it whenever that could have changed
	useEffect(() => {
		setSlot(document.getElementById(ABOVE_TABBAR_SLOT_ID))
	}, [phone])

	if (!phone) return <>{children}</>
	if (!slot) return null

	return createPortal(
		<Box
			sx={{
				bgcolor: 'background.paper',
				borderTop: '1px solid',
				borderColor: 'grey.200',
				paddingX: 2,
				paddingY: 1.5,
				display: 'flex',
				flexDirection: 'column',
				'& > *': { width: '100%' },
			}}
		>
			{children}
		</Box>,
		slot
	)
}
