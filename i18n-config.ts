export const locales = ['cs', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale = 'en'

export async function getMessages(locale: Locale = defaultLocale) {
  return (await import(`./content/chvalotce.cz/${locale}.json`)).default
}