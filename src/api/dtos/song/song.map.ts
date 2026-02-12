import { UserGuid } from '@/interfaces/user'
import {
	VariantPackAlias,
	VariantPackGuid,
} from '@/interfaces/variant/songVariant.types'
import { PlaylistGuid } from '@/types/playlist'
import {
	BasicSong,
	ExtendedVariantPack,
	PackTranslationType,
	SongGuid,
	SongLanguage,
	SongTitle,
} from '@/types/song'
import {
	BasicSongDto,
	BasicVariantPackDto,
	ExtendedVariantPackDto,
	GetVariantDataOutDto,
} from '../../generated'
import { BasicVariantPack, PublishApprovalStatus, SongDto } from './song.dto'

export const mapGetVariantDataApiToSongDto = (
	api: GetVariantDataOutDto
): SongDto => {
	return {
		guid: api.main.songGuid as SongGuid,
		title: api.main.title,
		variants: api.other.map((v) => mapBasicVariantPackApiToDto(v)),
		media: api.media,
		tags: api.tags,
	}
}

export const mapBasicVariantPackApiToDto = (
	api: BasicVariantPackDto & { hasChords?: boolean }
): BasicVariantPack => {
	return {
		...api,
		packGuid: api.packGuid as VariantPackGuid,
		packAlias: api.packAlias as VariantPackAlias,
		createdByGuid: api.createdByGuid as UserGuid,

		language: api.language as SongLanguage,
		songGuid: api.songGuid as SongGuid,

		translationType: api.translationType as PackTranslationType,
		ggValidated: api.ggValidated,
		hasChords: Boolean(api.hasChords),

		public: Boolean(api.public),
		publishApprovalStatus: api.publishApprovalStatus as PublishApprovalStatus,
		publishedAt: api.publishedAt ? new Date(api.publishedAt) : null,

		// Dates
		createdAt: new Date(api.createdAt),
		updatedAt: new Date(api.updatedAt),
	}
}

export const mapExtendedVariantPackApiToDto = (
	api: ExtendedVariantPackDto
): ExtendedVariantPack => {
	return {
		...api,
		...mapBasicVariantPackApiToDto(api),

		sources: api.sources,

		createdType: api.createdType,
		inFormat: api.inFormat,
		deleted: api.deleted,

		createdForPlaylistGuid: api.createdForPlaylistGuid as PlaylistGuid,
	}
}

export const mapBasicSongApiToDto = (api: BasicSongDto): BasicSong => {
	return {
		guid: api.guid as SongGuid,
		title: api.title as SongTitle,
		original: api.original
			? mapBasicVariantPackApiToDto(api.original)
			: undefined,
		packs: api.packs.map((v) => mapBasicVariantPackApiToDto(v)),
	}
}
