'use client'
import { PackGuid } from '@/api/dtos'
import { PlaylistComplextEditItem } from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import useCurrentPlaylist from '@/hooks/playlist/useCurrentPlaylist'
import usePlaylist, {
	PLAYLIST_CHANGE_EVENT_NAME,
} from '@/hooks/playlist/usePlaylist'
import { EditPlaylistItemData } from '@/hooks/playlist/usePlaylistsGeneral.types'
import { useStateWithHistory } from '@/hooks/statewithhistory/useStateWithHistory'
import { useUniqueHookId } from '@/hooks/useUniqueHookId'
import {
	PlaylistGuid,
	PlaylistItemDto,
	PlaylistItemGuid,
} from '@/interfaces/playlist/playlist.types'
import { BasicVariantPack } from '@/types/song'
import { Chord } from '@pepavlin/sheet-api'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { v4 } from 'uuid'

type Rt = ReturnType<typeof useProvideInnerPlaylist>
export const innerPlaylistContext = createContext<Rt>({} as Rt)

export default function useInnerPlaylist() {
	return useContext(innerPlaylistContext)
}

export const InnerPlaylistProvider = ({
	children,
	guid,
}: {
	children: any
	guid: PlaylistGuid
}) => {
	const p = useProvideInnerPlaylist(guid)

	return (
		<innerPlaylistContext.Provider value={p}>
			{children}
		</innerPlaylistContext.Provider>
	)
}

type PlaylistHistoryStateType = {
	title: string
	items: PlaylistItemDto[]
}

