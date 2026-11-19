import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from 'axios'
import { attachRetry, getRetryDelay, isRetryableError } from './retry'

const makeError = (
	method: string | undefined,
	status?: number,
	code?: string
): AxiosError => {
	const config = { method, headers: new AxiosHeaders() }
	return new AxiosError(
		'fail',
		code,
		config,
		undefined,
		status === undefined
			? undefined
			: ({ status, data: null, headers: {}, statusText: '', config } as any)
	)
}

describe('isRetryableError', () => {
	it.each([502, 503, 504])('retries GET on %s', (status) => {
		expect(isRetryableError(makeError('get', status))).toBe(true)
	})

	it('retries GET on network error (no response)', () => {
		expect(isRetryableError(makeError('get'))).toBe(true)
	})

	it.each([400, 401, 403, 404, 500])('does not retry GET on %s', (status) => {
		expect(isRetryableError(makeError('get', status))).toBe(false)
	})

	it.each(['post', 'put', 'patch', 'delete'])(
		'never retries %s (not idempotent)',
		(method) => {
			expect(isRetryableError(makeError(method, 502))).toBe(false)
			expect(isRetryableError(makeError(method))).toBe(false)
		}
	)

	it('does not retry cancelled requests', () => {
		expect(isRetryableError(makeError('get', undefined, 'ERR_CANCELED'))).toBe(
			false
		)
	})

	it('does not retry errors without config', () => {
		expect(isRetryableError(new AxiosError('fail'))).toBe(false)
	})
})

describe('getRetryDelay', () => {
	it('stays within ±25 % of the base delay', () => {
		expect(getRetryDelay(400, () => 0)).toBe(300)
		expect(getRetryDelay(400, () => 1)).toBe(500)
		expect(getRetryDelay(400, () => 0.5)).toBe(400)
	})
})

describe('attachRetry', () => {
	// Adapter that fails with the given statuses in order, then succeeds
	const scriptedInstance = (statuses: (number | 'network')[]) => {
		const calls: AxiosRequestConfig[] = []
		const instance = axios.create({
			adapter: async (config) => {
				calls.push(config)
				const next = statuses.shift()
				if (next === undefined) {
					return { data: 'ok', status: 200, statusText: 'OK', headers: {}, config }
				}
				if (next === 'network') {
					throw new AxiosError('Network Error', 'ERR_NETWORK', config)
				}
				throw new AxiosError(
					'fail',
					'ERR_BAD_RESPONSE',
					config,
					undefined,
					{ status: next, data: null, headers: {}, statusText: '', config } as any
				)
			},
		})
		attachRetry(instance, [0, 0])
		return { instance, calls }
	}

	it('recovers from transient failures', async () => {
		const { instance, calls } = scriptedInstance([502, 'network'])
		const res = await instance.get('/x')
		expect(res.data).toBe('ok')
		expect(calls).toHaveLength(3)
	})

	it('gives up after the configured retries and rethrows the last error', async () => {
		const { instance, calls } = scriptedInstance([502, 503, 504])
		await expect(instance.get('/x')).rejects.toMatchObject({
			response: { status: 504 },
		})
		expect(calls).toHaveLength(3)
	})

	it('does not retry a POST', async () => {
		const { instance, calls } = scriptedInstance([502])
		await expect(instance.post('/x', {})).rejects.toMatchObject({
			response: { status: 502 },
		})
		expect(calls).toHaveLength(1)
	})

	it('does not retry a 500', async () => {
		const { instance, calls } = scriptedInstance([500])
		await expect(instance.get('/x')).rejects.toMatchObject({
			response: { status: 500 },
		})
		expect(calls).toHaveLength(1)
	})
})
