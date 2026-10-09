/**
 * The language each brand's catalogue is written in.
 *
 * This is not decoration. It is the locale ICU uses to pick a plural form, and
 * Czech has one English does not: `few`, for two to four. Pinned to `en`, every
 * Czech count above one fell through to `other` — "4 playlistů" where the
 * catalogue plainly says `few {# playlisty}`, on every screen that counts
 * anything. It is also what a screen reader pronounces the page in, and what a
 * browser offers to translate from.
 */
const LOCALE_BY_BRAND: Record<string, string> = {
  chvalotce: 'cs',
  chwalmy: 'pl',
  hallelujahhub: 'en',
}

export function getContentVersion() {
  return process.env.CONTENT_VERSION || 'chvalotce'
}

export function getLocale() {
  return LOCALE_BY_BRAND[getContentVersion()] ?? 'en'
}

export async function getMessages() {
  const contentVersion = getContentVersion()
  return (await import(`./content/${contentVersion}.json`)).default
}

export function getMessagesSync() {
  const contentVersion = process.env.CONTENT_VERSION || 'chvalotce'
  
  // Check if we're running on the server (Node.js environment)
  if (typeof window === 'undefined' && typeof require !== 'undefined') {
    try {
      return require(`./content/${contentVersion}.json`)
    } catch (error) {
      console.error(`Failed to load messages for version ${contentVersion}:`, error)
      // Fallback to chvalotce
      return require(`./content/chvalotce.json`)
    }
  }
  
  // Client-side fallback - this shouldn't be used much since getMessages is preferred
  throw new Error('getMessagesSync is only available on server-side. Use getMessages() instead.')
}