const mockEnsureInitialized = jest.fn()
const mockIsInitialized = jest.fn()

jest.mock('statsig-node', () => {
	const mockGetConfig = jest.fn()
	return {
		__esModule: true,
		default: {
			getConfig: (...args: unknown[]) => mockGetConfig(...args),
			__mockGetConfig: mockGetConfig,
		},
	}
})

jest.mock('../../statsig/statsig.config', () => ({
	ensureStatsigInitialized: () => mockEnsureInitialized(),
	isStatsigInitialized: () => mockIsInitialized(),
}))

jest.mock('../../flags.tech', () => ({
	userDtoToStatsigUser: (user?: unknown) =>
		user ? { userID: 'test' } : { userID: 'anonymous' },
}))

import Statsig from 'statsig-node'
import { getCloudConfig } from '../cloud-config.tech'

// Access the mock function from the mocked module
const mockGetConfig = (Statsig as unknown as { __mockGetConfig: jest.Mock })
	.__mockGetConfig

describe('getCloudConfig', () => {
	beforeEach(() => {
		mockEnsureInitialized.mockReset()
		mockIsInitialized.mockReset()
		mockGetConfig.mockReset()
	})

	it('returns config value from Statsig when initialized', async () => {
		mockEnsureInitialized.mockResolvedValue(undefined)
		mockIsInitialized.mockReturnValue(true)
		mockGetConfig.mockReturnValue({
			value: { SHOW_LOADING_SCREEN: false },
		})

		const result = await getCloudConfig(
			'basic',
			'SHOW_LOADING_SCREEN',
			true
		)

		expect(result).toBe(false)
	})

	it('returns defaultValue when Statsig is not initialized', async () => {
		mockEnsureInitialized.mockResolvedValue(undefined)
		mockIsInitialized.mockReturnValue(false)

		const result = await getCloudConfig(
			'basic',
			'SHOW_LOADING_SCREEN',
			true
		)

		expect(result).toBe(true)
		expect(mockGetConfig).not.toHaveBeenCalled()
	})

	it('returns defaultValue when Statsig.getConfig throws', async () => {
		mockEnsureInitialized.mockResolvedValue(undefined)
		mockIsInitialized.mockReturnValue(true)
		mockGetConfig.mockImplementation(() => {
			throw new Error('Statsig not ready')
		})

		const result = await getCloudConfig(
			'basic',
			'SHOW_LOADING_SCREEN',
			true
		)

		expect(result).toBe(true)
	})

	it('returns defaultValue when config key is missing (nullish coalescing)', async () => {
		mockEnsureInitialized.mockResolvedValue(undefined)
		mockIsInitialized.mockReturnValue(true)
		mockGetConfig.mockReturnValue({
			value: {},
		})

		const result = await getCloudConfig(
			'basic',
			'SHOW_LOADING_SCREEN',
			true
		)

		expect(result).toBe(true)
	})
})
