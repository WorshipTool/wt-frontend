import { FeatureFlag } from '@/common/providers/FeatureFlags/flags.types'
import { useStatsigClient } from '@/common/providers/FeatureFlags/FeatureFlagsProvider'
import { useCallback } from 'react'

/**
 * Hook to get the value of a feature flag.
 * Returns false while Statsig is loading.
 */
export function useFlag(key: FeatureFlag) {
	const client = useStatsigClient()
	if (!client) return false
	return client.checkGate(key as string)
}

/**
 * Hook that returns a function to check feature flags imperatively.
 * Useful when you need to check flags dynamically (e.g., in a loop or based on data).
 */
export function useFlagChecker() {
	const client = useStatsigClient()

	return useCallback(
		(key: FeatureFlag): boolean => {
			if (!client) return false
			return client.checkGate(key as string)
		},
		[client],
	)
}
