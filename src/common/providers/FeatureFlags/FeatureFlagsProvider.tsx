'use client'
import { userDtoToStatsigUser } from '@/common/providers/FeatureFlags/flags.tech'
import useAuth from '@/hooks/auth/useAuth'
import { StatsigClient } from '@statsig/js-client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getEnvironmentStatsigConfig } from './flags.tech'

type Props = {
	children: React.ReactNode
}

// Custom context instead of @statsig/react-bindings StatsigProvider.
// A plain React context never changes the tree structure, preventing
// hydration mismatches and child remounts that StatsigProvider caused.
const FeatureFlagsContext = createContext<StatsigClient | null>(null)

export function useStatsigClient(): StatsigClient | null {
	return useContext(FeatureFlagsContext)
}

export function FeatureFlagsProvider(props: Props) {
	const { user } = useAuth()
	const [client, setClient] = useState<StatsigClient | null>(null)

	// Force re-render when Statsig values update (e.g. after user change)
	// so that consumer hooks re-evaluate against the new data.
	const [, forceUpdate] = useState(0)

	// Initialize Statsig client with dynamically loaded plugins
	useEffect(() => {
		let cancelled = false

		const initClient = async () => {
			const [webAnalytics, sessionReplay] = await Promise.all([
				import('@statsig/web-analytics'),
				import('@statsig/session-replay'),
			])

			if (cancelled) return

			const instance = new StatsigClient(
				process.env.NEXT_PUBLIC_STATSIG_API_KEY!,
				{},
				{
					plugins: [
						new webAnalytics.StatsigAutoCapturePlugin(),
						new sessionReplay.StatsigSessionReplayPlugin(),
					],
					...getEnvironmentStatsigConfig(),
				},
			)

			await instance.initializeAsync()

			if (cancelled) return

			setClient(instance)
		}

		initClient()

		return () => {
			cancelled = true
		}
	}, [])

	// Subscribe to value updates and clean up on unmount
	useEffect(() => {
		if (!client) return

		const onValuesUpdated = () => forceUpdate((v) => v + 1)
		client.$on('values_updated', onValuesUpdated)

		return () => {
			client.off('values_updated', onValuesUpdated)
			client.flush().catch(() => {})
		}
	}, [client])

	// Update Statsig user when auth changes
	const updateUser = useCallback(() => {
		if (!client) return

		if (user) {
			client.updateUserAsync(userDtoToStatsigUser(user))
		} else {
			client.updateUserAsync({})
		}
	}, [client, user])

	useEffect(updateUser, [updateUser])

	// Tree structure is always: FeatureFlagsContext.Provider > children
	// Never changes — no remounts, no hydration issues.
	return (
		<FeatureFlagsContext.Provider value={client}>
			{props.children}
		</FeatureFlagsContext.Provider>
	)
}
