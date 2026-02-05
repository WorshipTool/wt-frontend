import { useApi } from '@/api/tech-and-hooks/useApi'
import { SongGuid } from '@/types/song'
import { useCallback, useEffect, useState } from 'react'

type SongFamilyInfo = {
	familyName: string
	translationCount: number
}

const cache = new Map<SongGuid, SongFamilyInfo>()

/**
 * Hook to fetch and cache song family information (family name and translation count)
 */
export function useSongFamilyInfo(songGuid: SongGuid | null) {
	const [familyInfo, setFamilyInfo] = useState<SongFamilyInfo | null>(null)
	const [loading, setLoading] = useState(false)
	const { songGettingApi } = useApi()

	const fetchFamilyInfo = useCallback(async () => {
		if (!songGuid) return

		// Check cache first
		if (cache.has(songGuid)) {
			setFamilyInfo(cache.get(songGuid)!)
			return
		}

		setLoading(true)
		try {
			const data = await songGettingApi.getSongDataByGuid(songGuid as string)

			const info: SongFamilyInfo = {
				familyName: data.title,
				translationCount: data.packs?.length || 0,
			}

			cache.set(songGuid, info)
			setFamilyInfo(info)
		} catch (error) {
			console.error('Failed to fetch song family info:', error)
		} finally {
			setLoading(false)
		}
	}, [songGuid, songGettingApi])

	useEffect(() => {
		fetchFamilyInfo()
	}, [fetchFamilyInfo])

	return { familyInfo, loading }
}
