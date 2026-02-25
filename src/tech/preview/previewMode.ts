const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL
const PREVIEW_BASE_URL = process.env.NEXT_PUBLIC_PREVIEW_BASE_URL

export function isPreviewMode(): boolean {
	if (!FRONTEND_URL || !PREVIEW_BASE_URL) return false
	return FRONTEND_URL.startsWith(PREVIEW_BASE_URL + '/')
}

export function getPreviewPrNumber(): string | null {
	if (!isPreviewMode() || !FRONTEND_URL) return null
	const match = FRONTEND_URL.match(/\/pr-(\d+)/)
	return match ? match[1] : null
}

export function getPreviewPrTitle(): string | null {
	return process.env.NEXT_PUBLIC_PREVIEW_PR_TITLE ?? null
}
