import { Z_INDEX, ZIndexLayer } from './zIndex'

describe('Z_INDEX', () => {
	it('exports all expected layer keys', () => {
		const expectedKeys = [
			'DEEP_BACKGROUND',
			'BEHIND',
			'BASE',
			'RAISED',
			'ELEVATED',
			'STICKY',
			'SEARCH',
			'CORNER_STACK',
			'OVERLAY',
			'POPUP',
			'TOOLTIP',
			'DIALOG',
			'CONTEXT_MENU',
			'LOADING',
			'FLOATING_EDIT',
		]
		for (const key of expectedKeys) {
			expect(Z_INDEX).toHaveProperty(key)
		}
	})

	it('all values are numbers', () => {
		for (const [key, value] of Object.entries(Z_INDEX)) {
			expect(typeof value).toBe('number')
		}
	})

	it('maintains correct ordering (each layer >= previous, except background layers)', () => {
		// Background layers are negative
		expect(Z_INDEX.DEEP_BACKGROUND).toBeLessThan(Z_INDEX.BEHIND)
		expect(Z_INDEX.BEHIND).toBeLessThan(Z_INDEX.BASE)

		// Content layers ascend
		expect(Z_INDEX.BASE).toBeLessThanOrEqual(Z_INDEX.RAISED)
		expect(Z_INDEX.RAISED).toBeLessThanOrEqual(Z_INDEX.ELEVATED)

		// UI layers above content
		expect(Z_INDEX.ELEVATED).toBeLessThanOrEqual(Z_INDEX.STICKY)
		expect(Z_INDEX.STICKY).toBeLessThanOrEqual(Z_INDEX.SEARCH)
		expect(Z_INDEX.SEARCH).toBeLessThanOrEqual(Z_INDEX.CORNER_STACK)

		// Overlay layers above UI
		expect(Z_INDEX.CORNER_STACK).toBeLessThanOrEqual(Z_INDEX.OVERLAY)
		expect(Z_INDEX.OVERLAY).toBeLessThanOrEqual(Z_INDEX.POPUP)
		expect(Z_INDEX.POPUP).toBeLessThanOrEqual(Z_INDEX.TOOLTIP)
		expect(Z_INDEX.TOOLTIP).toBeLessThanOrEqual(Z_INDEX.DIALOG)

		// Top layers above everything
		expect(Z_INDEX.DIALOG).toBeLessThanOrEqual(Z_INDEX.CONTEXT_MENU)
		expect(Z_INDEX.CONTEXT_MENU).toBeLessThanOrEqual(Z_INDEX.LOADING)
		expect(Z_INDEX.CONTEXT_MENU).toBeLessThanOrEqual(Z_INDEX.FLOATING_EDIT)
	})

	it('CORNER_STACK is below POPUP (corner buttons should not obscure popups)', () => {
		expect(Z_INDEX.CORNER_STACK).toBeLessThan(Z_INDEX.POPUP)
	})

	it('FLOATING_EDIT is at the highest level (admin edit button always visible)', () => {
		expect(Z_INDEX.FLOATING_EDIT).toBeGreaterThanOrEqual(Z_INDEX.LOADING)
		expect(Z_INDEX.FLOATING_EDIT).toBeGreaterThanOrEqual(Z_INDEX.CONTEXT_MENU)
		expect(Z_INDEX.FLOATING_EDIT).toBeGreaterThanOrEqual(Z_INDEX.DIALOG)
	})

	it('has no unexpected key additions (snapshot of keys)', () => {
		const keys = Object.keys(Z_INDEX).sort()
		expect(keys).toEqual([
			'BASE',
			'BEHIND',
			'CONTEXT_MENU',
			'CORNER_STACK',
			'DEEP_BACKGROUND',
			'DIALOG',
			'ELEVATED',
			'FLOATING_EDIT',
			'LOADING',
			'OVERLAY',
			'POPUP',
			'RAISED',
			'SEARCH',
			'STICKY',
			'TOOLTIP',
		])
	})

	it('ZIndexLayer type matches the values', () => {
		// Ensure each value satisfies the ZIndexLayer type at compile time
		const values: ZIndexLayer[] = Object.values(Z_INDEX)
		expect(values.length).toBeGreaterThan(0)
	})
})
