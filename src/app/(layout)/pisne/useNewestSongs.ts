'use client'

import { BasicVariantPack, mapBasicVariantPackApiToDto } from '@/api/dtos'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { useApiStateEffect } from '@/tech/ApiState'

/**
 * The songs added most recently.
 *
 * Its own endpoint rather than the list with an order parameter, because the
 * list has none: `/song/list` takes a page and a size and nothing else. So this
 * is the whole of "newest" the backend can answer — one batch, not a paged
 * songbook in date order — and the screen says as much when it shows it.
 *
 * Fetches only when asked for, so browsing alphabetically costs no request.
 */
export function useNewestSongs(enabled: boolean) {
	const { songGettingApi } = useApi()

	const [state] = useApiStateEffect<BasicVariantPack[]>(async () => {
		if (!enabled) return []
		const result = await songGettingApi.getLastAdded()
		return result.map((v) => mapBasicVariantPackApiToDto(v))
	}, [enabled])

	return {
		songs: state.data ?? [],
		loading: Boolean(enabled && state.loading),
		error: Boolean(state.error),
	}
}
