import { TextDecoder, TextEncoder } from 'util'
import { serviceUnavailableEvent } from '@/tech/fetch/handleApiCall'
import * as Sentry from '@sentry/nextjs'
import axios, { AxiosError, CanceledError } from 'axios'
import {
	createNdjsonParser,
	GeneralParserError,
	GeneralParserEvent,
	isAbortError,
	isGeneralParserFile,
	streamGeneralParse,
} from './generalParser'

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }))

// jsdom has no TextDecoder; the client decodes the body with the global one
Object.assign(globalThis, { TextDecoder, TextEncoder })

const progress = (step: string) =>
	JSON.stringify({ event: 'progress', step, message: 'x', ms: 1 })
const result = JSON.stringify({
	event: 'result',
	status: 'done',
	type: 'page',
	songs: [
		{
			title: 'Ráno',
			sheetData: '{V}[C]Ráno',
			confidence: 0.9,
			source: { url: 'https://a.cz', file: null, index: 0 },
		},
	],
})

const kinds = (events: GeneralParserEvent[]) =>
	events.map((e) => (e.event === 'progress' ? e.step : e.event))

describe('createNdjsonParser', () => {
	it('reads several lines delivered in one chunk', () => {
		const p = createNdjsonParser()
		const events = p.push(
			`${progress('detect')}\n${progress('fetch')}\n${result}\n`,
		)
		expect(kinds(events)).toEqual(['detect', 'fetch', 'result'])
		expect(p.flush()).toEqual([])
	})

	it('holds a line split across chunks until it is complete', () => {
		const p = createNdjsonParser()
		const line = progress('extract')
		const cut = Math.floor(line.length / 2)

		expect(p.push(line.slice(0, cut))).toEqual([])
		expect(kinds(p.push(line.slice(cut) + '\n'))).toEqual(['extract'])
	})

	it('handles a chunk that ends one line and starts the next', () => {
		const p = createNdjsonParser()
		const a = progress('fetch')
		const b = progress('ocr')

		expect(kinds(p.push(a.slice(0, 5)))).toEqual([])
		expect(kinds(p.push(a.slice(5) + '\n' + b.slice(0, 7)))).toEqual(['fetch'])
		expect(kinds(p.push(b.slice(7) + '\n'))).toEqual(['ocr'])
	})

	it('reads a trailing line without a final newline on flush', () => {
		const p = createNdjsonParser()
		expect(kinds(p.push(`${progress('score')}\n${result}`))).toEqual(['score'])
		const rest = p.flush()
		expect(kinds(rest)).toEqual(['result'])
		expect(rest[0]).toMatchObject({
			status: 'done',
			songs: [{ title: 'Ráno' }],
		})
	})

	it('skips blank lines and kinds of line it does not know yet', () => {
		const p = createNdjsonParser()
		const events = p.push(
			`\n   \n{"event":"heartbeat"}\n${result}\r\n{"event":"error","message":"lost"}\n`,
		)
		expect(kinds(events)).toEqual(['result', 'error'])
	})

	it.each([
		['not JSON', 'not json'],
		['no event', '{"foo":1}'],
		['a result without songs', '{"event":"result","status":"done"}'],
		[
			'a result with an unknown status',
			'{"event":"result","status":"maybe","songs":[]}',
		],
		[
			'a song without its sheet',
			'{"event":"result","status":"done","songs":[{"title":"x"}]}',
		],
		[
			'songs that are not objects',
			'{"event":"result","status":"done","songs":[1]}',
		],
		['progress without a step', '{"event":"progress","message":"x"}'],
	])('an invalid line (%s) is a stream error', (_, line) => {
		const p = createNdjsonParser()
		let error: unknown
		try {
			p.push(`${progress('detect')}\n${line}\n`)
		} catch (e) {
			error = e
		}
		expect(error).toBeInstanceOf(GeneralParserError)
		expect((error as GeneralParserError).kind).toBe('stream')
	})

	it('an invalid line left for flush is a stream error too', () => {
		const p = createNdjsonParser()
		p.push('{"event":"result"')
		expect(() => p.flush()).toThrow(GeneralParserError)
	})

	it('survives a multi-byte character split across byte chunks', () => {
		const p = createNdjsonParser()
		const bytes = new TextEncoder().encode(result + '\n')
		// "á" in Ráno is two bytes; cut inside it
		const at = bytes.indexOf(0xc3) + 1
		const decoder = new TextDecoder()
		const events = [
			...p.push(decoder.decode(bytes.slice(0, at), { stream: true })),
			...p.push(decoder.decode(bytes.slice(at), { stream: true })),
			...p.push(decoder.decode()),
		]
		expect(events).toHaveLength(1)
		expect(events[0]).toMatchObject({ songs: [{ title: 'Ráno' }] })
	})
})

const axiosError = (status: number) =>
	new AxiosError('x', 'ERR', undefined, undefined, {
		status,
		data: null,
		statusText: '',
		headers: {},
		config: {} as any,
	})

/** A response body that hands out these chunks, then fails with `failWith`. */
function fakeBody(chunks: string[], failWith?: unknown) {
	const encoder = new TextEncoder()
	const queue = chunks.map((c) => encoder.encode(c))
	const reader = {
		read: jest.fn(async () => {
			const value = queue.shift()
			if (value) return { done: false, value }
			if (failWith) throw failWith
			return { done: true, value: undefined }
		}),
		cancel: jest.fn(async () => {}),
		releaseLock: jest.fn(),
	}
	return { body: { getReader: () => reader }, reader }
}

