// Mock the alpha function from MUI — use relative path to match how Jest resolves the module
jest.mock('../../ui/mui', () => ({
	alpha: (color: string, opacity: number) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
}))

import { getStatusStyle, STATUS_STYLE } from './shared'

describe('getStatusStyle', () => {
	it('returns the correct style for known statuses', () => {
		const knownStatuses = Object.keys(STATUS_STYLE)
		for (const status of knownStatuses) {
			const style = getStatusStyle(status)
			expect(style).toBe(STATUS_STYLE[status])
			expect(style.bg).toBeDefined()
			expect(style.color).toBeDefined()
		}
	})

	it('returns a fallback style for unknown/unexpected status', () => {
		const style = getStatusStyle('unknown_status')
		expect(style).toBeDefined()
		expect(style.bg).toBeDefined()
		expect(style.color).toBeDefined()
	})

	it('does not throw for undefined-like string values', () => {
		expect(() => getStatusStyle('')).not.toThrow()
		expect(() => getStatusStyle('pending')).not.toThrow()
		expect(() => getStatusStyle('cancelled')).not.toThrow()
	})

	it('returns an object with bg and color for any input', () => {
		const randomInputs = ['foo', 'bar', '123', 'RUNNING', 'COMPLETED']
		for (const input of randomInputs) {
			const style = getStatusStyle(input)
			expect(typeof style.bg).toBe('string')
			expect(typeof style.color).toBe('string')
		}
	})
})
