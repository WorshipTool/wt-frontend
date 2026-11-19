/**
 * True only when the backend actually answered 404. Network errors, timeouts
 * and 5xx are NOT "not found" — answering notFound() for them during an outage
 * would tell search engines the page doesn't exist and get it deindexed.
 */
export const isApiNotFoundError = (error: unknown): boolean =>
	(error as { response?: { status?: number } })?.response?.status === 404
