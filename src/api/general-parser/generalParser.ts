import { getUrl } from '@/api/urls'
import { handleApiCall } from '@/tech/fetch/handleApiCall'
import * as Sentry from '@sentry/nextjs'
import axios, { isAxiosError, isCancel } from 'axios'

/**
 * Client for the backend's general parser: a link or a file in, songs out.
 *
 * Not in the generated client because the endpoint streams NDJSON — one JSON
 * object per line, progress first and the result last — which the generated
 * client would buffer into one string at the end. So it is axios with the
 * fetch adapter and `responseType: 'stream'`, read line by line as it arrives,
 * and the request goes through `handleApiCall` like every other API call (the
 * app-wide snackbars for 503 / 403 / network errors, 401 handling, Sentry).
 *
 *   POST {backend}/general-parser/parse   multipart: `url` OR `file` (≤ 40 MB)
 */

export const GENERAL_PARSER_PATH = '/general-parser/parse'

/** The backend refuses anything larger (413); checked before uploading. */
export const GENERAL_PARSER_MAX_FILE_BYTES = 40 * 1024 * 1024

/**
 * What the parser reads: a PDF or an image. A file's MIME type can be empty
 * (HEIC on Chrome/Windows, some Android pickers), so the extension counts too.
 */
const FILE_MIME = ['application/pdf', 'image/*']
const FILE_EXTENSIONS = [
	'pdf',
	'jpg',
	'jpeg',
	'png',
	'gif',
	'webp',
	'heic',
	'heif',
	'avif',
	'bmp',
	'tif',
	'tiff',
]

/** What a file input offers — a hint only; `isGeneralParserFile` decides. */
export const GENERAL_PARSER_ACCEPT = [
	...FILE_MIME,
	...FILE_EXTENSIONS.map((ext) => `.${ext}`),
].join(',')

/** Whether the parser can read this file, by its MIME type or its extension. */
export function isGeneralParserFile(file: Pick<File, 'name' | 'type'>) {
	const type = file.type.toLowerCase()
	const byType = FILE_MIME.some((mime) =>
		mime.endsWith('/*') ? type.startsWith(mime.slice(0, -1)) : type === mime,
	)
	const dot = file.name.lastIndexOf('.')
	const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : ''
	return byType || FILE_EXTENSIONS.includes(ext)
}

export type GeneralParserStep = 'detect' | 'fetch' | 'extract' | 'ocr' | 'score'

export type GeneralParserStatus =
	| 'done'
	| 'not-found'
	| 'unavailable'
	| 'failed'

export type GeneralParserSourceType =
	| 'page'
	| 'pdf'
	| 'image'
	| 'youtube'
	| 'text'
	| 'unknown'

export type GeneralParserSong = {
	title: string | null
	sheetData: string
	/** 0–1. Never shown as a number — below a threshold it becomes "check it". */
	confidence: number
	source: { url: string | null; file: string | null; index: number }
}

export type GeneralParserProgressEvent = {
	event: 'progress'
	step: GeneralParserStep
	/** Human text from the parser (Czech). */
	message: string
	ms: number
}

export type GeneralParserResultEvent = {
	event: 'result'
	status: GeneralParserStatus
	type: GeneralParserSourceType
	songs: GeneralParserSong[]
}

/** The backend lost its connection to the parser mid-stream. */
export type GeneralParserErrorEvent = {
	event: 'error'
	message: string
}

export type GeneralParserEvent =
	| GeneralParserProgressEvent
	| GeneralParserResultEvent
	| GeneralParserErrorEvent

export type GeneralParserInput = { url: string } | { file: File }

/**
 * Where a parse failed, which is what decides what the user can do about it:
 *
 * - `response` — the request got an answer that was not a stream (400, 401,
 *   403, 413, 502, 503 …); `status` says which.
 * - `connection` — no answer at all: the network was down before the response.
 * - `stream` — the stream started and then broke: the connection dropped while
 *   reading, a line was not a valid event, the backend sent an `error` line,
 *   or the stream ended without a result.
 *
 * An abort is none of these; it keeps its own cancel error (`isAbortError`).
 */
export type GeneralParserFailure = 'response' | 'connection' | 'stream'

export class GeneralParserError extends Error {
	constructor(
		public readonly kind: GeneralParserFailure,
		/** The HTTP status, for `response`. */
		public readonly status?: number,
		/** What broke underneath, when it was an error. */
		public readonly reason?: unknown,
	) {
		super(
			kind === 'response'
				? `General parser responded ${status}`
				: `General parser ${kind} failed`,
		)
		this.name = 'GeneralParserError'
	}
}

