'use client'

import {
	GENERAL_PARSER_MAX_FILE_BYTES,
	GeneralParserEvent,
	GeneralParserHttpError,
	GeneralParserInput,
	GeneralParserResultEvent,
	GeneralParserStep,
	isAbortError,
	streamGeneralParse,
} from '@/api/general-parser/generalParser'
import { useBlockAppReload } from '@/app/components/appReloadGuard'
import useAuth from '@/hooks/auth/useAuth'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	ImportSource,
	saveImportResult,
	StoredImportResult,
} from '../tech/importStorage'
import { addSeenStep } from '../tech/steps'

/** Why there are no songs to show. Each one has its own text and actions. */
export type ImportProblem =
	| 'notFound'
	| 'unavailable'
	| 'failed'
	| 'badInput'
	| 'tooLarge'
	| 'service'
	| 'stream'
	| 'login'

export type ImportState =
	| { phase: 'idle' }
	| { phase: 'running'; source: ImportSource; seen: GeneralParserStep[] }
	| { phase: 'done'; result: StoredImportResult }
	| {
			phase: 'problem'
			source: ImportSource
			problem: ImportProblem
			/** Steps the parser reported before it stopped; the next one failed. */
			seen: GeneralParserStep[]
	  }

/** Accepts a pasted "zpevnik.cz/…" as well as a full https:// link. */
export function normaliseUrl(value: string): string {
	const trimmed = value.trim()
	if (!trimmed) return ''
	return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function problemForResult(
	event: GeneralParserResultEvent,
): ImportProblem | null {
	switch (event.status) {
		case 'done':
			return event.songs.length > 0 ? null : 'notFound'
		case 'not-found':
			return 'notFound'
		case 'unavailable':
			return 'unavailable'
		default:
			return 'failed'
	}
}

function problemForHttp(status: number, source: ImportSource): ImportProblem {
	if (status === 400) return source.kind === 'link' ? 'badInput' : 'failed'
	if (status === 401) return 'login'
	if (status === 413) return 'tooLarge'
	// 403 (flag off), 502, 503 and anything else: nothing the user can fix
	return 'service'
}

const newId = () =>
	`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

/**
 * The import flow's state machine: idle → running (step by step, from the
 * parser's progress lines) → done with songs, or a problem. One request at a
 * time; starting another, cancelling or leaving the screen aborts the current one.
 */
export function useSongImport(initial: ImportState = { phase: 'idle' }) {
	const { user } = useAuth()
	const [state, setState] = useState<ImportState>(initial)
	const abortRef = useRef<AbortController | null>(null)
	const lastInputRef = useRef<{
		input: GeneralParserInput
		source: ImportSource
	} | null>(null)

	// a reload mid-parse loses the request — the result only arrives on the stream
	useBlockAppReload(state.phase === 'running', 'importing a song')

	useEffect(() => () => abortRef.current?.abort(), [])

	const run = useCallback(
		async (input: GeneralParserInput, source: ImportSource) => {
			abortRef.current?.abort()
			lastInputRef.current = { input, source }

			if (!user?.token) {
				setState({ phase: 'problem', source, problem: 'login', seen: [] })
				return
			}
			if ('file' in input && input.file.size > GENERAL_PARSER_MAX_FILE_BYTES) {
				setState({ phase: 'problem', source, problem: 'tooLarge', seen: [] })
				return
			}

			const controller = new AbortController()
			abortRef.current = controller
			setState({ phase: 'running', source, seen: [] })

			let outcome: GeneralParserEvent | null = null
			// kept here as well as in state: a problem carries where it stopped
			let seen: GeneralParserStep[] = []
			const onEvent = (event: GeneralParserEvent) => {
				if (controller.signal.aborted) return
				if (event.event === 'progress') {
					seen = addSeenStep(seen, event.step)
					const next = seen
					setState((s) => (s.phase === 'running' ? { ...s, seen: next } : s))
				} else {
					outcome = event
				}
			}

			let problem: ImportProblem | null = null
			try {
				await streamGeneralParse(input, {
					token: user.token,
					signal: controller.signal,
					onEvent,
				})
			} catch (error) {
				if (isAbortError(error) || controller.signal.aborted) return
				problem =
					error instanceof GeneralParserHttpError
						? problemForHttp(error.status, source)
						: 'service' // network failure: fetch rejects with a TypeError
			}
			if (controller.signal.aborted) return
			abortRef.current = null

			const final = outcome as GeneralParserEvent | null
			if (!problem && final?.event === 'result') {
				problem = problemForResult(final)
				if (!problem) {
					const result: StoredImportResult = {
						id: newId(),
						source,
						songs: final.songs,
					}
					saveImportResult(result)
					setState({ phase: 'done', result })
					return
				}
			}
			// an `error` line, or a stream that ended without a result
			setState({ phase: 'problem', source, problem: problem ?? 'stream', seen })
		},
		[user?.token],
	)

	const importUrl = useCallback(
		(value: string) => {
			const url = normaliseUrl(value)
			if (url) run({ url }, { kind: 'link', label: url })
		},
		[run],
	)

	const importFile = useCallback(
		(file: File) => run({ file }, { kind: 'file', label: file.name }),
		[run],
	)

	const retry = useCallback(() => {
		const last = lastInputRef.current
		if (last) run(last.input, last.source)
	}, [run])

	/** Stops whatever is running and goes back to the empty form. */
	const reset = useCallback(() => {
		abortRef.current?.abort()
		abortRef.current = null
		saveImportResult(null)
		setState({ phase: 'idle' })
	}, [])

	return { state, setState, importUrl, importFile, retry, reset }
}
