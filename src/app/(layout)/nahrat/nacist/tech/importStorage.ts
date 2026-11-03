'use client'

import { GeneralParserSong } from '@/api/general-parser/generalParser'

/**
 * Session storage for the import flow: the last result list (so coming back from
 * the editor shows it again) and the one song handed to the editor.
 *
 * Every access is wrapped: storage throws in private modes and when it is full,
 * and the flow must still work without it — it just forgets.
 */

const RESULT_KEY = 'wt.import.result'
const EDITOR_KEY = 'wt.import.editorHandoff'

export type ImportSourceKind = 'link' | 'file'

export type ImportSource = {
	kind: ImportSourceKind
	/** The URL, or the file's name — what the user recognises it by. */
	label: string
}

export type SavedSong = { hex: string; alias: string }

export type StoredImportResult = {
	id: string
	source: ImportSource
	songs: GeneralParserSong[]
	/** Songs already saved from this result, by index. */
	saved: Record<number, SavedSong>
}

export type EditorHandoff = {
	title: string
	sheetData: string
	sourceKind: ImportSourceKind
	/** Which result card it came from, so a save can mark it. */
	origin: { resultId: string; index: number }
}

function read<T>(key: string): T | null {
	try {
		const raw = window.sessionStorage.getItem(key)
		return raw ? (JSON.parse(raw) as T) : null
	} catch {
		return null
	}
}

function write(key: string, value: unknown) {
	try {
		if (value === null) window.sessionStorage.removeItem(key)
		else window.sessionStorage.setItem(key, JSON.stringify(value))
	} catch {
		// storage unavailable or full: the flow keeps working, it only forgets
	}
}

export const loadImportResult = () => read<StoredImportResult>(RESULT_KEY)

export const saveImportResult = (result: StoredImportResult | null) =>
	write(RESULT_KEY, result)

export function markImportedSongSaved(
	resultId: string,
	index: number,
	song: SavedSong
) {
	const result = loadImportResult()
	if (!result || result.id !== resultId) return
	saveImportResult({ ...result, saved: { ...result.saved, [index]: song } })
}

export const handOffToEditor = (handoff: EditorHandoff) =>
	write(EDITOR_KEY, handoff)

/**
 * Read once by the editor. Taking it out on read means opening "Napsat ručně"
 * any other way later starts from a blank sheet, not from a stale import.
 */
export function consumeEditorHandoff(): EditorHandoff | null {
	const handoff = read<EditorHandoff>(EDITOR_KEY)
	if (handoff) write(EDITOR_KEY, null)
	return handoff
}
