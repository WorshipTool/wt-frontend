import { theme } from '../theme'

describe('theme', () => {
	it('defines primary colors', () => {
		expect(theme.palette.primary.main).toBe('#00e5ff')
		expect(theme.palette.primary.dark).toBe('#7b2fff')
	})

	it('defines secondary color', () => {
		expect(theme.palette.secondary.main).toBe('#ff00e5')
	})

	it('defines success color', () => {
		expect(theme.palette.success.main).toBe('#39ff14')
	})

	it('defines dark cyberpunk grey scale', () => {
		const greys = theme.palette.grey
		expect(greys).toBeDefined()
		expect(greys![50]).toBe('#1a1a2e')
		expect(greys![100]).toBe('#1a1a2e')
		expect(greys![200]).toBe('#16162a')
		expect(greys![300]).toBe('#12122a')
		expect(greys![400]).toBe('#2a2a4a')
		expect(greys![500]).toBe('#4a4a6a')
		expect(greys![600]).toBe('#8888aa')
		expect(greys![700]).toBe('#aaaacc')
		expect(greys![800]).toBe('#ccccee')
		expect(greys![900]).toBe('#e8e8ff')
	})

	it('uses dark mode', () => {
		expect(theme.palette.mode).toBe('dark')
	})

	it('defines dark background colors', () => {
		expect(theme.palette.background?.default).toBe('#0a0a0f')
		expect(theme.palette.background?.paper).toBe('#0e0e1a')
	})
})
