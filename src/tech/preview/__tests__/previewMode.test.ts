import { isPreviewMode, getPreviewPrNumber, getPreviewPrTitle } from '../previewMode'

const env = process.env as Record<string, string | undefined>

function setEnv(opts: { previewMode?: string; prNumber?: string; prTitle?: string }) {
	if (opts.previewMode !== undefined) env.NEXT_PUBLIC_PREVIEW_MODE = opts.previewMode
	else delete env.NEXT_PUBLIC_PREVIEW_MODE
	if (opts.prNumber !== undefined) env.NEXT_PUBLIC_PREVIEW_PR_NUMBER = opts.prNumber
	else delete env.NEXT_PUBLIC_PREVIEW_PR_NUMBER
	if (opts.prTitle !== undefined) env.NEXT_PUBLIC_PREVIEW_PR_TITLE = opts.prTitle
	else delete env.NEXT_PUBLIC_PREVIEW_PR_TITLE
}

function resetEnv() {
	delete env.NEXT_PUBLIC_PREVIEW_MODE
	delete env.NEXT_PUBLIC_PREVIEW_PR_NUMBER
	delete env.NEXT_PUBLIC_PREVIEW_PR_TITLE
}

// Re-import module with fresh env for each test group
// Since the module may cache env at module load time, we use jest.resetModules()
function freshImport() {
	jest.resetModules()
	return require('../previewMode') as typeof import('../previewMode')
}

describe('isPreviewMode', () => {
	afterEach(resetEnv)

	it('returns true when NEXT_PUBLIC_PREVIEW_MODE is "true"', () => {
		setEnv({ previewMode: 'true' })
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(true)
	})

	it('returns false when NEXT_PUBLIC_PREVIEW_MODE is "false"', () => {
		setEnv({ previewMode: 'false' })
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(false)
	})

	it('returns false when NEXT_PUBLIC_PREVIEW_MODE is not set', () => {
		setEnv({})
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(false)
	})

	it('returns false for arbitrary string values', () => {
		setEnv({ previewMode: 'yes' })
		const { isPreviewMode } = freshImport()
		expect(isPreviewMode()).toBe(false)
	})
})

describe('getPreviewPrNumber', () => {
	afterEach(resetEnv)

	it('returns the PR number from env', () => {
		setEnv({ prNumber: '42' })
		const { getPreviewPrNumber } = freshImport()
		expect(getPreviewPrNumber()).toBe('42')
	})

	it('returns null when not set', () => {
		setEnv({})
		const { getPreviewPrNumber } = freshImport()
		expect(getPreviewPrNumber()).toBeNull()
	})
})

describe('getPreviewPrTitle', () => {
	afterEach(resetEnv)

	it('returns the PR title from env', () => {
		setEnv({ prTitle: 'My feature branch' })
		const { getPreviewPrTitle } = freshImport()
		expect(getPreviewPrTitle()).toBe('My feature branch')
	})

	it('returns null when not set', () => {
		setEnv({})
		const { getPreviewPrTitle } = freshImport()
		expect(getPreviewPrTitle()).toBeNull()
	})
})
