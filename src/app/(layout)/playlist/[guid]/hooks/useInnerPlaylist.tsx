'use client'
import { PackGuid } from '@/api/dtos'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { buildComplexEditItems } from './buildComplexEditItems'
import useCurrentPlaylist from '@/hooks/playlist/useCurrentPlaylist'
import usePlaylist from '@/hooks/playlist/usePlaylist'
import { dispatchPlaylistChange } from '@/hooks/playlist/usePlaylistChangeSubscription'
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

/** How long the transposition waits for the next tap before it writes. */
const KEY_WRITE_DELAY = 800

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

	// see `setItemKeyChordAndSave`
	const keyWriteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const pendingItemsRef = useRef<PlaylistItemDto[]>([])
	const titleRef = useRef('')
	useEffect(() => {
		pendingItemsRef.current = state.items
		titleRef.current = state.title
	}, [state.items, state.title])
	useEffect(
		() => () => {
			if (keyWriteTimer.current) clearTimeout(keyWriteTimer.current)
		},
		[]
	)

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

	/**
	 * Writes the playlist to the server.
	 *
	 * Takes what to write rather than reading it out of `state`, because every
	 * caller that changes something and saves in the same breath would otherwise
	 * send the state of the render it was created in — the one before the change.
	 */
	const _persist = async (name: string, items: PlaylistItemDto[]) => {
		if (!canUserEdit) return

		setIsSaving(true)

		// Only genuinely changed items carry newData; unchanged items omit it so
		// the backend skips the heavy per-song copy/version path.
		const complexEditItems = buildComplexEditItems(items, playlist.items)

		await editingApi.complexPlaylistEdit({
			playlistGuid: guid,
			items: complexEditItems,
			name,
		})

		setIsSaved(true)

		dispatchPlaylistChange(uniqueHookId, guid)

		setIsSaving(false)
	}

	const save = async () => _persist(state.title, state.items)

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

	/**
	 * Renames and commits in one call.
	 *
	 * The desktop types the name into the header and presses Save afterwards, so
	 * `rename` alone is enough there. The phone renames in a dialog that closes on
	 * submit, with no Save left to press — and `save` would read the title out of
	 * the render it was created in, which at that moment still holds the old one.
	 * So the new name travels with the call instead of being looked up.
	 */
	const renameAndSave = async (nextTitle: string) => {
		rename(nextTitle)
		await _persist(nextTitle, state.items)
	}

	const setItems = useCallback(
		(items: PlaylistItemDto[]) => {
			_change({ items: [...items] })
		},
		[_change]
	)

	const setItemKeyChord = (itemGuid: PlaylistItemGuid, keyChord: Chord) => {
		setItems(_withKey(itemGuid, keyChord))
	}

	/** The list as it would be with this item in that key. */
	const _withKey = (
		itemGuid: PlaylistItemGuid,
		keyChord: Chord
	): PlaylistItemDto[] => {
		const toneKey = keyChord.data.rootNote.toString()
		return state.items.map((i) =>
			i.guid === itemGuid ? { ...i, toneKey } : i
		)
	}

	/**
	 * Transposing where there is no Save to press afterwards — the phone's
	 * detail view — so it writes itself, the way adding a song and renaming do.
	 *
	 * The write waits for the tapping to stop. A key is chosen a semitone at a
	 * time and each tap rewrites the whole playlist, so five taps meant five
	 * overlapping writes racing to be last; `KEY_WRITE_DELAY` after the final
	 * one, a single write goes out with the list as it then stands. The list is
	 * kept in a ref for it: the timer outlives the render that armed it, and
	 * `state` in that render is the list before the last tap.
	 */
	const setItemKeyChordAndSave = (
		itemGuid: PlaylistItemGuid,
		keyChord: Chord
	) => {
		const next = _withKey(itemGuid, keyChord)
		setItems(next)
		pendingItemsRef.current = next
		if (keyWriteTimer.current) clearTimeout(keyWriteTimer.current)
		keyWriteTimer.current = setTimeout(() => {
			keyWriteTimer.current = null
			_persist(titleRef.current, pendingItemsRef.current)
		}, KEY_WRITE_DELAY)
	}

	const removeItem = (itemGuid: PlaylistItemGuid) => {
		const newItems = state.items
			.filter((i) => i.guid !== itemGuid)
			.sort((a, b) => a.order - b.order)
			.map((i, index) => ({ ...i, order: index }))

		setItems(newItems)
	}

	/** The list as it would be with these packs appended, in the order given. */
	const _withAppended = (packs: BasicVariantPack[]): PlaylistItemDto[] => {
		const appended: PlaylistItemDto[] = packs.map((pack, i) => ({
			guid: v4() as PlaylistItemGuid,
			pack,
			toneKey: 'C',
			order: state.items.length + i,
		}))
		return [...state.items, ...appended].sort((a, b) => a.order - b.order)
	}

	/**
	 * Appends several songs at once.
	 *
	 * Calling `addItem` in a loop looked like it would do this and did not: each
	 * call read `state.items` out of the same render, so every one of them built
	 * its list from the state before the loop started and the last write won —
	 * pick three songs, get one. The desktop never saw it because its picker
	 * passes `disableMultiselect` and adds one at a time.
	 */
	const addItems = async (packs: BasicVariantPack[]) => {
		if (!packs.length) return
		setItems(_withAppended(packs))
	}

	/**
	 * Appends and writes to the server in one go.
	 *
	 * Adding is not a draft edit. The phone shows "Přidat píseň do playlistu"
	 * outside edit mode as well, where nothing would ever save it, so songs
	 * appeared in the list, said "1 píseň" in the header, and were gone on the
	 * next visit — with nothing on screen to suggest it.
	 */
	const addItemsAndSave = async (packs: BasicVariantPack[]) => {
		if (!packs.length) return
		const next = _withAppended(packs)
		setItems(next)
		await _persist(state.title, next)
	}

	const addItem = async (pack: BasicVariantPack) => addItems([pack])

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
		renameAndSave,
		setItems,
		setItemKeyChord,
		setItemKeyChordAndSave,
		removeItem,
		addItem,
		addItems,
		addItemsAndSave,
		addItemWithGuid,
		editItem,
		data: playlist.playlist,
	}
}
