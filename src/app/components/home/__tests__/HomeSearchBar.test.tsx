import './setup'
import React from 'react'

describe('HomeSearchBar', () => {
	it('exports HOME_SEARCH_EVENT_NAME constant', async () => {
		const mod = await import('../HomeSearchBar')
		expect(mod.HOME_SEARCH_EVENT_NAME).toBe('home_search_focus_event')
	})

	it('exports default component function', async () => {
		const mod = await import('../HomeSearchBar')
		expect(typeof mod.default).toBe('function')
	})
})
