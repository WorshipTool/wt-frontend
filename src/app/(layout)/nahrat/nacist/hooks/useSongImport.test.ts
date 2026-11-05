import {
	GeneralParserError,
	GeneralParserResultEvent,
	streamGeneralParse,
} from '@/api/general-parser/generalParser'
import { act, renderHook, waitFor } from '@testing-library/react'
import { loadImportResult } from '../tech/importStorage'
import { problemForError, useSongImport } from './useSongImport'

jest.mock('../../../../../hooks/auth/useAuth', () => ({
	__esModule: true,
	default: () => ({ user: { token: 't' } }),
}))
jest.mock('../../../../../api/general-parser/generalParser', () => ({
	...jest.requireActual('../../../../../api/general-parser/generalParser'),
	streamGeneralParse: jest.fn(),
}))

const stream = jest.mocked(streamGeneralParse)

const result: GeneralParserResultEvent = {
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
}

const link = { kind: 'link', label: 'https://a.cz' } as const
const file = { kind: 'file', label: 'a.pdf' } as const

describe('problemForError: where it failed → what the user is told', () => {
	it.each([
		[new GeneralParserError('response', 400), link, 'badInput'],
		[new GeneralParserError('response', 400), file, 'failed'],
		[new GeneralParserError('response', 401), link, 'login'],
		[new GeneralParserError('response', 413), file, 'tooLarge'],
		[new GeneralParserError('response', 503), link, 'service'],
		[new GeneralParserError('connection'), link, 'service'],
		[new GeneralParserError('stream'), link, 'stream'],
		[new TypeError('anything else'), link, 'stream'],
	])('%p from a %p source → %s', (error, source, problem) => {
		expect(problemForError(error, source)).toBe(problem)
	})
})

describe('useSongImport', () => {
	beforeEach(() => {
		stream.mockReset()
		window.sessionStorage.clear()
	})

	it('a successful parse shows the songs and stores them', async () => {
		stream.mockImplementation(async (_, { onProgress }) => {
			onProgress?.({ event: 'progress', step: 'detect', message: '', ms: 1 })
			return result
		})
		const { result: hook } = renderHook(() => useSongImport())

		act(() => hook.current.importUrl('a.cz'))

		await waitFor(() => expect(hook.current.state.phase).toBe('done'))
		expect(stream.mock.calls[0][0]).toEqual({ url: 'https://a.cz' })
		expect(loadImportResult()?.songs).toEqual(result.songs)
	})

	it('reset aborts the running parse and goes back to the form', async () => {
		let signal: AbortSignal | undefined
		stream.mockImplementation(
			(_, options) =>
				new Promise((_, reject) => {
					signal = options.signal
					signal?.addEventListener('abort', () =>
						reject(new DOMException('aborted', 'AbortError')),
					)
				}),
		)
		const { result: hook } = renderHook(() => useSongImport())

		act(() => hook.current.importUrl('a.cz'))
		expect(hook.current.state.phase).toBe('running')

		act(() => hook.current.reset())

		expect(signal?.aborted).toBe(true)
		await act(async () => {})
		expect(hook.current.state.phase).toBe('idle')
	})

	it('a connection lost mid-stream → the `stream` problem, with the steps seen', async () => {
		stream.mockImplementation(async (_, { onProgress }) => {
			onProgress?.({ event: 'progress', step: 'detect', message: '', ms: 1 })
			throw new GeneralParserError('stream', undefined, new TypeError())
		})
		const { result: hook } = renderHook(() => useSongImport())

		act(() => hook.current.importUrl('a.cz'))

		await waitFor(() => expect(hook.current.state.phase).toBe('problem'))
		expect(hook.current.state).toMatchObject({
			problem: 'stream',
			seen: ['detect'],
		})
	})

	it('an invalid result (the client rejects it) → `stream`, not a spinner', async () => {
		stream.mockRejectedValue(new GeneralParserError('stream'))
		const { result: hook } = renderHook(() => useSongImport())

		act(() => hook.current.importUrl('a.cz'))

		await waitFor(() => expect(hook.current.state.phase).toBe('problem'))
		expect(hook.current.state).toMatchObject({ problem: 'stream' })
	})

	it('an unreadable file is turned away before anything is sent', () => {
		const { result: hook } = renderHook(() => useSongImport())
		const docx = new File(['x'], 'zpevnik.docx', { type: '' })

		act(() => hook.current.importFile(docx))

		expect(stream).not.toHaveBeenCalled()
		expect(hook.current.state).toMatchObject({
			phase: 'problem',
			problem: 'unsupportedFile',
			source: { kind: 'file', label: 'zpevnik.docx' },
		})
	})

	it('a HEIC with no MIME type goes through', async () => {
		stream.mockResolvedValue(result)
		const { result: hook } = renderHook(() => useSongImport())

		act(() => hook.current.importFile(new File(['x'], 'IMG_1.heic')))

		await waitFor(() => expect(hook.current.state.phase).toBe('done'))
	})
})
