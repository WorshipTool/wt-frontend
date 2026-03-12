// Mock statsig-node before importing the module under test
const mockInitialize = jest.fn()
jest.mock('statsig-node', () => ({
	__esModule: true,
	default: {
		initialize: mockInitialize,
	},
}))

jest.mock('../../flags.tech', () => ({
	getEnvironmentStatsigConfig: () => ({
		environment: { tier: 'development' },
	}),
}))

describe('ensureStatsigInitialized', () => {
	beforeEach(() => {
		jest.resetModules()
		mockInitialize.mockReset()
	})

	it('initializes Statsig successfully when key is valid', async () => {
		mockInitialize.mockResolvedValue(undefined)

		const { ensureStatsigInitialized, isStatsigInitialized } =
			require('../statsig.config')

		await ensureStatsigInitialized()

		expect(mockInitialize).toHaveBeenCalledTimes(1)
		expect(isStatsigInitialized()).toBe(true)
	})

	it('does not throw when Statsig.initialize rejects', async () => {
		mockInitialize.mockRejectedValue(
			new Error('Invalid key provided.')
		)

		const { ensureStatsigInitialized, isStatsigInitialized } =
			require('../statsig.config')

		// Should not throw
		await expect(ensureStatsigInitialized()).resolves.toBeUndefined()
		expect(isStatsigInitialized()).toBe(false)
	})

	it('does not retry after initialization failure', async () => {
		mockInitialize.mockRejectedValue(
			new Error('Invalid key provided.')
		)

		const { ensureStatsigInitialized } = require('../statsig.config')

		await ensureStatsigInitialized()
		await ensureStatsigInitialized()

		// Should only attempt once, then skip on subsequent calls
		expect(mockInitialize).toHaveBeenCalledTimes(1)
	})

	it('does not re-initialize after success', async () => {
		mockInitialize.mockResolvedValue(undefined)

		const { ensureStatsigInitialized } = require('../statsig.config')

		await ensureStatsigInitialized()
		await ensureStatsigInitialized()

		expect(mockInitialize).toHaveBeenCalledTimes(1)
	})
})
