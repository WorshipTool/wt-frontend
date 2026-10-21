'use client'
import { isStandalonePwa } from '@/tech/device.tech'
import { useEffect, useState } from 'react'

/**
 * Whether the app runs as an installed app, as React state.
 *
 * Starts as false and is only answered after mount: the server can't know,
 * and a first client render that disagreed with it would hydrate links with
 * a different href than the server sent.
 */
export const useIsStandalonePwa = () => {
	const [standalone, setStandalone] = useState(false)

	useEffect(() => {
		setStandalone(isStandalonePwa())
	}, [])

	return standalone
}
