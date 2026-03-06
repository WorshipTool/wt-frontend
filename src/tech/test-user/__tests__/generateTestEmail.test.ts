import { generateTestEmail } from '../generateTestEmail'

describe('generateTestEmail', () => {
	it('should return a string matching the pattern test[HASH]@test.cz', () => {
		const email = generateTestEmail()
		expect(email).toMatch(/^test[A-Z0-9]+@test\.cz$/)
	})

	it('should include at least one character between test prefix and @test.cz', () => {
		const email = generateTestEmail()
		const match = email.match(/^test([A-Z0-9]+)@test\.cz$/)
		expect(match).not.toBeNull()
		expect(match![1].length).toBeGreaterThan(0)
	})

	it('should return unique emails on each call', () => {
		const emails = new Set(Array.from({ length: 50 }, () => generateTestEmail()))
		expect(emails.size).toBe(50)
	})

	it('should always produce valid email format', () => {
		for (let i = 0; i < 10; i++) {
			const email = generateTestEmail()
			expect(email).toContain('@')
			expect(email.endsWith('@test.cz')).toBe(true)
			expect(email.startsWith('test')).toBe(true)
		}
	})
})
