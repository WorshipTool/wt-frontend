import {
	mapPlaylistDataOutDtoToPlaylistDto,
	mapPlaylistItemOutDtoApiToPlaylistItemDto,
} from '@/api/dtos/playlist/playlist.map'
import {
	AuthApi,
	BridgeApi,
	Configuration,
	ImagesApi,
	LoggerApi,
	MailApi,
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
	const playlistGettingApi = new PlaylistGettingApi(apiConfiguration)
	const playlistEditingApi = new PlaylistEditingApi(apiConfiguration)
	const songGettingApi = new SongGettingApi(apiConfiguration)
	const songSearchingApi = new SongSearchingApi(apiConfiguration)
	const songAddingApi = new SongAddingApi(apiConfiguration)
	const songEditingApi = new SongEditingApi(apiConfiguration)
	const songDeletingApi = new SongDeletingApi(apiConfiguration)
	const songPublishingApi = new SongPublishingApi(apiConfiguration)
	const songValidationApi = new SongValidationApi(apiConfiguration)
	const songNotesApi = new SongNotesApi(apiConfiguration)
	const songFavouritesApi = new SongFavouritesApi(apiConfiguration)
	const authApi = new AuthApi(apiConfiguration)
	const permissionApi = new PermissionsApi(apiConfiguration)
	const mailApi = new MailApi(apiConfiguration)
	const imagesApi = new ImagesApi(apiConfiguration)
	const bridgeApi = new BridgeApi(apiConfiguration)
	const parserApi = new ParserApi(apiConfiguration)
	const packEmbeddingApi = new PackEmbeddingApi(apiConfiguration)
	const songManagementApi = new SongManagementApi(apiConfiguration)
	const songUserManagementApi = new SongUserManagementApi(apiConfiguration)
	const loggerApi = new LoggerApi(apiConfiguration)
	const songCreatorsApi = new SongCreatorsApi(apiConfiguration)

	const teamAddingApi = new TeamAddingApi(apiConfiguration)
	const teamGettingApi = new TeamGettingApi(apiConfiguration)
	const teamEditingApi = new TeamEditingApi(apiConfiguration)
	const teamJoiningApi = new TeamJoiningApi(apiConfiguration)
	const teamMembersApi = new TeamMembersApi(apiConfiguration)
	const teamEventsApi = new TeamEventsApi(apiConfiguration)
	const teamPlaylistsApi = new TeamPlaylistsApi(apiConfiguration)
	const teamSongNotesApi = new TeamSongNotesApi(apiConfiguration)
	const teamStatisticsApi = new TeamStatisticsApi(apiConfiguration)

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
		loggerApi: wrapFunc(loggerApi),

		teamAddingApi: wrapFunc(teamAddingApi),
		teamGettingApi: wrapFunc(teamGettingApi),
		teamEditingApi: wrapFunc(teamEditingApi),
		teamJoiningApi: wrapFunc(teamJoiningApi),
		teamMembersApi: wrapFunc(teamMembersApi),
		teamEventsApi: wrapFunc(teamEventsApi),
		teamPlaylistsApi: wrapFunc(teamPlaylistsApi),
		teamSongNotesApi: wrapFunc(teamSongNotesApi),
		teamStatisticsApi: wrapFunc(teamStatisticsApi),
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
