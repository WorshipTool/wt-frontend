import './setup'
import React from 'react'

describe('HomeDesktop', () => {
	it('exports RESET_HOME_SCREEN_EVENT_NAME constant (backwards compat)', async () => {
		const mod = await import('../../HomeDesktop')
		expect(mod.RESET_HOME_SCREEN_EVENT_NAME).toBe(
			'reset_home_screen_jh1a94'
		)
	})

	it('exports default component function', async () => {
		const mod = await import('../../HomeDesktop')
		expect(typeof mod.default).toBe('function')
	})
})

describe('Home subcomponents', () => {
	it('exports HeroSection', async () => {
		const mod = await import('../HeroSection')
		expect(typeof mod.default).toBe('function')
	})

	it('exports SongIdeasSection', async () => {
		const mod = await import('../SongIdeasSection')
		expect(typeof mod.default).toBe('function')
	})

	it('exports RecentlyAddedSection', async () => {
		const mod = await import('../RecentlyAddedSection')
		expect(typeof mod.default).toBe('function')
	})
})
