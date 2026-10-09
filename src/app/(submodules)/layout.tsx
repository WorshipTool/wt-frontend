import { Background } from '@/common'
import MobileAppTabBar from '@/common/components/MobileAppTabBar/MobileAppTabBar'
import React from 'react'

type BackgroundProps = {
	children?: React.ReactNode
}

export default function Layout(props: BackgroundProps) {
	return (
		<>
			<Background />
			{props.children}
			{/* The tab bar normally arrives with AppLayout, which only the `(layout)`
			    group uses — so the team module, living in its own group, could never
			    show it. It gates itself on the route, and only one group's layout is
			    ever mounted, so there is no second bar anywhere. */}
			<MobileAppTabBar />
		</>
	)
}
