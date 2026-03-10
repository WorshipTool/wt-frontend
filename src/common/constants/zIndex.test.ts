import { Z_INDEX, ZIndexLayer } from './zIndex'

describe('Z_INDEX', () => {
	it('exports all expected layer keys', () => {
		const expectedKeys = [
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

	it('all values are greater than 100', () => {
		for (const [key, value] of Object.entries(Z_INDEX)) {
			expect(value).toBeGreaterThan(100)
		}
	})

	it('maintains correct ordering (each layer >= previous)', () => {
		// Overlay layers above corner stack
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
			'CONTEXT_MENU',
			'CORNER_STACK',
			'DIALOG',
			'FLOATING_EDIT',
			'LOADING',
			'OVERLAY',
			'POPUP',
			'TOOLTIP',
		])
	})

	it('ZIndexLayer type matches the values', () => {
		// Ensure each value satisfies the ZIndexLayer type at compile time
		const values: ZIndexLayer[] = Object.values(Z_INDEX)
		expect(values.length).toBeGreaterThan(0)
	})
})