const STATUSES: readonly string[] = [
	'done',
	'not-found',
	'unavailable',
	'failed',
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

const isSong = (value: unknown): value is GeneralParserSong =>
	isRecord(value) && typeof value.sheetData === 'string'

/**
 * One guard per kind of line. Only what the screen relies on is checked: a
 * result needs a known status and a list of songs with their sheet, progress a
 * step name. A line that names one of these kinds but fails its guard breaks
 * the stream — showing a spinner forever, or crashing on `songs.length`, is
 * worse than saying it went wrong.
 */
const EVENT_GUARDS: Record<
	GeneralParserEvent['event'],
	(value: Record<string, unknown>) => boolean
> = {
	progress: (v) => typeof v.step === 'string',
	result: (v) =>
		typeof v.status === 'string' &&
		STATUSES.includes(v.status) &&
		Array.isArray(v.songs) &&
		v.songs.every(isSong),
	error: () => true,
}

/**
 * One line → its event; null for a blank line or a kind of line this client
 * does not know yet (the backend may add one; old clients must not break).
 * Throws a `stream` error for anything else: not JSON, no `event`, or a known
 * kind in the wrong shape.
 */
function parseEventLine(line: string): GeneralParserEvent | null {
	const trimmed = line.trim()
	if (!trimmed) return null
	let value: unknown
	try {
		value = JSON.parse(trimmed)
	} catch (error) {
		throw new GeneralParserError('stream', undefined, error)
	}
	const kind = isRecord(value) ? value.event : undefined
	if (typeof kind !== 'string') throw new GeneralParserError('stream')
	if (!(kind in EVENT_GUARDS)) return null
	const guard = EVENT_GUARDS[kind as GeneralParserEvent['event']]
	if (!guard(value as Record<string, unknown>))
		throw new GeneralParserError('stream')
	return value as GeneralParserEvent
}

/**
 * Turns a stream of text chunks into events. A chunk can end in the middle of a
 * line, hold several lines, or both; the unfinished tail waits for the next
 * chunk, and `flush()` reads whatever is left when the stream ends without a
 * final newline. An invalid line throws (see `parseEventLine`).
 */
export function createNdjsonParser() {
	let buffer = ''

	const parseLines = (lines: string[]) =>
		lines.map(parseEventLine).filter((e): e is GeneralParserEvent => e !== null)

	const push = (chunk: string): GeneralParserEvent[] => {
		buffer += chunk
		const lines = buffer.split('\n')
		buffer = lines.pop() ?? ''
		return parseLines(lines)
	}

	const flush = (): GeneralParserEvent[] => {
		const rest = buffer
		buffer = ''
		return parseLines([rest])
	}

	return { push, flush }
}

type StreamOptions = {
	/** The signed-in user's token; the endpoint is for signed-in users only. */
	token?: string
	signal?: AbortSignal
	/** Called for every progress line as it arrives. */
	onProgress?: (event: GeneralParserProgressEvent) => void
}

/**
 * Sends the link or file, reports progress as it streams in and resolves with
 * the result line.
 *
 * Every failure comes out as a `GeneralParserError` whose `kind` says where it
 * happened (see `GeneralParserFailure`); an abort through `signal` rejects with
 * a cancel error instead (`isAbortError`). Failures before the response go
 * through `handleApiCall` (app-wide snackbars, Sentry for 5xx); a stream that
 * breaks after it started is reported to Sentry here, once.
 */
export async function streamGeneralParse(
	input: GeneralParserInput,
	{ token, signal, onProgress }: StreamOptions,
): Promise<GeneralParserResultEvent> {
	const body = await openStream(input, token, signal)
	try {
		return await readResult(body, onProgress)
	} catch (error) {
		if (isAbortError(error) || signal?.aborted) throw error
		const failure =
			error instanceof GeneralParserError
				? error
				: new GeneralParserError('stream', undefined, error)
		Sentry.captureException(failure, {
			tags: { generalParser: 'stream' },
			extra: {
				url: getUrl(GENERAL_PARSER_PATH),
				reason:
					failure.reason instanceof Error
						? failure.reason.message
						: failure.reason,
			},
		})
		throw failure
	}
}

/** The request, up to the first byte of the body. */
async function openStream(
	input: GeneralParserInput,
	token: string | undefined,
	signal: AbortSignal | undefined,
): Promise<unknown> {
	const form = new FormData()
	if ('url' in input) form.append('url', input.url)
	else form.append('file', input.file, input.file.name)

	try {
		return await handleApiCall(
			axios.post<ReadableStream<Uint8Array>>(
				getUrl(GENERAL_PARSER_PATH),
				form,
				{
					adapter: 'fetch',
					responseType: 'stream',
					headers: {
						Accept: 'application/x-ndjson',
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
					signal,
				},
			),
		)
	} catch (error) {
		if (isAbortError(error)) throw error
		const status = isAxiosError(error) ? error.response?.status : undefined
		if (status) throw new GeneralParserError('response', status, error)
		throw new GeneralParserError('connection', undefined, error)
	}
}

/** Reads the body line by line until the result; anything else is `stream`. */
async function readResult(
	body: unknown,
	onProgress: StreamOptions['onProgress'],
): Promise<GeneralParserResultEvent> {
	const stream = body as ReadableStream<Uint8Array> | null
	if (!stream?.getReader) throw new GeneralParserError('stream')

	const reader = stream.getReader()
	const decoder = new TextDecoder()
	const parser = createNdjsonParser()
	let result: GeneralParserResultEvent | null = null

	// progress goes out as it comes; the result is kept; an error line ends it
	const handle = (events: GeneralParserEvent[]) => {
		for (const event of events) {
			if (event.event === 'progress') onProgress?.(event)
			else if (event.event === 'result') result = event
			else throw new GeneralParserError('stream', undefined, event.message)
		}
	}

	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			handle(parser.push(decoder.decode(value, { stream: true })))
		}
		handle(parser.push(decoder.decode()))
		handle(parser.flush())
	} catch (error) {
		// stop downloading the rest of a body that is no use any more
		reader.cancel().catch(() => {})
		throw error
	} finally {
		reader.releaseLock()
	}
	const final = result as GeneralParserResultEvent | null
	if (!final) throw new GeneralParserError('stream')
	return final
}

export function isAbortError(error: unknown): boolean {
	return (
		isCancel(error) ||
		(typeof error === 'object' &&
			error !== null &&
			(error as { name?: unknown }).name === 'AbortError')
	)
}
