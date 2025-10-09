import MenuItem, { MenuItemObjectType } from '@/common/components/Menu/MenuItem'
import useSmartPortalMenu from '@/common/components/SmartPortalMenuItem/SmartPortalMenuProvider'
import { CommonLinkProps } from '@/common/ui/Link/Link'
import { RoutesKeys } from '@/routes'
import { createSmartPortal } from '@/tech/portal/createSmartPortal'
import { useEffect, useMemo, useRef, useState } from 'react'

type Props<T extends CommonLinkProps<RoutesKeys>['to']> = MenuItemObjectType<T>

export default function SmartPortalMenuItem<
	T extends CommonLinkProps<RoutesKeys>['to']
>(props: Props<T>) {
	const { containerId } = useSmartPortalMenu()
	const ref = useRef<HTMLDivElement | null>(null)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		ref.current = document.querySelector(`#${containerId}`)
		setMounted(true)
		return () => {
			setMounted(false)
		}
	}, [containerId])

	const menuItem = useMemo(() => {
		return <MenuItem {...props} />
	}, [props])

	return ref.current && mounted
		? createSmartPortal(menuItem, containerId)
		: null
}
