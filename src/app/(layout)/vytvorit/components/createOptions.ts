import {
	EditRounded,
	FileUploadRounded,
	LinkRounded,
} from '@mui/icons-material'
import { SvgIconComponent } from '@mui/icons-material'

/**
 * The create menu without the general parser (flag off, or signed out): the
 * one way in is to write a song by hand. Everything else — a file, a link —
 * goes through the parser tiles below, which need a signed-in user.
 */
export const CREATE_OPTIONS = [
	{
		to: 'writeSong',
		icon: EditRounded,
		titleKey: 'writeManually',
		subtitleKey: 'writeManuallySubtitle',
	},
] as const satisfies readonly {
	to: string
	icon: SvgIconComponent
	titleKey: string
	subtitleKey: string
}[]

export type CreateOption = (typeof CREATE_OPTIONS)[number]

/**
 * The create menu once the general parser is on (flag `enable_general_parser`,
 * signed in): three tiles instead of the list above. The file tile is the
 * one gradient tile — the most common way in — and opens the file picker
 * straight from the tap; the link tile opens the import screen with the caret
 * in the link field. Keys live in `upload.import.tiles`.
 */
export const PARSER_CREATE_TILES = [
	{
		action: 'file',
		icon: FileUploadRounded,
		titleKey: 'uploadFile',
		subtitleKey: 'uploadFileSubtitle',
		highlighted: true,
	},
	{
		action: 'link',
		icon: LinkRounded,
		titleKey: 'pasteLink',
		subtitleKey: 'pasteLinkSubtitle',
		highlighted: false,
	},
	{
		action: 'write',
		icon: EditRounded,
		titleKey: 'writeManually',
		subtitleKey: 'writeManuallySubtitle',
		highlighted: false,
	},
] as const satisfies readonly {
	action: 'file' | 'link' | 'write'
	icon: SvgIconComponent
	titleKey: string
	subtitleKey: string
	highlighted: boolean
}[]

export type ParserCreateTile = (typeof PARSER_CREATE_TILES)[number]
