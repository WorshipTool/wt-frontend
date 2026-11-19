import type {
	AxiosError,
	AxiosInstance,
	InternalAxiosRequestConfig,
} from 'axios'

/**
 * Retry for transient backend failures (a backend restart, a dropped
 * connection). Deliberately narrow:
 * - only idempotent methods — retrying a POST could create a song twice,
 * - only network errors and 502/503/504 — a 500 is a bug, retrying won't fix it,
 * - only two short retries — during a real outage longer retries would just
 *   slow every SSR request and pile load onto a backend that is coming back.
 *
 * Errors reach handleApiCall / handleServerApiCall (and Sentry) only after the
 * last attempt, so blips that a retry fixes are not reported at all.
 */
export const RETRY_DELAYS_MS = [300, 900]

const RETRYABLE_METHODS = ['get', 'head', 'options']
const RETRYABLE_STATUSES = [502, 503, 504]

type RetryableConfig = InternalAxiosRequestConfig & { __retryCount?: number }

export const isRetryableError = (error: AxiosError): boolean => {
	const config = error.config
	if (!config) return false
	if (error.code === 'ERR_CANCELED') return false

	const method = (config.method ?? 'get').toLowerCase()
	if (!RETRYABLE_METHODS.includes(method)) return false

	const status = error.response?.status
	// No response at all = network error / connection reset / timeout
	if (status === undefined) return true

	return RETRYABLE_STATUSES.includes(status)
}

/** Base delay ±25 % jitter, so parallel requests don't retry in lockstep. */
export const getRetryDelay = (
	baseDelayMs: number,
	random: () => number = Math.random
): number => Math.round(baseDelayMs * (0.75 + random() * 0.5))

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const attachRetry = (
	instance: AxiosInstance,
	delaysMs: number[] = RETRY_DELAYS_MS
): AxiosInstance => {
	instance.interceptors.response.use(undefined, async (error: AxiosError) => {
		if (!isRetryableError(error)) throw error

		const config = error.config as RetryableConfig
		const attempt = config.__retryCount ?? 0
		if (attempt >= delaysMs.length) throw error

		config.__retryCount = attempt + 1
		await wait(getRetryDelay(delaysMs[attempt]))
		return instance.request(config)
	})
	return instance
}
