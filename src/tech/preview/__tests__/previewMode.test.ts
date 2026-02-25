import { isPreviewMode, getPreviewPrNumber, getPreviewPrTitle } from '../previewMode'

const env = process.env as Record<string, string | undefined>

function setEnv(frontendUrl?: string, previewBaseUrl?: string, prTitle?: string) {
	if (frontendUrl !== undefined) env.NEXT_PUBLIC_FRONTEND_URL = frontendUrl
	else delete env.NEXT_PUBLIC_FRONTEND_URL
	if (previewBaseUrl !== undefined) env.NEXT_PUBLIC_PREVIEW_BASE_URL = previewBaseUrl
	else delete env.NEXT_PUBLIC_PREVIEW_BASE_URL
	if (prTitle !== undefined) env.NEXT_PUBLIC_PREVIEW_PR_TITLE = prTitle
	else delete env.NEXT_PUBLIC_PREVIEW_PR_TITLE
}

function resetEnv() {
	delete env.NEXT_PUBLIC_FRONTEND_URL
	delete env.NEXT_PUBLIC_PREVIEW_BASE_URL
	delete env.NEXT_PUBLIC_PREVIEW_PR_TITLE
}

// Re-import module with fresh env for each test group
// Since the module caches env at module load time, we need jest.resetModules()
function freshImport() {
	jest.resetModules()
	return require('../previewMode') as typeof import('../previewMode')
}

describe('isPreviewMode', () => {
	afterEach(resetEnv)

	it('returns true when FRONTEND_URL starts with PREVIEW_BASE_URL + /', () => {
		setEnv('https://preview.chvalotce.cz/pr-99', 'https://preview.chvalotce.cz')
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(true)
	})

	it('returns true for any PR number', () => {
		setEnv('https://preview.chvalotce.cz/pr-1', 'https://preview.chvalotce.cz')
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(true)
	})

	it('returns false when FRONTEND_URL matches PREVIEW_BASE_URL exactly (no path)', () => {
		setEnv('https://preview.chvalotce.cz', 'https://preview.chvalotce.cz')
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(false)
	})

	it('returns false for production URL', () => {
		setEnv('https://chvalotce.cz', 'https://preview.chvalotce.cz')
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(false)
	})

	it('returns false when FRONTEND_URL is undefined', () => {
		setEnv(undefined, 'https://preview.chvalotce.cz')
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(false)
	})

	it('returns false when PREVIEW_BASE_URL is undefined', () => {
		setEnv('https://preview.chvalotce.cz/pr-5', undefined)
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(false)
	})

	it('returns false when both env vars are undefined', () => {
		setEnv(undefined, undefined)
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(false)
	})
})

describe('getPreviewPrNumber', () => {
	afterEach(resetEnv)

	it('returns the PR number from the URL path', () => {
		setEnv('https://preview.chvalotce.cz/pr-99', 'https://preview.chvalotce.cz')
		const { getPreviewPrNumber } = freshImport()
		expect(getPreviewPrNumber()).toBe('99')
	})

	it('returns a multi-digit PR number', () => {
		setEnv('https://preview.chvalotce.cz/pr-123', 'https://preview.chvalotce.cz')
		const { getPreviewPrNumber } = freshImport()
		expect(getPreviewPrNumber()).toBe('123')
	})

	it('returns null when not in preview mode', () => {
		setEnv('https://chvalotce.cz', 'https://preview.chvalotce.cz')
		const { getPreviewPrNumber } = freshImport()
		expect(getPreviewPrNumber()).toBeNull()
	})

	it('returns null when FRONTEND_URL is undefined', () => {
		setEnv(undefined, 'https://preview.chvalotce.cz')
		const { getPreviewPrNumber } = freshImport()
		expect(getPreviewPrNumber()).toBeNull()
	})

	it('returns null when URL has no pr- segment', () => {
		setEnv('https://preview.chvalotce.cz/other-path', 'https://preview.chvalotce.cz')
		const { getPreviewPrNumber } = freshImport()
		expect(getPreviewPrNumber()).toBeNull()
	})
})

describe('getPreviewPrTitle', () => {
	afterEach(resetEnv)

	it('returns the PR title from env var', () => {
		setEnv('https://preview.chvalotce.cz/pr-1', 'https://preview.chvalotce.cz', 'My feature branch')
		const { getPreviewPrTitle } = freshImport()
		expect(getPreviewPrTitle()).toBe('My feature branch')
	})

	it('returns null when env var is not set', () => {
		setEnv('https://preview.chvalotce.cz/pr-1', 'https://preview.chvalotce.cz', undefined)
		const { getPreviewPrTitle } = freshImport()
		expect(getPreviewPrTitle()).toBeNull()
	})

	it('returns null when env var is not set (even when URLs are non-preview)', () => {
		setEnv('https://chvalotce.cz', 'https://preview.chvalotce.cz', undefined)
		const { getPreviewPrTitle } = freshImport()
		expect(getPreviewPrTitle()).toBeNull()
	})
})
