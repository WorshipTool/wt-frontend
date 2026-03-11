'use client'
import { userDtoToStatsigUser } from '@/common/providers/FeatureFlags/flags.tech'
import useAuth from '@/hooks/auth/useAuth'
import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings'
import { StatsigSessionReplayPlugin } from '@statsig/session-replay'
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics'
import { useEffect } from 'react'
import { getEnvironmentStatsigConfig } from './flags.tech'
type Props = {
	children: React.ReactNode
}

export function FeatureFlagsProvider(props: Props) {
	const { user } = useAuth()

	const { client } = useClientAsyncInit(
		process.env.NEXT_PUBLIC_STATSIG_API_KEY,
		{},
		{
			plugins:
				typeof window !== 'undefined'
					? [
							new StatsigAutoCapturePlugin(),
							new StatsigSessionReplayPlugin(),
						]
					: [],
			...getEnvironmentStatsigConfig(),
		}
	)

	useEffect(() => {
		if (user) {
			const data = userDtoToStatsigUser(user)
			client.updateUserAsync(data)
		} else {
			client.updateUserAsync({})
		}
	}, [user])

	return (
		<>
			<StatsigProvider client={client}>{props.children}</StatsigProvider>
		</>
	)
}
