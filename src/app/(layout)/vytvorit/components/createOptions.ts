import { EditRounded, UploadFileRounded } from '@mui/icons-material'
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
