import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import { SearchKey } from '@/types/song/search.types'
import { useCallback } from 'react'
import { useApi } from '../../api/tech-and-hooks/useApi'
import useAuth from '../auth/useAuth'

type useSongSearchProps = {
	page?: number
	signal?: AbortSignal
	useSmartSearch?: boolean
}

type GetSongFunction = (
	searchKey: SearchKey,
	additionalParams?: useSongSearchProps
) => Promise<SearchSongDto[]>

export default function useSongSearch() {
	const { songGettingApi, packEmbeddingApi, songSearchingApi } = useApi()
	const { user } = useAuth()

	const getSongs: GetSongFunction = useCallback(
		async (
			searchKey: SearchKey,
			additionalParams?: useSongSearchProps
		): Promise<SearchSongDto[]> => {
			try {
				// Handle smart search
				if (additionalParams?.useSmartSearch) {
					return packEmbeddingApi.search(
						searchKey,
						additionalParams?.page || 0,
						{
							signal: additionalParams.signal,
						}
					)
				}

				const result = await songSearchingApi.search(
					searchKey,
					additionalParams?.page || 0,
					undefined,
					{
						signal: additionalParams?.signal,
					}
				)

				return result
			} catch (e) {
				console.log(e)
			}

			return []
		},
		[songGettingApi, user, packEmbeddingApi]
	)

	return getSongs
}
