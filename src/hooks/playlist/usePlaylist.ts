import { VariantPackGuid } from '@/api/dtos'
import { ReorderPlaylistItem } from '@/api/generated'
import { EditPlaylistItemData } from '@/hooks/playlist/usePlaylistsGeneral.types'
import { useUniqueHookId } from '@/hooks/useUniqueHookId'
import { useApiState } from '@/tech/ApiState'
import { Chord } from '@pepavlin/sheet-api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { mapPlaylistItemOutDtoApiToPlaylistItemDto } from '../../api/dtos/playlist/playlist.map'
import PlaylistDto, {
	PlaylistGuid,
	PlaylistItemDto,
	PlaylistItemGuid,
} from '../../interfaces/playlist/playlist.types'
import useAuth from '../auth/useAuth'
import usePlaylistsGeneral from './usePlaylistsGeneral'

export const PLAYLIST_CHANGE_EVENT_NAME = 'playlist-change'
type PlaylistChangeEventData = {
	hookId: string
	playlistGuid: PlaylistGuid
}

export default function usePlaylist(
	guid: PlaylistGuid,
	after?: (data: PlaylistDto) => void,
	notFetch?: boolean
) {
	const uniqueHookId = useUniqueHookId()

	const {
		addVariantToPlaylist,
		addPacksToPlaylist,
		removeVariantFromPlaylist,
		getPlaylistByGuid,
		searchInPlaylistByGuid,
		renamePlaylist,
		reorderPlaylist,
		setKeyChordOfItem,
		...general
	} = usePlaylistsGeneral()

	const [playlist, setPlaylist] = useState<PlaylistDto>()
	const [items, setItems] = useState<PlaylistItemDto[]>([])
	const [searchedItems, setSearchedItems] = useState<PlaylistItemDto[]>([])

	// const [state] = useApiStateEffect(async () => getPlaylistByGuid(guid), [guid])
	const { fetchApiState, apiState: state } = useApiState<PlaylistDto>()

	useEffect(() => {
		if (notFetch) return
		if (guid && guid.length > 0) {
			fetchApiState(() => getPlaylistByGuid(guid), after)
		}
	}, [guid])

	const { isLoggedIn, user } = useAuth()

	useEffect(() => {
		if (state.data) {
			setPlaylist(state.data)
			setItems(state.data.items.sort((a, b) => a.order - b.order))
		}
	}, [state])

	// Event, connect more same hooks
	const changeCallback = useCallback(() => {
		const data: PlaylistChangeEventData = {
			hookId: uniqueHookId,
			playlistGuid: guid,
		}
		window.dispatchEvent(
			new CustomEvent(PLAYLIST_CHANGE_EVENT_NAME, {
				detail: data,
			})
		)
	}, [guid, uniqueHookId])

	useEffect(() => {
		window.addEventListener(PLAYLIST_CHANGE_EVENT_NAME, (e) => {
			const data = (e as CustomEvent).detail as PlaylistChangeEventData
			if (data.hookId !== uniqueHookId && data.playlistGuid === guid) {
				fetchApiState(() => getPlaylistByGuid(guid))
			}
		})
		return () => {
			window.removeEventListener(PLAYLIST_CHANGE_EVENT_NAME, () => {})
		}
	}, [guid, uniqueHookId])

	const search = useCallback(
		async (searchString: string) => {
			await searchInPlaylistByGuid(guid, searchString)
				.then((r) => {
					const items = r.items.map(mapPlaylistItemOutDtoApiToPlaylistItemDto)
					setSearchedItems(items)
					changeCallback()
					return items
				})
				.catch((e) => {
					console.error(e)
				})
		},
		[searchInPlaylistByGuid, guid, changeCallback]
	)

	const addVariant = async (
		packGuid: VariantPackGuid
	): Promise<PlaylistItemDto | false> => {
		try {
			const data = await addVariantToPlaylist(packGuid, guid).then(
				async (item) => {
					if (!item) return false
					setItems((items) => [...items, item])
					return item
				}
			)
			changeCallback()
			return data
		} catch (e) {
			console.log(e)
			return false
		}
	}

	const addPacks = async (packGuids: VariantPackGuid[]) => {
		const newItems: PlaylistItemDto[] = await addPacksToPlaylist(
			packGuids,
			guid
		)

		// Add new items to the list

		setItems((items) => [...items, ...newItems])
		changeCallback()
	}

	const removeVariant = async (packGuid: VariantPackGuid): Promise<boolean> => {
		const r = await removeVariantFromPlaylist(packGuid, guid)

		setItems((items) => items.filter((i) => i.pack.packGuid !== packGuid))

		changeCallback()
		return r
	}

	const removePacks = async (packGuids: VariantPackGuid[]) => {
		const newItems: VariantPackGuid[] = []
		for (const packGuid of packGuids) {
			try {
				const data = await removeVariantFromPlaylist(packGuid, guid)
				if (data) newItems.push(packGuid)
			} catch (e) {
				return false
			}
		}

		// Remove items from the list
		setItems((items) =>
			items.filter((i) => !newItems.includes(i.pack.packGuid))
		)
		changeCallback()
	}

	const rename = (title: string) => {
		return renamePlaylist(guid, title).then((r) => {
			if (r) {
				setPlaylist({
					...playlist!,
					title: title,
				})
			}
			changeCallback()
		})
	}

	const reorder = async (reorderItems: ReorderPlaylistItem[]) => {
		const r = await reorderPlaylist(guid, reorderItems)

		setItems(
			items.map((item) => {
				const newItem = reorderItems.find((i) => i.guid === item.guid)
				if (newItem) {
					return {
						...item,
						order: newItem.order,
					}
				}
				return item
			})
		)
		changeCallback()

		return r
	}

	const setItemsKeyChord = (item: PlaylistItemDto, keyChord: Chord) => {
		return setKeyChordOfItem(item.pack.packGuid, guid, keyChord)
	}

	const editItem = async (
		itemGuid: PlaylistItemGuid,
		data: EditPlaylistItemData
	) => {
		const item = items.find((i) => i.guid === itemGuid)
		if (!item) return
		await general.editPlaylistItem(itemGuid, data)

		if (data.sheetData) {
			item.pack.sheetData = data.sheetData
			// item.pack.sheet = new Sheet(data.sheetData)
			//TODO: do in some better way
		}
		if (data.title) item.pack.title = data.title

		setItems((items) => {
			const newItems: PlaylistItemDto[] = [...items]
			const index = newItems.findIndex((i) => i.guid === itemGuid)
			newItems[index] = item
			return newItems
		})
		changeCallback()
	}

	const isOwner = useMemo(() => {
		if (!playlist) return false
		if (!isLoggedIn()) return false
		return playlist.ownerGuid === user?.guid
	}, [user, isLoggedIn, playlist])

	return {
		addVariant,
		addPacks,
		removeVariant,
		removePacks,
		rename,
		playlist,
		items,
		searchedItems,
		search,
		guid,
		title: playlist?.title,
		reorder,
		loading: state.loading,
		setItemsKeyChord,
		isOwner,
		editItem,
		requireItemEdit: general.requireItemEdit,
		_uniqueHookId: uniqueHookId,

		_setItems: setItems,
	}
}
