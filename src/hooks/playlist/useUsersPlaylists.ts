import { PlaylistData } from '@/api/generated'
import useAuth from '@/hooks/auth/useAuth'
import usePlaylistsGeneral, {
	PLAYLIST_UPDATE_EVENT_NAME,
} from '@/hooks/playlist/usePlaylistsGeneral'
import { useApiState } from '@/tech/ApiState'
import { useEffect, useState } from 'react'

export function useUsersPlaylists() {
	// const initialValue = useCommonData('playlistsOfUser')
	const [data, setData] = useState<PlaylistData[]>([])

	const { getPlaylistsOfUser } = usePlaylistsGeneral()
	const { fetchApiState, apiState } = useApiState<PlaylistData[]>()
	const { user } = useAuth()

	/**
	 * Asking for "the playlists of the user" when there is no user answers 401,
	 * and a 401 anywhere in the app means the session expired: the global handler
	 * signs you out and sends you to the login page. A signed-out visitor has not
	 * expired — they never had a session — so the question is simply not asked.
	 */
	const revalidate = async () => {
		if (!user) {
			setData([])
			return
		}

		fetchApiState(async () => {
			const data = await getPlaylistsOfUser()
			return data.playlists
		})
			.then((r) => {
				if (r) setData(r)
			})
			.catch(() => {})
	}

	useEffect(() => {
		const handler = (e: Event) => {
			if (!data) return
			const event = e as CustomEvent

			const guid = event.detail as string
			if (!guid) return

			// if guid is in playlists, reload
			if (data?.some((p) => p.guid === guid)) {
				revalidate()
			}
		}

		window.addEventListener(PLAYLIST_UPDATE_EVENT_NAME, handler)

		return () => {
			window.removeEventListener(PLAYLIST_UPDATE_EVENT_NAME, handler)
		}
	}, [data, revalidate, getPlaylistsOfUser])

	useEffect(() => {
		revalidate()
	}, [user])

	return {
		playlists: data,
		loading: apiState.loading,
	}
}
