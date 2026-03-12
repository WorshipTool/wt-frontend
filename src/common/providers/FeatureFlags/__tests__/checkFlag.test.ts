const mockEnsureInitialized = jest.fn()
const mockIsInitialized = jest.fn()

jest.mock('statsig-node', () => {
	const mockCheckGate = jest.fn()
	return {
		__esModule: true,
		default: {
			checkGate: (...args: unknown[]) => mockCheckGate(...args),
			__mockCheckGate: mockCheckGate,
		},
		StatsigUser: {},
	}
})

jest.mock('../statsig/statsig.config', () => ({
	ensureStatsigInitialized: () => mockEnsureInitialized(),
	isStatsigInitialized: () => mockIsInitialized(),
}))

jest.mock('../../../../tech/development.tech', () => ({
	isDevelopment: true,
}))

import Statsig from 'statsig-node'
import { checkFlag } from '../flags.tech'

// Access the mock function from the mocked module
const mockCheckGate = (Statsig as unknown as { __mockCheckGate: jest.Mock })
	.__mockCheckGate

describe('checkFlag', () => {
	beforeEach(() => {
		mockEnsureInitialized.mockReset()
		mockIsInitialized.mockReset()
		mockCheckGate.mockReset()
	})

	it('returns flag value from Statsig when initialized', async () => {
		mockEnsureInitialized.mockResolvedValue(undefined)
		mockIsInitialized.mockReturnValue(true)
		mockCheckGate.mockReturnValue(true)

		const result = await checkFlag('enable_smart_search')

		expect(result).toBe(true)
		expect(mockCheckGate).toHaveBeenCalled()
	})

	it('returns false when Statsig is not initialized', async () => {
		mockEnsureInitialized.mockResolvedValue(undefined)
		mockIsInitialized.mockReturnValue(false)

		const result = await checkFlag('enable_smart_search')

		expect(result).toBe(false)
		expect(mockCheckGate).not.toHaveBeenCalled()
	})

	it('returns false when Statsig.checkGate throws', async () => {
		mockEnsureInitialized.mockResolvedValue(undefined)
		mockIsInitialized.mockReturnValue(true)
		mockCheckGate.mockImplementation(() => {
			throw new Error('Statsig not ready')
		})

		const result = await checkFlag('enable_smart_search')

		expect(result).toBe(false)
	})
})
