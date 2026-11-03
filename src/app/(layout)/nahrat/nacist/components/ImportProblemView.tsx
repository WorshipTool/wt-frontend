'use client'

import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { Box, Button, Typography } from '@/common/ui'
import { alpha } from '@/common/ui/mui'
import { routesPaths } from '@/routes/routes'
import {
	BlockRounded,
	CloudOffRounded,
	EditRounded,
	ErrorOutlineRounded,
	LinkOffRounded,
	LockRounded,
	SearchOffRounded,
	SyncProblemRounded,
} from '@mui/icons-material'
import { SvgIconComponent } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { ImportProblem } from '../hooks/useSongImport'
import { ImportSource } from '../tech/importStorage'
import ImportSourceRow from './ImportSourceRow'

type Tone = 'grey' | 'warning' | 'error' | 'primary'

const LOOK: Record<ImportProblem, { icon: SvgIconComponent; tone: Tone }> = {
	notFound: { icon: SearchOffRounded, tone: 'grey' },
	unavailable: { icon: BlockRounded, tone: 'warning' },
	failed: { icon: ErrorOutlineRounded, tone: 'error' },
	badInput: { icon: LinkOffRounded, tone: 'error' },
	tooLarge: { icon: BlockRounded, tone: 'warning' },
	service: { icon: CloudOffRounded, tone: 'grey' },
	stream: { icon: SyncProblemRounded, tone: 'grey' },
	login: { icon: LockRounded, tone: 'primary' },
}

/** The text key: a file gets its own wording where "the page" would be wrong. */
function textKey(problem: ImportProblem, source: ImportSource) {
	if (source.kind === 'file' && problem === 'notFound') return 'notFoundFile'
	if (source.kind === 'file' && problem === 'failed') return 'failedFile'
	return problem
}

type ImportProblemViewProps = {
	source: ImportSource
	problem: ImportProblem
	onRetry: () => void
	/** Back to the form with the link kept and focused. */
	onEditLink: () => void
	/** Back to the form with an empty, focused link field. */
	onOtherLink: () => void
	/** Opens the file picker (inside the click). */
	onPickFile: () => void
}

/**
 * No songs, and why — in words a person can act on, with the action next to
 * it. "Napsat ručně" is always there, so no outcome is a dead end.
 */
export default function ImportProblemView(props: ImportProblemViewProps) {
	const t = useTranslations('upload.import')
	const tCommon = useTranslations('common')
	const { problem, source } = props
	const { icon: Icon, tone } = LOOK[problem]
	const key = textKey(problem, source)
	const isLink = source.kind === 'link'

	const retry = (
		<Button key="retry" variant="outlined" onClick={props.onRetry}>
			{tCommon('tryAgain')}
		</Button>
	)
	const pickFile = (label: string) => (
		<Button key="file" variant="outlined" onClick={props.onPickFile}>
			{label}
		</Button>
	)

	const actions: React.ReactNode[] = []
	switch (problem) {
		case 'notFound':
			actions.push(
				isLink ? (
					<Button key="other" variant="outlined" onClick={props.onOtherLink}>
						{t('actions.otherLink')}
					</Button>
				) : (
					pickFile(t('actions.otherFile'))
				)
			)
			break
		case 'unavailable':
			actions.push(
				pickFile(isLink ? t('actions.uploadInstead') : t('actions.otherFile'))
			)
			break
		case 'failed':
		case 'badInput':
			actions.push(
				isLink ? (
					<Button key="edit" variant="outlined" onClick={props.onEditLink}>
						{t('actions.editLink')}
					</Button>
				) : (
					pickFile(t('actions.otherFile'))
				)
			)
			if (problem === 'failed') actions.push(retry)
			break
		case 'tooLarge':
			actions.push(pickFile(t('actions.otherFile')))
			break
		case 'login':
			actions.push(
				<Button
					key="login"
					variant="outlined"
					to="login"
					toParams={{ previousPage: routesPaths.importSong }}
				>
					{t('actions.login')}
				</Button>
			)
			break
		default:
			actions.push(retry)
	}

	return (
		<Box
			role="status"
			sx={{
				...SURFACE_CARD_SX,
				padding: 2,
				display: 'flex',
				flexDirection: 'column',
				gap: 1.5,
			}}
		>
			<ImportSourceRow source={source} />
			<Box
				sx={(theme) => ({
					width: 40,
					height: 40,
					borderRadius: 2,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginTop: 1,
					color: tone === 'grey' ? 'grey.700' : `${tone}.dark`,
					bgcolor:
						tone === 'grey'
							? 'surface.sunken'
							: alpha(theme.palette[tone].main, 0.1),
				})}
			>
				<Icon />
			</Box>
			<Box>
				<Typography strong={600}>{t(`problem.${key}.title`)}</Typography>
				<Typography small color="grey.700">
					{t(`problem.${key}.text`)}
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 0.5 }}>
				{actions}
				<Button startIcon={<EditRounded />} to="writeSong">
					{t('tiles.writeManually')}
				</Button>
			</Box>
		</Box>
	)
}
