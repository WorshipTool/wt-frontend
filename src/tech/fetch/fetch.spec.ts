import { isSafeUrl } from '@/tech/fetch/fetch'

describe('isSafeUrl', () => {
	describe('valid safe URLs', () => {
		it('should allow https://backend.chvalotce.cz/auth/checktokenexpiration', () => {
			expect(
				isSafeUrl('https://backend.chvalotce.cz/auth/checktokenexpiration')
			).toBe(true)
		})

		it('should allow localhost URLs', () => {
			expect(isSafeUrl('http://localhost:3000/api/test')).toBe(true)
			expect(isSafeUrl('https://localhost:5500/auth')).toBe(true)
		})

		it('should allow HTTPS URLs from safe hosts', () => {
			expect(isSafeUrl('https://chvalotce.cz/api/songs')).toBe(true)
			expect(isSafeUrl('https://worship.cz/api/data')).toBe(true)
			expect(isSafeUrl('https://api.fly.dev/health')).toBe(true)
		})
	})

	describe('invalid unsafe URLs', () => {
		it('should reject HTTP URLs from safe hosts (except localhost)', () => {
			expect(isSafeUrl('http://chvalotce.cz/api/songs')).toBe(false)
			expect(isSafeUrl('http://worship.cz/api/data')).toBe(false)
			expect(isSafeUrl('http://api.fly.dev/health')).toBe(false)
		})

		it('should reject URLs from unsafe hosts', () => {
			expect(isSafeUrl('https://malicious.com/api')).toBe(false)
			expect(isSafeUrl('https://example.com/data')).toBe(false)
			expect(isSafeUrl('https://evil.org/steal-data')).toBe(false)
		})

		it('should reject invalid URLs', () => {
			expect(isSafeUrl('not-a-url')).toBe(false)
			expect(isSafeUrl('')).toBe(false)
			expect(isSafeUrl('ftp://chvalotce.cz/file')).toBe(false)
		})

		it('should reject URLs with different protocols', () => {
			expect(isSafeUrl('ftp://chvalotce.cz/file')).toBe(false)
			expect(isSafeUrl('file://localhost/path')).toBe(false)
			expect(isSafeUrl('javascript:alert("xss")')).toBe(false)
		})
	})

	describe('edge cases', () => {
		it('should handle URLs with ports', () => {
			expect(isSafeUrl('https://chvalotce.cz:443/api')).toBe(true)
			expect(isSafeUrl('http://localhost:3000/api')).toBe(true)
		})

		it('should handle URLs with paths and query parameters', () => {
			expect(
				isSafeUrl(
					'https://backend.chvalotce.cz/auth/checktokenexpiration?token=abc123'
				)
			).toBe(true)
			expect(isSafeUrl('https://chvalotce.cz/api/songs/123?format=json')).toBe(
				true
			)
		})
	})
})
