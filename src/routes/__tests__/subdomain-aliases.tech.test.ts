import { FRONTEND_URL } from '@/api/constants'
import { SubdomainData } from '@/routes/subdomains/SubdomainPathnameAliasProvider'
import { getUrlWithSubdomainPathnameAliases } from '@/routes/tech/subdomains.tech'
import {
	getTestBaseUrlHostname,
	getTestBaseUrlProtocol,
} from '../../../tests/test.tech'

const baseUrlHostname = getTestBaseUrlHostname()
describe('Most basic absolute', () => {
	const IN_URL = `http://test-chvalotce.cz:5500/sub/tymy/9r78ets`
	const OUTPUT_URL = `http://test-chvalotce.cz:5500/sub/13ka`

	const alias: SubdomainData = {
		subdomain: '13ka',
		pathname: '/sub/tymy/9r78ets',
	}
	const output = getUrlWithSubdomainPathnameAliases(IN_URL, [alias])

	it('should return correct url', () => {
		expect(output).toBe(OUTPUT_URL)
	})
})

describe('Most basic relative', () => {
	const IN_URL = '/sub/tymy/9r78ets'
	const OUTPUT_URL = '/sub/13ka'

	const alias: SubdomainData = {
		subdomain: '13ka',
		pathname: '/sub/tymy/9r78ets',
	}
	const output = getUrlWithSubdomainPathnameAliases(IN_URL, [alias])

	it('should return correct url', () => {
		expect(output).toBe(OUTPUT_URL)
	})
})

describe('Absolute url with given subdomain in format', () => {
	const IN_URL = `http://page.test-chvalotce.cz:5500/sub/tymy/9r78ets`
	const OUTPUT_URL = `http://page.test-chvalotce.cz:5500/sub/13ka`

	const alias: SubdomainData = {
		subdomain: '13ka',
		pathname: '/sub/tymy/9r78ets',
	}
	const output = getUrlWithSubdomainPathnameAliases(IN_URL, [alias])

	it('should return correct url', () => {
		expect(output).toBe(OUTPUT_URL)
	})
})

describe('Absolute url with given subdomain in format with trailing slash', () => {
	const url = `${FRONTEND_URL}/sub/page/[id]/details`
	const subdomainAliases = [
		{
			subdomain: 'test',
			pathname: '/sub/page',
		},
	]
	const result = getUrlWithSubdomainPathnameAliases(url, subdomainAliases)
	expect(result).toBe(
		`${getTestBaseUrlProtocol()}://${baseUrlHostname}/sub/test/[id]/details`
	)
})
