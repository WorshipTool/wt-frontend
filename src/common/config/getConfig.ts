import { getMessages, getMessagesSync } from '../../../i18n-config'

export async function getConfig() {
	const messages = await getMessages()
	return messages.config
}

export function getConfigSync() {
	try {
		const messages = getMessagesSync()
		return messages.config
	} catch (error) {
		console.error('Failed to load config synchronously:', error)
		// This should only happen on client-side where sync loading isn't supported
		throw new Error('getConfigSync is only available on server-side. Use getConfig() instead.')
	}
}