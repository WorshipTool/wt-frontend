'use client'
import useAuth from '@/hooks/auth/useAuth'
import { ROLES } from '@/interfaces/user'
import { useEffect, useRef } from 'react'

type MixpanelType = typeof import('mixpanel-browser').default

// Baked in at build time. Without it Mixpanel stays off.
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

export default function MixPanelAnalytics() {
	const { user } = useAuth()
	const mixpanelRef = useRef<MixpanelType | null>(null)

	useEffect(() => {
		if (!MIXPANEL_TOKEN) return

		import('mixpanel-browser').then((mod) => {
			const mixpanel = mod.default
			mixpanel.init(MIXPANEL_TOKEN, {
				api_host: 'https://api-eu.mixpanel.com',
			})
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