const respondWith = (body: unknown) =>
	jest.spyOn(axios, 'post').mockResolvedValue({ data: body } as any)

const parse = (onProgress?: (e: unknown) => void) =>
	streamGeneralParse({ url: 'https://a.cz' }, { token: 't', onProgress })

const failure = (promise: Promise<unknown>) =>
	promise.then(
		() => {
			throw new Error('expected a failure')
		},
		(e) => e as GeneralParserError,
	)

describe('streamGeneralParse', () => {
	afterEach(() => {
		jest.restoreAllMocks()
		jest.mocked(Sentry.captureException).mockClear()
	})

	it('reports progress and resolves with the result', async () => {
		const fetch = progress('fetch')
		respondWith(
			fakeBody([
				`${progress('detect')}\n${fetch.slice(0, 10)}`,
				`${fetch.slice(10)}\n${result}`,
			]).body,
		)
		const steps: string[] = []
		const final = await parse((e) => steps.push((e as { step: string }).step))
		expect(steps).toEqual(['detect', 'fetch'])
		expect(final).toMatchObject({ status: 'done', songs: [{ title: 'Ráno' }] })
		expect(Sentry.captureException).not.toHaveBeenCalled()
	})

	describe('before the response', () => {
		it.each([
			[503, 1],
			[400, 0],
		])(
			'HTTP %i → a `response` error, service-unavailable event fired %i×',
			async (status, times) => {
				jest.spyOn(axios, 'post').mockRejectedValue(axiosError(status))
				const listener = jest.fn()
				window.addEventListener(serviceUnavailableEvent, listener)
				const error = await failure(parse())
				window.removeEventListener(serviceUnavailableEvent, listener)
				expect(error).toBeInstanceOf(GeneralParserError)
				expect(error.kind).toBe('response')
				expect(error.status).toBe(status)
				expect(listener).toHaveBeenCalledTimes(times)
			},
		)

		it('no response at all → a `connection` error', async () => {
			jest
				.spyOn(axios, 'post')
				.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'))
			const error = await failure(parse())
			expect(error.kind).toBe('connection')
		})

		it('a cancelled request counts as an abort', async () => {
			jest.spyOn(axios, 'post').mockRejectedValue(new CanceledError())
			const error = await failure(parse())
			expect(isAbortError(error)).toBe(true)
		})
	})

	describe('while reading the body', () => {
		it('a dropped connection → a `stream` error, reported to Sentry once', async () => {
			const { body, reader } = fakeBody(
				[`${progress('detect')}\n`],
				new TypeError('network error'),
			)
			respondWith(body)
			const error = await failure(parse())
			expect(error.kind).toBe('stream')
			expect(error.reason).toBeInstanceOf(TypeError)
			expect(Sentry.captureException).toHaveBeenCalledTimes(1)
			expect(reader.releaseLock).toHaveBeenCalled()
		})

		it.each([
			['an invalid result line', '{"event":"result","status":"done"}\n'],
			['an error line', '{"event":"error","message":"lost"}\n'],
			['no result before the end', `${progress('score')}\n`],
		])('%s → a `stream` error', async (_, line) => {
			const { body, reader } = fakeBody([`${progress('detect')}\n`, line])
			respondWith(body)
			const error = await failure(parse())
			expect(error).toBeInstanceOf(GeneralParserError)
			expect(error.kind).toBe('stream')
			expect(Sentry.captureException).toHaveBeenCalledTimes(1)
			expect(reader.releaseLock).toHaveBeenCalled()
		})

		it('a body that is not a stream → a `stream` error', async () => {
			respondWith('not a stream')
			expect((await failure(parse())).kind).toBe('stream')
		})

		it('an abort while reading stays an abort, not reported', async () => {
			const controller = new AbortController()
			const abort = new DOMException('aborted', 'AbortError')
			const { body } = fakeBody([`${progress('detect')}\n`], abort)
			respondWith(body)
			const error = await failure(
				streamGeneralParse(
					{ url: 'https://a.cz' },
					{
						signal: controller.signal,
						onProgress: () => controller.abort(),
					},
				),
			)
			expect(isAbortError(error)).toBe(true)
			expect(Sentry.captureException).not.toHaveBeenCalled()
		})
	})
})

describe('isGeneralParserFile', () => {
	const file = (name: string, type: string) => ({ name, type })

	it.each([
		['a PDF', file('noty.pdf', 'application/pdf')],
		['an image', file('fotka.jpg', 'image/jpeg')],
		['an image of any kind', file('scan', 'image/x-whatever')],
		['HEIC with no MIME type', file('IMG_0001.HEIC', '')],
		['PDF with no MIME type', file('noty.pdf', '')],
	])('accepts %s', (_, f) => expect(isGeneralParserFile(f)).toBe(true))

	it.each([
		['a Word document', file('zpevnik.docx', 'application/vnd.openxmlformats')],
		['a .docx with no MIME type', file('zpevnik.docx', '')],
		['no extension, no MIME type', file('pdf', '')],
		['a text file', file('song.txt', 'text/plain')],
	])('rejects %s', (_, f) => expect(isGeneralParserFile(f)).toBe(false))
})
