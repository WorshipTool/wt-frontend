'use client'

import HomeDesktop from '@/app/components/HomeDesktop'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'

export default SmartPage(Home, {
	hideTitle: true,
	transparentToolbar: null,
	hideFooter: null,
	fullWidth: true,
	hidePadding: true,
})

function Home() {
	return (
		<>
			<HomeDesktop />
		</>
	)
}
