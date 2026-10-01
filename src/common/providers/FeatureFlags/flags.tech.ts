import { FeatureFlag } from '@/common/providers/FeatureFlags/flags.types'
import { ensureStatsigInitialized } from '@/common/providers/FeatureFlags/statsig/statsig.config'
import { ROLES, UserDto } from '@/interfaces/user'
import { isDevelopment } from '@/tech/development.tech'

import Statsig, { StatsigUser } from 'statsig-node'
// import dotenv from 'dotenv'
// dotenv.config()

export const getEnvironmentStatsigConfig = () => ({
	environment: {
		tier: isDevelopment ? 'development' : 'production',
	},
})

export const STATSIG_ANON_USER = {
	userID: 'anonymous',
}

export const userDtoToStatsigUser = (user?: UserDto): StatsigUser => {
	if (!user) {
		return STATSIG_ANON_USER
	}

	const role = user.role === ROLES.Admin ? 'admin' : 'user'

	return {
		userID: user.guid,
		email: user.email,
		custom: {
			role: role,
			name: user.firstName + ' ' + user.lastName,
		},
	}
}

const cache: Record<string, { value: boolean; expiresAt: number }> = {}
const CACHE_DURATION_MS = 60 * 1000 // 1 minuta
//TODO: is cache really needed? Its better with cache?

const getFlagWithCache = (key: FeatureFlag, user?: UserDto): boolean | null => {
	// Zkontroluj cache
	const cacheKey = `${key}-${user?.guid || 'global'}`
	const cached = cache[cacheKey]

	if (cached && cached.expiresAt > Date.now()) {
		return cached.value
	}
	return null
}

const saveFlagToCache = (
	key: FeatureFlag,
	value: boolean,
	user?: UserDto,
): void => {
	const cacheKey = `${key}-${user?.guid || 'global'}`
	cache[cacheKey] = {
		value,
		expiresAt: Date.now() + CACHE_DURATION_MS,
	}
}

type CheckFlagOptions = {
	useCache?: boolean
}

/**
 * Check flag on serverside.
 *
 * Never throws. Statsig being unreachable — or misconfigured, which is what a
 * missing server key looks like — used to take the whole page down with it:
 * this runs inside server components, so the error escapes into the Suspense
 * boundary and the route renders its error state instead of the page. The song
 * page went dark over a gate that only decides whether a media section is
 * shown. `getCloudConfig` right next to it already degrades this way.
 *
 * The fallback is `false`, i.e. the gate is closed: every flag here guards
 * something extra (admin pages, a media section, gated content), so "we don't
 * know" and "not enabled" mean the same thing to the caller.
 */
export const checkFlag = async (
	key: FeatureFlag,
	user?: UserDto,
): Promise<boolean> => {
	try {
		await ensureStatsigInitialized()

		const userData = userDtoToStatsigUser(user)

		const value = Statsig.checkGate(userData, key as string)

		return value
	} catch (error) {
		console.error(
			`[checkFlag] Failed to check flag "${key}", treating it as off:`,
			error,
		)
		return false
	}
}
