import {
	EditRounded,
	FileUploadRounded,
	LinkRounded,
	UploadFileRounded,
} from '@mui/icons-material'
import { SvgIconComponent } from '@mui/icons-material'

/**
 * The ways to add a song, in the order they're offered.
 *
 * Single source of truth for the create menu: the phone list and the desktop
 * card grid render the same table, so an option can't exist on one surface and
 * not the other (the two had already drifted — desktop showed no description
 * for "write manually" while the phone did).
 */
export const CREATE_OPTIONS = [
	{
		to: 'upload',
		icon: UploadFileRounded,
		titleKey: 'uploadFile',
		subtitleKey: 'uploadFileSubtitle',
		/** Only offered when this feature flag is on. */
		flag: 'enable_file_parser',
	},
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
	flag?: string
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
