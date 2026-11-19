import {
	mapPlaylistDataOutDtoToPlaylistDto,
	mapPlaylistItemOutDtoApiToPlaylistItemDto,
} from '@/api/dtos/playlist/playlist.map'
import {
	AuthApi,
	BridgeApi,
	Configuration,
	ImagesApi,
	MailApi,
	NewsApi,
	PackEmbeddingApi,
	ParserApi,
	PermissionsApi,
	PlaylistEditingApi,
	PlaylistGettingApi,
	SongAddingApi,
	SongCreatorsApi,
	SongDeletingApi,
	SongEditingApi,
	SongFavouritesApi,
	SongGettingApi,
	SongManagementApi,
	SongNotesApi,
	SongPublishingApi,
	SongSearchingApi,
	SongUserManagementApi,
	SongValidationApi,
	TeamAddingApi,
	TeamEditingApi,
	TeamEventsApi,
	TeamGettingApi,
	TeamJoiningApi,
	TeamMembersApi,
	TeamPlaylistsApi,
	TeamSongNotesApi,
	TeamStatisticsApi,
} from '@/api/generated'

import { mapBasicVariantPackApiToDto } from '@/api/dtos'
import { mapSearchSongPacksApiToDto } from '@/api/dtos/song/song.search.dto'
import { mapCreatorAutocompleteApiToDto } from '@/api/map/creator.map'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { apiAxios } from './api-axios'
import { wrapApi, wrapServerApi } from './api-wrapper'

export type ApiClasses = ReturnType<typeof getInternalApiClasses>

export const getApiClasses = (apiConfiguration: Configuration) => {
	return getInternalApiClasses(apiConfiguration, wrapApi) as ApiClasses
}

