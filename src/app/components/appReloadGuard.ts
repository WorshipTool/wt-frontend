'use client'

import { useEffect } from 'react'

/**
 * Registry of screens that currently hold work a reload would destroy.
 *
 * `AppUpdater` reloads the page when a newer build ships. Some screens keep
 * user work in local state that is only persisted on an explicit action (a song
 * being written, a playlist being reordered, an upload being parsed) — reloading
 * those silently throws the work away.
 *
 * Rather than `AppUpdater` keeping a hardcoded list of such routes (which goes
 * stale the moment a screen is added or moved), each screen declares the fact
 * itself with `useBlockAppReload`. The update is applied as soon as the last
 * blocker clears — typically when the user saves or navigates away.
 *
 * A module-level registry rather than a context, so a screen can declare this
 * from anywhere in the tree without a provider having to sit above it.
 */

const blockers = new Map<number, string>()
const listeners = new Set<() => void>()
let nextId = 0

function notify() {
	listeners.forEach((listener) => listener())
}

/** True while any mounted screen has declared unsaved work. */
export function isAppReloadBlocked(): boolean {
	return blockers.size > 0
}

/** The reasons currently blocking a reload (for logging / debugging). */
export function appReloadBlockReasons(): string[] {
	return Array.from(blockers.values())
}

/** Subscribe to blockers being added or removed. Returns an unsubscribe fn. */
export function subscribeAppReloadBlocked(listener: () => void): () => void {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}

/**
 * Declare that this screen holds work a reload would destroy.
 *
 * @param active whether the work exists right now (e.g. `sheetData !== ''`)
 * @param reason short description, surfaced only in debugging
 */
export function useBlockAppReload(active: boolean, reason: string) {
	useEffect(() => {
		if (!active) return
		const id = nextId++
		blockers.set(id, reason)
		notify()
		return () => {
			blockers.delete(id)
			notify()
		}
	}, [active, reason])
}
