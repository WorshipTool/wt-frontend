const mockInitialize = jest.fn()

jest.mock('statsig-node', () => ({
	__esModule: true,
	default: {
		initialize: (...args: unknown[]) => mockInitialize(...args),
	},
}))

jest.mock('../flags.tech', () => ({
	getEnvironmentStatsigConfig: () => ({
		environment: { tier: 'development' },
	}),
}))

describe('statsig.config', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.resetModules()
	})

	it('returns false for isStatsigAvailable before initialization', async () => {
		const { isStatsigAvailable } = await import('./statsig.config')
		expect(isStatsigAvailable()).toBe(false)
	})

	it('sets isStatsigAvailable to true on successful init', async () => {
		mockInitialize.mockResolvedValueOnce(undefined)
		const { ensureStatsigInitialized, isStatsigAvailable } = await import(
			'./statsig.config'
		)
		await ensureStatsigInitialized()
		expect(isStatsigAvailable()).toBe(true)
	})

	it('sets isStatsigAvailable to false when init throws', async () => {
		mockInitialize.mockRejectedValueOnce(new Error('Invalid key'))
		const { ensureStatsigInitialized, isStatsigAvailable } = await import(
			'./statsig.config'
		)
		await ensureStatsigInitialized()
		expect(isStatsigAvailable()).toBe(false)
	})

	it('does not throw when initialization fails', async () => {
		mockInitialize.mockRejectedValueOnce(new Error('Invalid key'))
		const { ensureStatsigInitialized } = await import('./statsig.config')
		await expect(ensureStatsigInitialized()).resolves.toBeUndefined()
	})

	it('does not retry after a failure', async () => {
		mockInitialize.mockRejectedValueOnce(new Error('Invalid key'))
		const { ensureStatsigInitialized } = await import('./statsig.config')
		await ensureStatsigInitialized()
		await ensureStatsigInitialized()
		expect(mockInitialize).toHaveBeenCalledTimes(1)
	})

	it('does not re-initialize after success', async () => {
		mockInitialize.mockResolvedValueOnce(undefined)
		const { ensureStatsigInitialized } = await import('./statsig.config')
		await ensureStatsigInitialized()
		await ensureStatsigInitialized()
		expect(mockInitialize).toHaveBeenCalledTimes(1)
	})

	it('logs a warning on failure', async () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
		mockInitialize.mockRejectedValueOnce(new Error('Invalid key'))
		const { ensureStatsigInitialized } = await import('./statsig.config')
		await ensureStatsigInitialized()
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('[Statsig]'),
			expect.stringContaining('Invalid key')
		)
		warnSpy.mockRestore()
	})
})
