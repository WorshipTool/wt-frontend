import { UserGuid } from '@/interfaces/user'
import { PackTranslationType, SongGuid, SongLanguage } from '@/types/song'
import { MediaData } from '@/types/song/media.types'
import {
	VariantPackAlias,
	VariantPackGuid,
} from '../../../interfaces/variant/songVariant.types'

export type SongDto = {
	guid: string
	title: string
	variants: BasicVariantPack[]
	media: MediaData[]
	tags: string[]
}

export enum PublishApprovalStatus {
	None = 0,
	Approved = 1,
	Denied = 2,
	Pending = 3,
}

export type BasicVariantPack = {
	// Basic info
	packGuid: VariantPackGuid
	packAlias: VariantPackAlias
	title: string
	sheetData: string
	// sheet: Sheet
	songGuid: SongGuid

	// Additional info
	verified: boolean
	public: boolean
	publishApprovalStatus: PublishApprovalStatus
	publishedAt: Date | null

	language: SongLanguage
	translationType: PackTranslationType
	translationLikes: number
	ggValidated: boolean
	hasChords: boolean

	// Dates
	createdAt: Date
	updatedAt: Date

	// Created by
	createdByGuid: UserGuid
	createdByLoader: boolean
}
