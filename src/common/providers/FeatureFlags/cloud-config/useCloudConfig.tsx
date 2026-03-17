import {
	CloudConfigs,
	cloudConfigsNames,
} from '@/common/providers/FeatureFlags/cloud-config/cloud-config.types'
import { useStatsigClient } from '@/common/providers/FeatureFlags/FeatureFlagsProvider'

/**
 * Hook to get a value from a Statsig dynamic config.
 * Returns defaultValue while Statsig is loading.
 */
export const useCloudConfig = <
	T extends keyof CloudConfigs,
	R extends keyof CloudConfigs[T],
>(
	config: T,
	key: R,
	defaultValue: CloudConfigs[T][R],
): CloudConfigs[T][R] => {
	const client = useStatsigClient()
	if (!client) return defaultValue

	try {
		const dynamicConfig = client.getDynamicConfig(cloudConfigsNames[config])
		return (
			(dynamicConfig.value[key as string] as CloudConfigs[T][R]) ??
			defaultValue
		)
	} catch {
		return defaultValue
	}
}
