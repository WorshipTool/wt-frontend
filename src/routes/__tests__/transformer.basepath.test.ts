// Mock FRONTEND_URL with a non-root basePath, as it would be for preview deployments.
// jest.mock is hoisted before imports, so transformer.tech.ts will receive this value.
jest.mock('../../api/constants', () => ({
	FRONTEND_URL: 'https://preview.chvalotce.cz/pr-55',
	BACKEND_URL: 'https://preview.chvalotce.cz',
	POSTPARSEIMAGE_URL: '/song/parse',
}))

import {
	getComplexReplacedUrlWithParams,
	getReplacedUrlWithParams,
} from '@/routes/tech/transformer.tech'

describe('getReplacedUrlWithParams — basePath /pr-55', () => {
	it('prepends basePath to relative path, absolute output', () => {
		expect(
			getReplacedUrlWithParams('/prihlaseni', {}, { returnFormat: 'absolute', returnSubdomains: 'never' })
		).toBe('https://preview.chvalotce.cz/pr-55/prihlaseni')
	})

	it('prepends basePath to relative path, relative output', () => {
		expect(
			getReplacedUrlWithParams('/prihlaseni', {}, { returnFormat: 'relative', returnSubdomains: 'never' })
		).toBe('/pr-55/prihlaseni')
	})

	it('does not double-prepend basePath when path already contains it', () => {
		expect(
			getReplacedUrlWithParams('/pr-55/prihlaseni', {}, { returnFormat: 'absolute', returnSubdomains: 'never' })
		).toBe('https://preview.chvalotce.cz/pr-55/prihlaseni')
	})

	it('replaces route params and prepends basePath', () => {
		expect(
			getReplacedUrlWithParams('/pisen/[hex]/[alias]', { hex: 'abc', alias: 'def' }, { returnFormat: 'absolute', returnSubdomains: 'never' })
		).toBe('https://preview.chvalotce.cz/pr-55/pisen/abc/def')
	})

	it('preserves query params and prepends basePath', () => {
		const result = getReplacedUrlWithParams('/seznam', { page: '2' }, { returnFormat: 'absolute', returnSubdomains: 'never' })
		expect(result).toBe('https://preview.chvalotce.cz/pr-55/seznam?page=2')
	})

	it('absolute input URL with basePath already embedded is left unchanged', () => {
		expect(
			getReplacedUrlWithParams('https://preview.chvalotce.cz/pr-55/prihlaseni', {}, { returnFormat: 'absolute', returnSubdomains: 'never' })
		).toBe('https://preview.chvalotce.cz/pr-55/prihlaseni')
	})
})

describe('getComplexReplacedUrlWithParams — basePath /pr-55 (Link component usage)', () => {
	it('generates correct absolute URL for Link href', () => {
		expect(
			getComplexReplacedUrlWithParams('/prihlaseni', {}, { returnFormat: 'absolute' })
		).toBe('https://preview.chvalotce.cz/pr-55/prihlaseni')
	})

	it('generates correct relative URL', () => {
		expect(
			getComplexReplacedUrlWithParams('/seznam', {}, { returnFormat: 'relative', returnSubdomains: 'never' })
		).toBe('/pr-55/seznam')
	})

	it('generates correct absolute URL with route params', () => {
		expect(
			getComplexReplacedUrlWithParams('/pisen/[hex]/[alias]', { hex: 'abc', alias: 'def' }, { returnFormat: 'absolute', returnSubdomains: 'never' })
		).toBe('https://preview.chvalotce.cz/pr-55/pisen/abc/def')
	})
})