export const getServerApiClasses = (apiConfiguration: Configuration) => {
	return getInternalApiClasses(apiConfiguration, wrapServerApi) as ApiClasses
}
const getInternalApiClasses = (
	apiConfiguration: Configuration,
	wrapFunc: typeof wrapApi
) => {
	const playlistGettingApi = new PlaylistGettingApi(apiConfiguration, undefined, apiAxios)
	const playlistEditingApi = new PlaylistEditingApi(apiConfiguration, undefined, apiAxios)
	const songGettingApi = new SongGettingApi(apiConfiguration, undefined, apiAxios)
	const songSearchingApi = new SongSearchingApi(apiConfiguration, undefined, apiAxios)
	const songAddingApi = new SongAddingApi(apiConfiguration, undefined, apiAxios)
	const songEditingApi = new SongEditingApi(apiConfiguration, undefined, apiAxios)
	const songDeletingApi = new SongDeletingApi(apiConfiguration, undefined, apiAxios)
	const songPublishingApi = new SongPublishingApi(apiConfiguration, undefined, apiAxios)
	const songValidationApi = new SongValidationApi(apiConfiguration, undefined, apiAxios)
	const songNotesApi = new SongNotesApi(apiConfiguration, undefined, apiAxios)
	const songFavouritesApi = new SongFavouritesApi(apiConfiguration, undefined, apiAxios)
	const authApi = new AuthApi(apiConfiguration, undefined, apiAxios)
	const permissionApi = new PermissionsApi(apiConfiguration, undefined, apiAxios)
	const mailApi = new MailApi(apiConfiguration, undefined, apiAxios)
	const imagesApi = new ImagesApi(apiConfiguration, undefined, apiAxios)
	const bridgeApi = new BridgeApi(apiConfiguration, undefined, apiAxios)
	const parserApi = new ParserApi(apiConfiguration, undefined, apiAxios)
	const packEmbeddingApi = new PackEmbeddingApi(apiConfiguration, undefined, apiAxios)
	const songManagementApi = new SongManagementApi(apiConfiguration, undefined, apiAxios)
	const songUserManagementApi = new SongUserManagementApi(apiConfiguration, undefined, apiAxios)
	const songCreatorsApi = new SongCreatorsApi(apiConfiguration, undefined, apiAxios)

	const teamAddingApi = new TeamAddingApi(apiConfiguration, undefined, apiAxios)
	const teamGettingApi = new TeamGettingApi(apiConfiguration, undefined, apiAxios)
	const teamEditingApi = new TeamEditingApi(apiConfiguration, undefined, apiAxios)
	const teamJoiningApi = new TeamJoiningApi(apiConfiguration, undefined, apiAxios)
	const teamMembersApi = new TeamMembersApi(apiConfiguration, undefined, apiAxios)
	const teamEventsApi = new TeamEventsApi(apiConfiguration, undefined, apiAxios)
	const teamPlaylistsApi = new TeamPlaylistsApi(apiConfiguration, undefined, apiAxios)
	const teamSongNotesApi = new TeamSongNotesApi(apiConfiguration, undefined, apiAxios)
	const teamStatisticsApi = new TeamStatisticsApi(apiConfiguration, undefined, apiAxios)

	const newsApi = new NewsApi(apiConfiguration, undefined, apiAxios)

	const wrappedClasses = {
		playlistGettingApi: wrapFunc(playlistGettingApi, {
			getPlaylistDataByGuid: {
				map: mapPlaylistDataOutDtoToPlaylistDto,
			},
		}),
		playlistEditingApi: wrapFunc(playlistEditingApi, {
			addVariantToPlaylist: {
				map: mapPlaylistItemOutDtoApiToPlaylistItemDto,
			},
			createPlaylist: {
				map: (r: any) => r.guid as PlaylistGuid,
			},
		}),
		songGettingApi: wrapFunc(songGettingApi, {
			getBasicPackDataByPackGuid: {
				map: mapBasicVariantPackApiToDto,
			},
		}),
		songSearchingApi: wrapFunc(songSearchingApi, {
			search: {
				map: (d: any) => d.map((i: any) => mapSearchSongPacksApiToDto(i)),
			},
		}),
		songAddingApi: wrapFunc(songAddingApi),
		songEditingApi: wrapFunc(songEditingApi, {
			editVariant: {
				map: (b: any) => b,
			},
		}),
		songDeletingApi: wrapFunc(songDeletingApi),
		songPublishingApi: wrapFunc(songPublishingApi),
		songValidationApi: wrapFunc(songValidationApi),
		songNotesApi: wrapFunc(songNotesApi),
		songFavouritesApi: wrapFunc(songFavouritesApi),
		songCreatorsApi: wrapFunc(songCreatorsApi, {
			autoComplete: {
				map: mapCreatorAutocompleteApiToDto,
			},
		}),
		authApi: wrapFunc(authApi, {
			logout: {
				ignoreUnauthorizedError: true,
			},
		}),
		permissionApi: wrapFunc(permissionApi),
		mailApi: wrapFunc(mailApi),
		imagesApi: wrapFunc(imagesApi),
		bridgeApi: wrapFunc(bridgeApi),
		parserApi: wrapFunc(parserApi),
		packEmbeddingApi: wrapFunc(packEmbeddingApi, {
			search: {
				map: (arr: any[]) =>
					arr.map((s: any) => ({
						found: [mapBasicVariantPackApiToDto(s)],
					})),
			},
		}),
		songManagementApi: wrapFunc(songManagementApi),
		songUserManagementApi: wrapFunc(songUserManagementApi),

		teamAddingApi: wrapFunc(teamAddingApi),
		teamGettingApi: wrapFunc(teamGettingApi),
		teamEditingApi: wrapFunc(teamEditingApi),
		teamJoiningApi: wrapFunc(teamJoiningApi),
		teamMembersApi: wrapFunc(teamMembersApi),
		teamEventsApi: wrapFunc(teamEventsApi),
		teamPlaylistsApi: wrapFunc(teamPlaylistsApi),
		teamSongNotesApi: wrapFunc(teamSongNotesApi),
		teamStatisticsApi: wrapFunc(teamStatisticsApi),

		newsApi: wrapFunc(newsApi),
	}

	return wrappedClasses
}

export const getApiClass = <T extends keyof ApiClasses>(
	className: T,
	apiConfiguration: Configuration
): ApiClasses[T] => {
	const classes = getApiClasses(apiConfiguration)
	if (className in classes) {
		return classes[className]
	} else {
		throw new Error(`API class ${className} does not exist`)
	}
}
