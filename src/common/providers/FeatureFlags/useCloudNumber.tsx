import { CloudNumber } from '@/common/providers/FeatureFlags/flags.types'
import { useStatsigClient } from '@/common/providers/FeatureFlags/FeatureFlagsProvider'

/**
 * Hook to get the value of a cloud number from the 'global' parameter store.
 * Returns defaultValue while Statsig is loading.
 */
export function useCloudNumber(key: CloudNumber, defaultValue: number) {
	const client = useStatsigClient()
	if (!client) return defaultValue

	try {
		const store = client.getParameterStore('global')
		if (typeof store?.get !== 'function') return defaultValue
		return store.get<number>(key as string) ?? defaultValue
	} catch {
		return defaultValue
	}
}