const useProvideInnerPlaylist = (guid: PlaylistGuid) => {
	const [isSaved, setIsSaved] = useState<boolean>(true)
	const [isSaving, setIsSaving] = useState<boolean>(false)

	const uniqueHookId = useUniqueHookId()
	const {
		state,
		setState,
		reset,
		undo: _undo,
		redo: _redo,
		hasRedo,
		hasUndo,
	} = useStateWithHistory<PlaylistHistoryStateType>({
		title: '',
		items: [],
	})

	const current = useCurrentPlaylist()
	const isCurrent = useMemo(
		() => current.guid === guid && Boolean(guid),
		[current.guid, guid]
	)
	const _playlist = usePlaylist(guid, undefined, isCurrent)
	const playlist = isCurrent ? current : _playlist

	const hasInitializedRef = useRef(false)

	const editingApi = useApi('playlistEditingApi')
	const packGettingApi = useApi('songGettingApi')

	useEffect(() => {
		if (playlist.playlist && !playlist.loading) {
			// Only initialize or update when the playlist GUID changes
			const newTitle = playlist.title || ''
			const newItems = [...playlist.items].sort((a, b) => a.order - b.order)
			setState({
				title: newTitle,
				items: newItems,
			})

			if (!hasInitializedRef.current) {
				reset()
				hasInitializedRef.current = true
			}
		}
	}, [
		playlist.playlist,
		playlist.loading,
		playlist.title,
		playlist.items,
		setState,
		reset,
		guid,
	])

	const canUserEdit = useMemo(() => playlist.isOwner, [playlist.isOwner])

	const title = useMemo(() => state.title, [state.title])
	const items = useMemo(() => state.items || [], [state.items])
	const loading = useMemo(() => playlist.loading, [playlist.loading])

	const _change = useCallback(
		(data: Partial<PlaylistHistoryStateType>) => {
			if (!canUserEdit) return
			setState(
				(prev) =>
					({
						...prev,
						...data,
					} as PlaylistHistoryStateType)
			)

			setIsSaved(false)
		},
		[setState, canUserEdit]
	)

	const redo = useCallback(() => {
		_redo()
		setIsSaved(false)
	}, [_redo])

	const undo = useCallback(() => {
		_undo()
		setIsSaved(false)
	}, [_undo])

	const save = async () => {
		if (!canUserEdit) return

		setIsSaving(true)

		// sheetdata or title change only for changed items
		const changedItems = state.items.filter((i) => {
			const oldItem = playlist.items.find((j) => j.guid === i.guid)
			return (
				oldItem?.pack.title !== i.pack.title ||
				oldItem?.pack.sheetData !== i.pack.sheetData
			)
		})
		// Use complex edit for everything - items in order with all their changes
		const complexEditItems: PlaylistComplextEditItem[] = state.items.map(
			(item) => ({
				packGuid: item.pack.packGuid,
				toneKey: item.toneKey,
				newData: changedItems.some(
					(changedItem) => changedItem.pack.packGuid === item.pack.packGuid
				)
					? {
							title: item.pack.title,
							sheetData: item.pack.sheetData,
					  }
					: {},
			})
		)
		await editingApi.complexPlaylistEdit({
			playlistGuid: guid,
			items: complexEditItems,
			name: state.title,
		})

		setIsSaved(true)

		const data = {
			hookId: uniqueHookId,
			playlistGuid: guid,
		}
		window.dispatchEvent(
			new CustomEvent(PLAYLIST_CHANGE_EVENT_NAME, {
				detail: data,
			})
		)

		setIsSaving(false)
	}

	// Shortcuts
	useEffect(() => {
		// Add CTRL+Z and CTRL+Y support for undo and redo
		const handleKeyDown = (event: KeyboardEvent) => {
			switch (event.key) {
				case 'z':
					if (event.ctrlKey || event.metaKey) {
						event.preventDefault()
						undo()
					}
					break
				case 'y':
					if (event.ctrlKey || event.metaKey) {
						if (event.shiftKey) {
							event.preventDefault()
							undo()
						} else {
							event.preventDefault()
							redo()
						}
					}
					break

				// Save with shortcut
				case 's':
					if (event.ctrlKey || event.metaKey) {
						event.preventDefault()
						save()
					}
					break
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [redo, undo])

	// Handle unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (!isSaved) {
				e.preventDefault()
				e.returnValue = ''
			}
		}

		window.addEventListener('beforeunload', handleBeforeUnload)

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload)
		}
	}, [isSaved])

	// Handle ctrl-s
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault()
				save()
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	const rename = useCallback(
		(title: string) => {
			_change({ title })
		},
		[_change]
	)

	const setItems = useCallback(
		(items: PlaylistItemDto[]) => {
			_change({ items: [...items] })
		},
		[_change]
	)

	const setItemKeyChord = (itemGuid: PlaylistItemGuid, keyChord: Chord) => {
		const toneKey = keyChord.data.rootNote.toString()
		const newItems: PlaylistItemDto[] = state.items.map((i) =>
			i.guid === itemGuid ? { ...i, toneKey } : i
		)

		setItems(newItems)
	}

	const removeItem = (itemGuid: PlaylistItemGuid) => {
		const newItems = state.items
			.filter((i) => i.guid !== itemGuid)
			.sort((a, b) => a.order - b.order)
			.map((i, index) => ({ ...i, order: index }))

		setItems(newItems)
	}

	const addItem = async (pack: BasicVariantPack) => {
		const item: PlaylistItemDto = {
			guid: v4() as PlaylistItemGuid,
			pack: pack,
			toneKey: 'C',
			order: state.items.length,
		}
		if (!item) return

		const newItems = [...state.items, item].sort((a, b) => a.order - b.order)
		setItems(newItems)
	}

	const addItemWithGuid = async (packGuid: PackGuid) => {
		const data = await packGettingApi.getBasicPackDataByPackGuid(packGuid)
		if (!data) return
		addItem(data)
	}

	const editItem = async (
		itemGuid: PlaylistItemGuid,
		data: EditPlaylistItemData
	) => {
		const item = state.items.find((i) => i.guid === itemGuid)
		if (!item) return

		const newItems = state.items.map((i) => {
			if (i.guid !== itemGuid) return i

			const newItem = { ...i }
			newItem.pack = { ...i.pack }
			if (data.title) newItem.pack.title = data.title
			if (data.sheetData) {
				newItem.pack.sheetData = data.sheetData
				// newItem.pack.sheet = new Sheet(data.sheetData)
			}

			return newItem
		})
		setItems(newItems)
	}

	return {
		items,
		title,
		loading,
		canUserEdit,
		guid,

		undo,
		hasUndo,
		redo,
		hasRedo,

		save,
		isSaved,
		isSaving,

		rename,
		setItems,
		setItemKeyChord,
		removeItem,
		addItem,
		addItemWithGuid,
		editItem,
		data: playlist.playlist,
	}
}
