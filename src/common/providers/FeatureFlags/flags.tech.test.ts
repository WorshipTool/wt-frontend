const mockInitialize = jest.fn()
const mockCheckGate = jest.fn()

jest.mock('statsig-node', () => ({
	__esModule: true,
	default: {
		initialize: (...args: unknown[]) => mockInitialize(...args),
		checkGate: (...args: unknown[]) => mockCheckGate(...args),
	},
}))

import { checkFlag } from './flags.tech'

describe('checkFlag', () => {
	let consoleError: jest.SpyInstance

	beforeEach(() => {
		jest.clearAllMocks()
		consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		consoleError.mockRestore()
	})

	// first, while the module's init flag is still unset — a failed initialize
	// must not latch it, or the success case below would never re-initialize
	it('treats the flag as off when Statsig cannot initialize', async () => {
		mockInitialize.mockRejectedValue(new Error('Invalid key provided.'))

		// the page this runs in renders whatever comes back; what it must not do
		// is throw, because that takes the whole server render down with it
		await expect(checkFlag('show_media_on_song_page')).resolves.toBe(false)
		expect(mockCheckGate).not.toHaveBeenCalled()
		expect(consoleError).toHaveBeenCalled()
	})

	it('returns the gate once Statsig is up', async () => {
		mockInitialize.mockResolvedValue(undefined)
		mockCheckGate.mockReturnValue(true)

		await expect(checkFlag('show_media_on_song_page')).resolves.toBe(true)
		expect(mockCheckGate).toHaveBeenCalledWith(
			{ userID: 'anonymous' },
			'show_media_on_song_page'
		)
	})
})
