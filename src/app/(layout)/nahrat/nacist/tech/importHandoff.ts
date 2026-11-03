'use client'

/**
 * How the import screen was asked for, carried across the navigation from the
 * create menu.
 *
 * A picked File cannot travel in a URL, and it should not: it lives exactly as
 * long as the navigation does. So it waits here, in module state, and the
 * import screen takes it on arrival. A reload or a shared link starts a fresh
 * module and finds nothing — the screen then simply opens empty.
 */
export type ImportIntent = { kind: 'file'; file: File } | { kind: 'link' }

let pending: ImportIntent | null = null

/** Called by the create menu right before it navigates to the import screen. */
export function handOffImport(intent: ImportIntent) {
	pending = intent
}

/** Read once by the import screen when it mounts; null for every other arrival. */
export function consumeImportIntent(): ImportIntent | null {
	const intent = pending
	pending = null
	return intent
}
