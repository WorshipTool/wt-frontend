'use client'
import useAuth from '@/hooks/auth/useAuth'
import { ROLES } from '@/interfaces/user'
import { useEffect, useRef } from 'react'

type MixpanelType = typeof import('mixpanel-browser').default

export default function MixPanelAnalytics() {
	const { user } = useAuth()
	const mixpanelRef = useRef<MixpanelType | null>(null)

	useEffect(() => {
		import('mixpanel-browser').then((mod) => {
			const mixpanel = mod.default
			mixpanel.init('24badb161d131f1852a9a1e527030e04')
			mixpanelRef.current = mixpanel
		})
	}, [])

	useEffect(() => {
		const mixpanel = mixpanelRef.current
		if (!mixpanel) return

		if (user) {
			mixpanel.identify(user.guid)
			mixpanel.people.set({
				$email: user.email,
				$first_name: user.firstName,
				$last_name: user.lastName,
				role: user.role === ROLES.User ? 'User' : 'Admin',
			})
		} else {
			mixpanel.reset()
		}
	}, [user])

	return null
}
