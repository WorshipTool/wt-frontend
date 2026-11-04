import { TextDecoder, TextEncoder } from 'util'
import { serviceUnavailableEvent } from '@/tech/fetch/handleApiCall'
import axios, { AxiosError, CanceledError } from 'axios'
import {
	createNdjsonParser,
	GeneralParserEvent,
	GeneralParserHttpError,
	isAbortError,
	streamGeneralParse,
} from './generalParser'

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

	it('skips blank, malformed and unknown lines without losing the rest', () => {
		const p = createNdjsonParser()
		const events = p.push(
			`\n   \nnot json\n{"foo":1}\n${result}\r\n{"event":"error","message":"lost"}\n`,
		)
		expect(kinds(events)).toEqual(['result', 'error'])
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

describe('streamGeneralParse errors go through handleApiCall', () => {
	afterEach(() => jest.restoreAllMocks())

	const axiosError = (status: number) =>
		new AxiosError('x', 'ERR', undefined, undefined, {
			status,
			data: null,
			statusText: '',
			headers: {},
			config: {} as any,
		})

	it.each([
		[503, 1],
		[400, 0],
	])(
		'HTTP %i → app-wide service-unavailable event fired %i×, GeneralParserHttpError thrown',
		async (status, times) => {
			jest.spyOn(axios, 'post').mockRejectedValue(axiosError(status))
			const listener = jest.fn()
			window.addEventListener(serviceUnavailableEvent, listener)
			const error = await streamGeneralParse(
				{ url: 'https://a.cz' },
				{ token: 't', onEvent: () => {} },
			).catch((e) => e)
			window.removeEventListener(serviceUnavailableEvent, listener)
			expect(error).toBeInstanceOf(GeneralParserHttpError)
			expect(error.status).toBe(status)
			expect(listener).toHaveBeenCalledTimes(times)
		},
	)

	it('a cancelled request counts as an abort', async () => {
		jest.spyOn(axios, 'post').mockRejectedValue(new CanceledError())
		const error = await streamGeneralParse(
			{ url: 'https://a.cz' },
			{ onEvent: () => {} },
		).catch((e) => e)
		expect(isAbortError(error)).toBe(true)
	})
})
