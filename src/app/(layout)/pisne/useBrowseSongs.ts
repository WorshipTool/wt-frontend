'use client'

import { GetListSongData } from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { useCallback, useEffect, useState } from 'react'

/**
 * One page of the songbook, read in the list's own order.
 *
 * The page number is the one in the URL — 1-indexed, because that is what a
 * paginator shows — while `/song/list` counts from zero, so the offset is made
 * here and nowhere else. Both widths share this: the phone and the desktop used
 * to run their own copy of the same fetch.
 *
 * `enabled` is false whenever something else owns the screen (a search, the
 * recently-added batch), so those states cost no request.
 */
export function useBrowseSongs(page: number, perPage: number, enabled: boolean) {
	const { songGettingApi } = useApi()

	const [items, setItems] = useState<GetListSongData[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)
	const [reloadKey, setReloadKey] = useState(0)

	const reload = useCallback(() => setReloadKey((k) => k + 1), [])

	useEffect(() => {
		if (!enabled) return
		let active = true
		setLoading(true)
		setError(false)
		songGettingApi
			.getList(page - 1, perPage)
			.then((data) => {
				if (active) setItems(data)
			})
			.catch(() => {
				if (!active) return
				setItems([])
				setError(true)
			})
			.finally(() => {
				if (active) setLoading(false)
			})
		return () => {
			active = false
		}
	}, [page, perPage, songGettingApi, reloadKey, enabled])

	return { items, loading, error, reload }
}
