'use client'
import { userDtoToStatsigUser } from '@/common/providers/FeatureFlags/flags.tech'
import useAuth from '@/hooks/auth/useAuth'
import { StatsigClient } from '@statsig/js-client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getEnvironmentStatsigConfig } from './flags.tech'

type Props = {
	children: React.ReactNode
}

// v increments each time Statsig signals new flag values, forcing consumers to re-evaluate.
// Without v, the client reference never changes, so React skips re-rendering consumers
// even after updateUserAsync() resolves with a different flag set (e.g. logged-in user).
type FeatureFlagsContextValue = { client: StatsigClient | null; v: number }

// Custom context instead of @statsig/react-bindings StatsigProvider.
// A plain React context never changes the tree structure, preventing
// hydration mismatches and child remounts that StatsigProvider caused.
const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({
	client: null,
	v: 0,
})

export function useStatsigClient(): StatsigClient | null {
	return useContext(FeatureFlagsContext).client
}

export function FeatureFlagsProvider(props: Props) {
	const { user } = useAuth()
	const [ctx, setCtx] = useState<FeatureFlagsContextValue>({ client: null, v: 0 })

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

			setCtx({ client: instance, v: 0 })
		}

		initClient()

		return () => {
			cancelled = true
		}
	}, [])

	// Subscribe to value updates and clean up on unmount.
	// Bumping v propagates new flag values to all consumers via context reference change.
	useEffect(() => {
		if (!ctx.client) return

		const onValuesUpdated = () => setCtx((prev) => ({ ...prev, v: prev.v + 1 }))
		ctx.client.$on('values_updated', onValuesUpdated)

		return () => {
			ctx.client!.off('values_updated', onValuesUpdated)
			ctx.client!.flush().catch(() => {})
		}
	}, [ctx.client])

	// Update Statsig user when auth changes
	const updateUser = useCallback(() => {
		if (!ctx.client) return

		if (user) {
			ctx.client.updateUserAsync(userDtoToStatsigUser(user))
		} else {
			ctx.client.updateUserAsync({})
		}
	}, [ctx.client, user])

	useEffect(updateUser, [updateUser])

	// Tree structure is always: FeatureFlagsContext.Provider > children
	// Never changes — no remounts, no hydration issues.
	return (
		<FeatureFlagsContext.Provider value={ctx}>
			{props.children}
		</FeatureFlagsContext.Provider>
	)
}
