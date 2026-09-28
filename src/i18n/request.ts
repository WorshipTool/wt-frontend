import { getRequestConfig } from 'next-intl/server'
import { getContentVersion, getLocale } from '../../i18n-config'

export default getRequestConfig(async () => {
	// One locale per deployment — the brand decides which, because the brand is
	// what decides the language of the catalogue. See `getLocale`.
	const locale = getLocale()
	const contentVersion = getContentVersion()

	return {
		locale,
		messages: (await import(`../../content/${contentVersion}.json`)).default,
	}
})
