'use client'
import { userDtoToStatsigUser } from '@/common/providers/FeatureFlags/flags.tech'
import useAuth from '@/hooks/auth/useAuth'
import { StatsigProvider } from '@statsig/react-bindings'
import { StatsigClient } from '@statsig/js-client'
import { useEffect, useRef, useState } from 'react'
import { getEnvironmentStatsigConfig } from './flags.tech'

type Props = {
	children: React.ReactNode
}

export function FeatureFlagsProvider(props: Props) {
	const { user } = useAuth()
	const [isReady, setIsReady] = useState(false)
	const clientRef = useRef<StatsigClient | null>(null)

	// Initialize Statsig client with dynamically loaded plugins
	useEffect(() => {
		let cancelled = false

		const initClient = async () => {
			// Dynamically import heavy plugins to keep them out of the main bundle
			const [webAnalytics, sessionReplay] = await Promise.all([
				import('@statsig/web-analytics'),
				import('@statsig/session-replay'),
			])

			if (cancelled) return

			const client = new StatsigClient(
				process.env.NEXT_PUBLIC_STATSIG_API_KEY!,
				{},
				{
					plugins: [
						new webAnalytics.StatsigAutoCapturePlugin(),
						new sessionReplay.StatsigSessionReplayPlugin(),
					],
					...getEnvironmentStatsigConfig(),
				}
			)

			await client.initializeAsync()

			if (cancelled) return

			clientRef.current = client
			setIsReady(true)
		}

		initClient()

		return () => {
			cancelled = true
		}
	}, [])

	// Update user when auth changes
	useEffect(() => {
		if (!clientRef.current) return

		if (user) {
			const data = userDtoToStatsigUser(user)
			clientRef.current.updateUserAsync(data)
		} else {
			clientRef.current.updateUserAsync({})
		}
	}, [user, isReady])

	if (!isReady || !clientRef.current) {
		// Render children immediately without waiting for Statsig
		// Feature flags will use default values until Statsig is ready
		return <>{props.children}</>
	}

	return (
		<StatsigProvider client={clientRef.current}>
			{props.children}
		</StatsigProvider>
	)
}
