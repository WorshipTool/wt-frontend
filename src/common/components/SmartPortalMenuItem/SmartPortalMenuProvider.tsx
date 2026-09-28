import { createContext, useCallback, useContext, useRef, useState } from 'react'

type R = ReturnType<typeof useProvideSmartPortalMenu>

const menuContext = createContext<R>({ uninitialized: true } as any as R)

export function SmartPortalMenuProvider({
	children,
	id,
}: {
	children: React.ReactNode
	id: string
}) {
	const value = useProvideSmartPortalMenu(id)
	return <menuContext.Provider value={value}>{children}</menuContext.Provider>
}

export default function useSmartPortalMenu() {
	const r = useContext(menuContext)

	if ((r as any).uninitialized) {
		throw new Error(
			'useSmartPortalMenu was used outside of a SmartPortalMenuProvider'
		)
	}

	return r
}

/**
 * The menu's own button lives *inside* this provider and owns whether the menu
 * is open, while the items are portalled in from anywhere above it. So the
 * provider cannot close the menu itself; the button lends it the means to,
 * and the items use it.
 *
 * Without this the menu simply stayed open after a choice — you hid the chords
 * and then had to guess that tapping beside the menu would get rid of it, with
 * the song underneath the whole time.
 *
 * `button` is that button's element, for anything an item opens afterwards: by
 * the time the item's own row has been chosen, the menu is closing and the row
 * is on its way out, so it is no good as an anchor.
 */
const useProvideSmartPortalMenu = (id: string) => {
	const closeRef = useRef<(() => void) | null>(null)
	const [button, setButton] = useState<HTMLElement | null>(null)

	const registerClose = useCallback((fn: (() => void) | null) => {
		closeRef.current = fn
	}, [])

	const close = useCallback(() => {
		closeRef.current?.()
	}, [])

	return { containerId: id, close, registerClose, button, setButton }
}
