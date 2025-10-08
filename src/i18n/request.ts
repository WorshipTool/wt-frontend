import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
	// Provide a static locale
	const locale = 'en'
	const contentVersion = process.env.CONTENT_VERSION || 'chvalotce'

	return {
		locale,
		messages: (await import(`../../content/${contentVersion}.json`)).default,
	}
})
