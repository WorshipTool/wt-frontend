import { AxiosError } from 'axios'
import { isApiNotFoundError } from './isApiNotFoundError'

const withStatus = (status: number) =>
	new AxiosError('fail', 'ERR_BAD_REQUEST', undefined, undefined, {
		status,
	} as any)

describe('isApiNotFoundError', () => {
	it('is true for a 404 response', () => {
		expect(isApiNotFoundError(withStatus(404))).toBe(true)
	})

	it.each([400, 403, 500, 502, 503])('is false for %s', (status) => {
		expect(isApiNotFoundError(withStatus(status))).toBe(false)
	})

	it('is false for a network error (no response)', () => {
		expect(isApiNotFoundError(new AxiosError('Network Error'))).toBe(false)
	})

	it.each([undefined, null, 'x', new Error('boom')])(
		'is false for non-API error %p',
		(e) => {
			expect(isApiNotFoundError(e)).toBe(false)
		}
	)
})
