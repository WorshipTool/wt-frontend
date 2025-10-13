import { PackGuid, VariantPackGuid } from '@/api/dtos'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { Chord } from '@pepavlin/sheet-api'
import { useCallback } from 'react'
import {
	GetSearchInPlaylistResult,
	PlaylistComplexEditInDto,
	ReorderPlaylistInDto,
} from '../../api/generated'
import Playlist, {
	PlaylistGuid,
	PlaylistItemDto,
	PlaylistItemGuid,
} from '../../interfaces/playlist/playlist.types'

export const PLAYLIST_UPDATE_EVENT_NAME = 'playlist-update'

export const getPlaylistUpdateEventName = (guid: PlaylistGuid) =>
	`${PLAYLIST_UPDATE_EVENT_NAME}-${guid}`

export default function usePlaylistsGeneral() {
	const { playlistEditingApi, playlistGettingApi } = useApi()

	const addVariantToPlaylist = async (
		packGuid: VariantPackGuid,
		playlist: PlaylistGuid
	) => {
		return await playlistEditingApi.addVariantToPlaylist({
			playlist,
			packGuid,
		})
	}

	const addPacksToPlaylist = async (
		packGuids: VariantPackGuid[],
		playlist: PlaylistGuid
	) => {
		const newItems: PlaylistItemDto[] = []
		for (const packGuid of packGuids) {
			try {
				const data = await addVariantToPlaylist(packGuid, playlist)
				if (data) newItems.push(data)
			} catch (e) {}
		}

		return newItems
	}

	const removeVariantFromPlaylist = async (
		packGuid: VariantPackGuid,
		playlist: PlaylistGuid
	) => {
		return await playlistEditingApi.removeVariantFromPlaylistDelete(
			packGuid,
			playlist
		)
	}

	const isVariantInPlaylist = async (
		packGuid: VariantPackGuid,
		playlist: PlaylistGuid
	): Promise<boolean> => {
		return await playlistGettingApi.isVariantInPlaylist(packGuid, playlist)
	}

	const getPlaylistsOfUser = async () => {
		return await playlistGettingApi.getPlaylistsOfUser()
	}

	const createPlaylist = async (): Promise<PlaylistGuid> => {
		return await playlistEditingApi.createPlaylist()
	}

	const deletePlaylist = async (guid: PlaylistGuid) => {
		const r = await playlistEditingApi.deletePlaylist(guid)
		updatePlaylistTick(guid)
		return r
	}

	const getPlaylistByGuid = async (guid: PlaylistGuid): Promise<Playlist> => {
		return await playlistGettingApi.getPlaylistDataByGuid(guid)
	}

	const searchInPlaylistByGuid = useCallback(
		async (
			playlistGuid: PlaylistGuid,
			searchString: string
		): Promise<GetSearchInPlaylistResult> => {
			return await playlistGettingApi.searchInPlaylist(
				searchString,
				playlistGuid
			)
		},
		[playlistGettingApi]
	)

	const reorderPlaylist = async (
		playlistGuid: PlaylistGuid,
		items: ReorderPlaylistInDto['items']
	) => {
		return await playlistEditingApi.reorderPlaylist({
			guid: playlistGuid,
			items,
		})
	}

	const setKeyChordOfItem = async (
		packGuid: PackGuid,
		playlistGuid: PlaylistGuid,
		keyChord: Chord
	) => {
		return await playlistEditingApi.transposePlaylistItem({
			packGuid,
			playlistGuid,
			key: keyChord.data.rootNote.toString(),
		})
	}

	const requireItemEdit = useCallback(
		async (guid: PlaylistItemGuid) => {
			return await playlistEditingApi.requireItemEdit({
				itemGuid: guid,
			})
		},
		[playlistEditingApi]
	)

	const complexEdit = async (data: PlaylistComplexEditInDto) => {
		return await playlistEditingApi.complexPlaylistEdit(data)
	}

	const updatePlaylistTick = async (guid: PlaylistGuid) => {
		window.dispatchEvent(
			new CustomEvent(PLAYLIST_UPDATE_EVENT_NAME, { detail: guid })
		)

		window.dispatchEvent(new Event(getPlaylistUpdateEventName(guid)))
	}

	return {
		addVariantToPlaylist,
		addPacksToPlaylist,
		removeVariantFromPlaylist,
		isVariantInPlaylist,
		getPlaylistsOfUser,
		createPlaylist,
		deletePlaylist,
		getPlaylistByGuid,
		searchInPlaylistByGuid,
		reorderPlaylist,
		setKeyChordOfItem,

		// Item editing
		requireItemEdit,
		complexEdit,

		// loading
	}
}
