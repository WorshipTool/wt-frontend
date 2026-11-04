import { getUrl } from '@/api/urls'
import { serviceUnavailableEvent } from '@/tech/fetch/handleApiCall'

/**
 * Client for the backend's general parser: a link or a file in, songs out.
 *
 * Not in the generated client because the endpoint streams NDJSON — one JSON
 * object per line, progress first and the result last — which the generated
 * axios wrapper would buffer into one string at the end. So it is read here
 * with fetch and a stream reader, line by line, as it arrives.
 *
 *   POST {backend}/general-parser/parse   multipart: `url` OR `file` (≤ 40 MB)
 */

export const GENERAL_PARSER_PATH = '/general-parser/parse'

/** The backend refuses anything larger (413); checked before uploading. */
export const GENERAL_PARSER_MAX_FILE_BYTES = 40 * 1024 * 1024

/** What a file input offers, and what the parser reads. */
export const GENERAL_PARSER_ACCEPT = 'application/pdf,image/*'

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

/** A response that never became a stream: 400, 401, 403, 413, 502, 503 … */
export class GeneralParserHttpError extends Error {
	constructor(public readonly status: number) {
		super(`General parser responded ${status}`)
		this.name = 'GeneralParserHttpError'
	}
}

function isEvent(value: unknown): value is GeneralParserEvent {
	if (!value || typeof value !== 'object') return false
	const e = (value as { event?: unknown }).event
	return e === 'progress' || e === 'result' || e === 'error'
}

/**
 * Turns a stream of text chunks into events. A chunk can end in the middle of a
 * line, hold several lines, or both; the unfinished tail waits for the next
 * chunk, and `flush()` reads whatever is left when the stream ends without a
 * final newline. Lines that are blank, not JSON or not an event are skipped —
 * one bad line must not throw away the result after it.
 */
export function createNdjsonParser() {
	let buffer = ''

	const parseLine = (line: string): GeneralParserEvent | null => {
		const trimmed = line.trim()
		if (!trimmed) return null
		try {
			const value: unknown = JSON.parse(trimmed)
			return isEvent(value) ? value : null
		} catch {
			return null
		}
	}

	const push = (chunk: string): GeneralParserEvent[] => {
		buffer += chunk
		const lines = buffer.split('\n')
		buffer = lines.pop() ?? ''
		return lines
			.map(parseLine)
			.filter((e): e is GeneralParserEvent => e !== null)
	}

	const flush = (): GeneralParserEvent[] => {
		const rest = parseLine(buffer)
		buffer = ''
		return rest ? [rest] : []
	}

	return { push, flush }
}

type StreamOptions = {
	/** The signed-in user's token; the endpoint is for signed-in users only. */
	token?: string
	signal?: AbortSignal
	onEvent: (event: GeneralParserEvent) => void
}

/**
 * Sends the link or file and calls `onEvent` for every line as it arrives.
 *
 * Resolves when the stream ends. Rejects with `GeneralParserHttpError` for a
 * non-2xx response, with an `AbortError` when `signal` aborts, and with a plain
 * `TypeError` when the network fails.
 */
export async function streamGeneralParse(
	input: GeneralParserInput,
	{ token, signal, onEvent }: StreamOptions,
): Promise<void> {
	const form = new FormData()
	if ('url' in input) form.append('url', input.url)
	else form.append('file', input.file, input.file.name)

	const response = await fetch(getUrl(GENERAL_PARSER_PATH), {
		method: 'POST',
		body: form,
		headers: {
			Accept: 'application/x-ndjson',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		signal,
	})

	if (!response.ok) {
		// The same app-wide "Služba je dočasně nedostupná" snackbar every other API
		// call shows through handleApiCall (this one is plain fetch, so say it here)
		if (response.status === 503 && typeof window !== 'undefined')
			window.dispatchEvent(new CustomEvent(serviceUnavailableEvent))
		throw new GeneralParserHttpError(response.status)
	}
	if (!response.body) throw new GeneralParserHttpError(502)

	const reader = response.body.getReader()
	const decoder = new TextDecoder()
	const parser = createNdjsonParser()

	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			parser.push(decoder.decode(value, { stream: true })).forEach(onEvent)
		}
		parser.push(decoder.decode()).forEach(onEvent)
		parser.flush().forEach(onEvent)
	} finally {
		reader.releaseLock()
	}
}

export function isAbortError(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		(error as { name?: unknown }).name === 'AbortError'
	)
}
