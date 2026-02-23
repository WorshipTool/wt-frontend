export function isPreviewMode(): boolean {
	return process.env.NEXT_PUBLIC_PREVIEW_MODE === 'true'
}

export function getPreviewPrNumber(): string | null {
	return process.env.NEXT_PUBLIC_PREVIEW_PR_NUMBER ?? null
}

export function getPreviewPrTitle(): string | null {
	return process.env.NEXT_PUBLIC_PREVIEW_PR_TITLE ?? null
}
