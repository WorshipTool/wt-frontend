'use client'
import React, { useEffect } from 'react'
import LoadingScreen from '../../(layout)/vytvorit/loading'

type LoadingRoutesProviderProps = {
	children: React.ReactNode
	show: boolean
}

// Module-level flag persists across component remounts as a safety net.
let hasDismissedLoading = false

/** @internal Exposed for testing only */
export function _resetLoadingFlag() {
	hasDismissedLoading = false
}

export default function LoadingRoutesProvider({
	children,
	show,
}: LoadingRoutesProviderProps) {
	const [loading, setLoading] = React.useState(
		() => show && !hasDismissedLoading,
	)
	useEffect(() => {
		if (!loading) return
		if (typeof window !== 'undefined') {
			setTimeout(() => {
				hasDismissedLoading = true
				setLoading(false)
			}, 100)
		}
	}, [loading])
	return (
		<div>
			<LoadingScreen isVisible={loading} />
			{children}
		</div>
	)
}
