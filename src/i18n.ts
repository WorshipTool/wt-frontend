import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
	// Provide a static locale, other ones are ignored
	const locale = 'en'

	return {
		locale,
		messages: (await import(`../content/chvalotce.cz/${locale}.json`)).default,
	}
})
