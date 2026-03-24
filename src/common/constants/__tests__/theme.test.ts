import { theme } from '../theme'

describe('theme', () => {
	it('defines primary colors', () => {
		expect(theme.palette.primary.main).toBe('#0085FF')
		expect(theme.palette.primary.dark).toBe('#532EE7')
	})

	it('defines secondary color', () => {
		expect(theme.palette.secondary.main).toBe('#EBBC1E')
	})

	it('defines success color', () => {
		expect(theme.palette.success.main).toBe('#43a047')
	})

	it('defines warm-tinted grey scale', () => {
		const greys = theme.palette.grey
		expect(greys).toBeDefined()
		expect(greys![50]).toBe('#faf9f7')
		expect(greys![100]).toBe('#f7f6f4')
		expect(greys![200]).toBe('#efeeec')
		expect(greys![300]).toBe('#e2e0dc')
		expect(greys![400]).toBe('#c4c1bb')
		expect(greys![500]).toBe('#9e9b95')
		expect(greys![600]).toBe('#75726c')
		expect(greys![700]).toBe('#5c5a55')
		expect(greys![800]).toBe('#3d3b37')
		expect(greys![900]).toBe('#1f1e1b')
	})

	it('has warm grey undertones (not pure grey)', () => {
		// Warm greys should not be pure hex grey (where R=G=B)
		const grey100 = theme.palette.grey![100]
		// #f7f6f4 has different R, G, B values (warm tint)
		const r = parseInt(grey100!.slice(1, 3), 16)
		const g = parseInt(grey100!.slice(3, 5), 16)
		const b = parseInt(grey100!.slice(5, 7), 16)
		expect(r).not.toBe(g)
		expect(g).not.toBe(b)
	})
})
