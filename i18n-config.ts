export async function getMessages() {
  const contentVersion = process.env.CONTENT_VERSION || 'chvalotce'
  return (await import(`./content/${contentVersion}.json`)).default
}