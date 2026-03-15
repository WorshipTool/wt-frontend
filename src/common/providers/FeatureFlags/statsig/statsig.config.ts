import { getEnvironmentStatsigConfig } from '@/common/providers/FeatureFlags/flags.tech'
import Statsig from 'statsig-node'

let initialized = false
let initFailed = false

export const isStatsigAvailable = () => initialized && !initFailed

export const ensureStatsigInitialized = async () => {
	if (initialized || initFailed) return
	try {
		await Statsig.initialize(process.env.STATSTIG_SERVER_SECRET_KEY, {
			...getEnvironmentStatsigConfig(),
		})
		initialized = true
	} catch (error) {
		initFailed = true
		console.warn(
			'[Statsig] Failed to initialize — falling back to default values.',
			error instanceof Error ? error.message : error
		)
	}
}
