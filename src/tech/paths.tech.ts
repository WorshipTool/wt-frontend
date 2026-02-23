import { FRONTEND_URL } from '@/api/constants'
import { deriveBasePath } from '@/tech/url/basePath'

// Prepend basePath so next/image's internal fetch uses the correct URL on the server.
// Without this, the optimizer requests /assets/... but the server (with basePath /pr-XX)
// only serves paths that start with the basePath prefix.
const BASE_PATH = deriveBasePath(FRONTEND_URL)

export const getIconUrl = (icon: string) => {
	return getAssetUrl(`/icons/${icon}`)
}

export const getAssetUrl = (asset: string) => {
	if (asset.startsWith('/')) asset = asset.substring(1)
	return `${BASE_PATH}/assets/${asset}`
}
