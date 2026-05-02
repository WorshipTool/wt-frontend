import './setup'
import React from 'react'

describe('SongCardSkeleton', () => {
	it('exports default component function', async () => {
		const mod = await import('../SongCardSkeleton')
		expect(typeof mod.default).toBe('function')
	})
})
