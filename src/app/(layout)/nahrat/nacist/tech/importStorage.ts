'use client'

import { GeneralParserSong } from '@/api/general-parser/generalParser'

/**
 * Session storage for the import flow, so a parse that took a minute survives
 * a reload, Back, or a phone killing the tab. One stored import moves through
 * two stages:
 *
 *   results — the found songs; the import screen shows them again on return
 *   chosen  — "Pokračovat" picked one: it replaces the list (the choice is
 *             final) and the editor opens it, on every arrival and reload
 *
 * and is cleared when the song is saved in the editor, or when the user starts
 * over with "Zkusit jiný odkaz nebo soubor".
 *
 * Every access is wrapped: storage throws in private modes and when it is full,
 * and the flow must still work without it — it just forgets.
 */

const KEY = 'wt.import'

export type ImportSourceKind = 'link' | 'file'

export type ImportSource = {
	kind: ImportSourceKind
	/** The URL, or the file's name — what the user recognises it by. */
	label: string
}

export type StoredImportResult = {
	id: string
	source: ImportSource
	songs: GeneralParserSong[]
}

/** The one song handed to the editor. */
export type EditorHandoff = {
	title: string
	sheetData: string
	sourceKind: ImportSourceKind
}

type StoredImport =
	| { stage: 'results'; result: StoredImportResult }
	| { stage: 'chosen'; song: EditorHandoff }

function load(): StoredImport | null {
	try {
		const raw = window.sessionStorage.getItem(KEY)
		return raw ? (JSON.parse(raw) as StoredImport) : null
	} catch {
		return null
	}
}

function store(value: StoredImport | null) {
	try {
		if (value === null) window.sessionStorage.removeItem(KEY)
		else window.sessionStorage.setItem(KEY, JSON.stringify(value))
	} catch {
		// storage unavailable or full: the flow keeps working, it only forgets
	}
}

/** The found songs, while none has been chosen yet. */
export function loadImportResult(): StoredImportResult | null {
	const stored = load()
	return stored?.stage === 'results' ? stored.result : null
}

export const saveImportResult = (result: StoredImportResult) =>
	store({ stage: 'results', result })

/** "Pokračovat": the chosen song replaces the list, for the editor to open. */
export const chooseImportedSong = (song: EditorHandoff) =>
	store({ stage: 'chosen', song })

/** The chosen song, read by the editor. Reading leaves it in place. */
export function loadChosenSong(): EditorHandoff | null {
	const stored = load()
	return stored?.stage === 'chosen' ? stored.song : null
}

/** The song was saved, or the user started over: nothing to come back to. */
export const clearImport = () => store(null)
