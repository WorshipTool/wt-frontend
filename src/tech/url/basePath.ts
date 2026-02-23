/**
 * Derives the Next.js basePath from NEXT_PUBLIC_FRONTEND_URL.
 *
 * Examples:
 *   https://chvalotce.cz              → ''
 *   https://preview.chvalotce.cz/pr-55 → '/pr-55'
 */
export function deriveBasePath(frontendUrl: string | undefined): string {
	if (!frontendUrl) return ''
	const p = new URL(frontendUrl).pathname
	return p === '/' ? '' : p
}

/**
 * Strips the basePath prefix from an incoming request pathname so that
 * application routing logic works with logical (basePath-relative) paths.
 *
 * Examples (basePath = '/pr-55'):
 *   /pr-55/prihlaseni → /prihlaseni
 *   /pr-55            → /
 *   /prihlaseni       → /prihlaseni   (no match — left unchanged)
 */
export function stripBasePath(pathname: string, basePath: string): string {
	if (
		basePath &&
		(pathname === basePath || pathname.startsWith(basePath + '/'))
	) {
		return pathname.slice(basePath.length) || '/'
	}
	return pathname
}
