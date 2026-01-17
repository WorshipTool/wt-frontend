import { FeatureFlag } from '@/common/providers/FeatureFlags/flags.types'
import { useGateValue, useStatsigClient } from '@statsig/react-bindings'
import { useCallback } from 'react'

/**
 * Hook to get the value of a feature flag.
 * @param key The key of the feature flag.
 * @returns The value of the feature flag.
 */
export function useFlag(key: FeatureFlag) {
	const data = useGateValue(key as string, {})

	return data
}

/**
 * Hook that returns a function to check feature flags imperatively.
 * Useful when you need to check flags dynamically (e.g., in a loop or based on data).
 *
 * @returns A function that takes a flag key and returns its boolean value.
 */
export function useFlagChecker() {
	const { checkGate } = useStatsigClient()

	return useCallback(
		(key: FeatureFlag): boolean => {
			return checkGate(key as string)
		},
		[checkGate]
	)
}
