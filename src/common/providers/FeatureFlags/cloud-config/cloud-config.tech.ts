import {
	CloudConfigs,
	cloudConfigsNames,
} from '@/common/providers/FeatureFlags/cloud-config/cloud-config.types'
import { userDtoToStatsigUser } from '@/common/providers/FeatureFlags/flags.tech'
import {
	ensureStatsigInitialized,
	isStatsigInitialized,
} from '@/common/providers/FeatureFlags/statsig/statsig.config'
import { UserDto } from '@/interfaces/user'
import Statsig from 'statsig-node'

export const getCloudConfig = async <
	T extends keyof CloudConfigs,
	R extends keyof CloudConfigs[T]
>(
	configName: T,
	key: R,
	defaultValue: CloudConfigs[T][R],
	user?: UserDto
): Promise<CloudConfigs[T][R]> => {
	await ensureStatsigInitialized()

	if (!isStatsigInitialized()) {
		return defaultValue
	}

	try {
		const config = Statsig.getConfig(
			userDtoToStatsigUser(user),
			cloudConfigsNames[configName]
		)

		const value =
			(config.value[key as string] as CloudConfigs[T][R]) ?? defaultValue
		return value
	} catch {
		return defaultValue
	}
}
