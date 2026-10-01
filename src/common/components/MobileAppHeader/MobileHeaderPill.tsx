'use client'

import { Button } from '@/common/ui'
import { CommonLinkProps } from '@/common/ui/Link/Link'
import { RoutesKeys } from '@/routes/routes.types'
import { ReactNode } from 'react'

type MobileHeaderPillProps<T extends RoutesKeys> = {
	/** Pill label. */
	children: ReactNode
	/** Leading icon (e.g. an Add). */
	icon?: ReactNode
	to?: CommonLinkProps<T>['to']
	toParams?: CommonLinkProps<T>['params']
	onClick?: () => void
	loading?: boolean
	disabled?: boolean
	alt?: string
}

/**
 * Compact primary pill for a page's single create action in the MobileAppHeader
 * `actions` slot — per docs/design/MOBILE.md a page's create action lives in the
 * header, not a FAB (the thumb zone's one primary is the tab bar's search).
 */
export default function MobileHeaderPill<T extends RoutesKeys>({
	children,
	icon,
	to,
	toParams,
	onClick,
	loading,
	disabled,
	alt,
}: MobileHeaderPillProps<T>) {
	return (
		<Button
			color="primary"
			size="small"
			to={to}
			toParams={toParams}
			onClick={onClick}
			loading={loading}
			disabled={disabled}
			alt={alt}
			startIcon={icon}
			disableUppercase
			sx={{ borderRadius: 999, paddingX: 1.5, whiteSpace: 'nowrap' }}
		>
			{children}
		</Button>
	)
}
