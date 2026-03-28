import './setup'
import React from 'react'

describe('HomeSearchResults', () => {
	it('exports default component function', async () => {
		const mod = await import('../HomeSearchResults')
		expect(typeof mod.default).toBe('function')
	})
})
