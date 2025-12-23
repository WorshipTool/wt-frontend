import {
	// changeUrlFromSubdomains,
	changeUrlToSubdomains,
} from '@/routes/tech/subdomains.tech'
import {} from '../../../tests/test.tech'

// Create test
describe('changeUrlToSubdomains', () => {
	it('should change url to subdomains', () => {
		const url = 'http://localhost:5500/sub/tymy'

		const changed = changeUrlToSubdomains(url)

		expect(changed).toBe('http://tymy.localhost:5500/')
	})
	it('should change url to subdomains', () => {
		const url = 'http://localhost:5500/sub/tymy/ahoj'

		const changed = changeUrlToSubdomains(url)

		expect(changed).toBe('http://tymy.localhost:5500/ahoj')
	})
	it('should change url to subdomains', () => {
		const url = 'http://localhost:5500/sub/a/b?c=d'

		const changed = changeUrlToSubdomains(url)

		expect(changed).toBe('http://a.localhost:5500/b?c=d')
	})
	// it('should change url from subdomains', () => {
	// 	const url = 'http://ahoj.localhost:5500'

	// 	const changed = changeUrlFromSubdomains(url)
	// 	expect(changed).toBe('http://localhost:5500/sub/ahoj/')
	// })
	it('should not change url without subdomains', () => {
		const url = 'http://localhost:5500/seznam'

		const changed = changeUrlToSubdomains(url)

		expect(changed).toBe(url)
	})

	// it('should not change url without subdomains', () => {
	// 	const url = 'http://localhost:5500/seznam/ahoj/cau'

	// 	const changed = changeUrlToSubdomains(url)

	// 	expect(changed).toBe(url)
	// })
})
