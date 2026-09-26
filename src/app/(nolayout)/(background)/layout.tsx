import { Background } from '@/common'
import MobileAppTabBar from '@/common/components/MobileAppTabBar/MobileAppTabBar'
import { LayoutProps } from '@/common/types'

export default function Layout(props: LayoutProps) {
	return (
		<>
			<Background />
			{props.children}
			{/* The second mount point of the app's one tab bar. It normally comes with
			    AppLayout, which only the `(layout)` group uses — so without this the
			    sign-in and sign-up screens could never show it, whatever
			    nav.constants says. The bar gates itself on the route, so this stays
			    empty on every other chromeless page and nav.constants remains the
			    single source of truth for where the shell appears. */}
			<MobileAppTabBar />
		</>
	)
}
