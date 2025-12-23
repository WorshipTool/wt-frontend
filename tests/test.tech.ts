/**
 * Legacy file - test utilities have been moved to @e2e/helpers/
 * This file is kept for backwards compatibility.
 */

import { FRONTEND_URL } from '@/api/constants'

export { login as test_tech_loginWithData } from '@e2e/helpers/auth.helper'

// getTestBaseUrlHostname,
// getTestBaseUrlProtocol,

export const getTestBaseUrlHostname = () => {
	return FRONTEND_URL.replace(/^https?:\/\//, '')
}
export const getTestBaseUrlProtocol = () => {
	return FRONTEND_URL.startsWith('https') ? 'https' : 'http'
}
