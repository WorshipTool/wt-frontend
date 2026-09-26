'use client'

import HomeDesktop from '@/app/components/HomeDesktop'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default SmartPage(Home, {
	hideTitle: true,
	transparentToolbar: null,
	hideFooter: null,
})

function Home() {
	// `/?hledat=…` was how the app searched for years — shared links, bookmarks
	// and the install prompt's shortcut all still carry it. The catalog answers
	// searches now, so hand the query over; replace, so Back leaves the app
	// rather than bouncing between the two.
	const searchParams = useSearchParams()
	const navigate = useSmartNavigate()

	useEffect(() => {
		const query = searchParams.get('hledat')
		if (query === null) return
		navigate('songsList', { hledat: query, s: undefined }, { replace: true })
	}, [searchParams, navigate])

	return (
		<>
			<HomeDesktop />
		</>
	)
}
