export async function getMessages() {
  const contentVersion = process.env.CONTENT_VERSION || 'chvalotce'
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