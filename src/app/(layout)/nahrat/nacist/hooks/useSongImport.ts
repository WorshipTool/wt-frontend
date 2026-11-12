'use client'

import {
	GeneralParserError,
	GeneralParserInput,
	GeneralParserResultEvent,
	GeneralParserStep,
	isAbortError,
	streamGeneralParse,
} from '@/api/general-parser/generalParser'
import { useBlockAppReload } from '@/app/components/appReloadGuard'
import useAuth from '@/hooks/auth/useAuth'
import { useCallback, useEffect, useRef, useState } from 'react'
import { checkImportFile, FileProblem } from '../tech/importFile'
import {
	clearImport,
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
	| 'service'
	| 'stream'
	| 'login'
	| FileProblem

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

/** Where the request failed → what the user is told. The one place errors are read. */
export function problemForError(
	error: unknown,
	source: ImportSource,
): ImportProblem {
	// the client turns every failure into a GeneralParserError; anything else
	// broke while handling the stream, and the user can only try again
	if (!(error instanceof GeneralParserError)) return 'stream'
	switch (error.kind) {
		case 'response':
			if (error.status === 400)
				return source.kind === 'link' ? 'badInput' : 'failed'
			if (error.status === 401) return 'login'
			if (error.status === 413) return 'tooLarge'
			// 403 (flag off), 502, 503 and anything else: nothing the user can fix
			return 'service'
		case 'connection':
			return 'service'
		case 'stream':
			return 'stream'
	}
}

const newId = () =>
	`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

/**
 * The import flow's state machine: idle → running (step by step, from the
 * parser's progress lines) → done with songs, or a problem. One request at a
 * time; starting another, cancelling or leaving the screen aborts the current one.
 *
 * `run` is the one way in: it checks the file (`checkImportFile`) before
 * anything is sent, and every failure after that goes through
 * `problemForError`.
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

			const stopBefore = (problem: ImportProblem) =>
				setState({ phase: 'problem', source, problem, seen: [] })
			const token = user?.token
			if (!token) return stopBefore('login')
			const fileProblem = 'file' in input ? checkImportFile(input.file) : null
			if (fileProblem) return stopBefore(fileProblem)

			const controller = new AbortController()
			abortRef.current = controller
			setState({ phase: 'running', source, seen: [] })

			// kept here as well as in state: a problem carries where it stopped
			let seen: GeneralParserStep[] = []
			const finish = (next: ImportState) => {
				if (controller.signal.aborted) return
				abortRef.current = null
				setState(next)
			}

			// Everything that can go wrong ends in the one catch below, so a
			// failure always becomes a problem on screen — never a spinner left
			// running by an unhandled rejection.
			try {
				const result = await streamGeneralParse(input, {
					token,
					signal: controller.signal,
					onProgress: (event) => {
						if (controller.signal.aborted) return
						seen = addSeenStep(seen, event.step)
						const next = seen
						setState((s) => (s.phase === 'running' ? { ...s, seen: next } : s))
					},
				})
				if (controller.signal.aborted) return
				const problem = problemForResult(result)
				if (problem) return finish({ phase: 'problem', source, problem, seen })
				const stored: StoredImportResult = {
					id: newId(),
					source,
					songs: result.songs,
				}
				saveImportResult(stored)
				finish({ phase: 'done', result: stored })
			} catch (error) {
				if (isAbortError(error)) return
				finish({
					phase: 'problem',
					source,
					problem: problemForError(error, source),
					seen,
				})
			}
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
		(file: File) => {
			run({ file }, { kind: 'file', label: file.name })
		},
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
		clearImport()
		setState({ phase: 'idle' })
	}, [])

	return { state, setState, importUrl, importFile, retry, reset }
}
