jest.mock('../flags.tech', () => ({
	userDtoToStatsigUser: jest.fn(() => ({ userID: 'anonymous' })),
}))

const mockGetConfig = jest.fn()

jest.mock('statsig-node', () => ({
	__esModule: true,
	default: {
		getConfig: (...args: unknown[]) => mockGetConfig(...args),
	},
}))

const mockEnsureInit = jest.fn()
const mockIsAvailable = jest.fn()

jest.mock('../statsig/statsig.config', () => ({
	ensureStatsigInitialized: (...args: unknown[]) => mockEnsureInit(...args),
	isStatsigAvailable: () => mockIsAvailable(),
}))

import { getCloudConfig } from './cloud-config.tech'

describe('getCloudConfig', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		mockEnsureInit.mockResolvedValue(undefined)
	})

	it('returns defaultValue when Statsig is not available', async () => {
		mockIsAvailable.mockReturnValue(false)

		const result = await getCloudConfig(
			'basic' as any,
			'SHOW_LOADING_SCREEN' as any,
			true
		)
		expect(result).toBe(true)
		expect(mockGetConfig).not.toHaveBeenCalled()
	})

	it('returns config value when Statsig is available', async () => {
		mockIsAvailable.mockReturnValue(true)
		mockGetConfig.mockReturnValue({
			value: { SHOW_LOADING_SCREEN: false },
		})

		const result = await getCloudConfig(
			'basic' as any,
			'SHOW_LOADING_SCREEN' as any,
			true
		)
		expect(result).toBe(false)
	})

	it('returns defaultValue when config key is missing', async () => {
		mockIsAvailable.mockReturnValue(true)
		mockGetConfig.mockReturnValue({ value: {} })

		const result = await getCloudConfig(
			'basic' as any,
			'SHOW_LOADING_SCREEN' as any,
			true
		)
		expect(result).toBe(true)
	})

	it('always calls ensureStatsigInitialized', async () => {
		mockIsAvailable.mockReturnValue(false)
		await getCloudConfig('basic' as any, 'SHOW_LOADING_SCREEN' as any, true)
		expect(mockEnsureInit).toHaveBeenCalledTimes(1)
	})
})
