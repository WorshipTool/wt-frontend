'use server'

import { useServerApi } from '@/api/tech-and-hooks/useServerApi'

/**
 * This function works similarily to console.error, but it can also send errors to messenger
 */
export async function logServerError(title: string, description: string) {
	const { loggerApi } = await useServerApi()

	console.error(title + ':', description)

	try {
		loggerApi.error({
			title: title,
			content: description,
		})
	} catch (e) {
		console.log('Error sending error to backend logger', e)
	}
}
