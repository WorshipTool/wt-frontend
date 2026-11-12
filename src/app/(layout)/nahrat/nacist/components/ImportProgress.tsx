'use client'

import { GeneralParserStep } from '@/api/general-parser/generalParser'
import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { routesPaths } from '@/routes/routes'
import {
	Box,
	Button,
	CircularProgress,
	LinearProgress,
	Typography,
} from '@/common/ui'
import {
	CheckCircleRounded,
	ErrorRounded,
	RadioButtonUncheckedRounded,
	WarningRounded,
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { ImportProblem } from '../hooks/useSongImport'
import { ImportSource } from '../tech/importStorage'
import { buildStepList, StepView } from '../tech/steps'
import ImportSourceRow from './ImportSourceRow'

/** Steps that can take long enough to deserve a word of explanation. */
const SLOW_STEPS: GeneralParserStep[] = ['extract', 'ocr']

/**
 * Outcomes where nothing broke — the source just has no song we can read, or
 * the user has to sign in. They get a warning marker; the rest an error one.
 */
const NOT_A_FAILURE: ImportProblem[] = [
	'notFound',
	'unavailable',
	'tooLarge',
	'unsupportedFile',
	'login',
]

/** Detecting and fetching read differently for an uploaded file. */
function stepLabelKey(step: GeneralParserStep, kind: ImportSource['kind']) {
	if (kind === 'file' && step === 'detect') return 'detectFile'
	if (kind === 'file' && step === 'fetch') return 'fetchFile'
	return step
}

/** A file gets its own wording where "the page" would be wrong. */
function problemKey(problem: ImportProblem, kind: ImportSource['kind']) {
	if (kind === 'file' && problem === 'notFound') return 'notFoundFile'
	if (kind === 'file' && problem === 'failed') return 'failedFile'
	return problem
}

export type ImportProgressActions = {
	onCancel: () => void
	onRetry: () => void
	/** Back to the form with the link kept and focused. */
	onEditLink: () => void
	/** Back to the form with an empty, focused link field. */
	onOtherLink: () => void
	/** Opens the file picker (inside the click). */
	onPickFile: () => void
}

type ImportProgressProps = ImportProgressActions & {
	source: ImportSource
	seen: GeneralParserStep[]
	/** Set when it stopped without songs: the step where it stopped says why. */
	problem?: ImportProblem
}

/**
 * The one view of an import in flight and of an import that went nowhere:
 * what is being read, and the step list built from the parser's progress
 * lines — done ✓, the active one spinning, the rest still to come.
 *
 * When it stops without songs, the same list stays: finished steps keep their
 * ✓, the step where it stopped gets a warning or error marker and the reason
 * in place of its name, and the buttons under the list change from Zrušit to
 * what can be done next — always including Napsat ručně.
 */
export default function ImportProgress(props: ImportProgressProps) {
	const t = useTranslations('upload.import')
	const tCommon = useTranslations('common')
	const { source, problem } = props
	const steps = buildStepList(props.seen, source.kind, !!problem)
	const key = problem && problemKey(problem, source.kind)

	return (
		<Box sx={{ ...SURFACE_CARD_SX, overflow: 'hidden' }}>
			{!problem && <LinearProgress />}
			<Box
				sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
			>
				<ImportSourceRow source={source} />

				<Box
					component="ol"
					aria-live="polite"
					sx={{
						listStyle: 'none',
						margin: 0,
						padding: 0,
						display: 'flex',
						flexDirection: 'column',
						gap: 1.5,
					}}
				>
					{steps.map((s) =>
						s.state === 'failed' && problem && key ? (
							<StepRow
								key={s.step}
								view={s}
								warning={NOT_A_FAILURE.includes(problem)}
								label={t(`problem.${key}.title`)}
								hint={t(`problem.${key}.text`)}
							/>
						) : (
							<StepRow
								key={s.step}
								view={s}
								label={t(`steps.${stepLabelKey(s.step, source.kind)}`)}
								hint={
									s.state === 'active' && SLOW_STEPS.includes(s.step)
										? t('steps.slowHint')
										: undefined
								}
							/>
						),
					)}
				</Box>

				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'flex-end',
						gap: 1,
					}}
				>
					{problem ? (
						<>
							<NextActions {...props} problem={problem} />
							<Button variant="outlined" to="writeSong">
								{t('tiles.writeManually')}
							</Button>
						</>
					) : (
						<Button variant="outlined" onClick={props.onCancel}>
							{tCommon('cancel')}
						</Button>
					)}
				</Box>
			</Box>
		</Box>
	)
}

/** What to try next, by outcome; "Napsat ručně" is added by the caller. */
function NextActions(props: ImportProgressProps & { problem: ImportProblem }) {
	const t = useTranslations('upload.import.actions')
	const tCommon = useTranslations('common')
	const isLink = props.source.kind === 'link'

	const retry = (
		<Button variant="outlined" onClick={props.onRetry}>
			{tCommon('tryAgain')}
		</Button>
	)
	const otherFile = (
		<Button variant="outlined" onClick={props.onPickFile}>
			{t('otherFile')}
		</Button>
	)

	switch (props.problem) {
		case 'notFound':
			return isLink ? (
				<Button variant="outlined" onClick={props.onOtherLink}>
					{t('otherLink')}
				</Button>
			) : (
				otherFile
			)
		case 'unavailable':
			return isLink ? (
				<Button variant="outlined" onClick={props.onPickFile}>
					{t('uploadInstead')}
				</Button>
			) : (
				otherFile
			)
		case 'failed':
		case 'badInput':
			return (
				<>
					{isLink ? (
						<Button variant="outlined" onClick={props.onEditLink}>
							{t('editLink')}
						</Button>
					) : (
						otherFile
					)}
					{props.problem === 'failed' && retry}
				</>
			)
		case 'tooLarge':
		case 'unsupportedFile':
			return otherFile
		case 'login':
			return (
				<Button
					variant="outlined"
					to="login"
					toParams={{ previousPage: routesPaths.importSong }}
				>
					{t('login')}
				</Button>
			)
		default:
			return retry
	}
}

function StepRow({
	view,
	label,
	hint,
	warning,
}: {
	view: StepView
	label: string
	hint?: string
	warning?: boolean
}) {
	return (
		<Box
			component="li"
			aria-current={view.state === 'active' ? 'step' : undefined}
			sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}
		>
			<Box
				sx={{
					width: 24,
					height: 24,
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{view.state === 'done' ? (
					<CheckCircleRounded sx={{ color: 'success.main' }} />
				) : view.state === 'failed' ? (
					warning ? (
						<WarningRounded sx={{ color: 'warning.main' }} />
					) : (
						<ErrorRounded sx={{ color: 'error.main' }} />
					)
				) : view.state === 'active' ? (
					<CircularProgress size={18} thickness={5} />
				) : (
					<RadioButtonUncheckedRounded sx={{ color: 'grey.300' }} />
				)}
			</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography
					strong={
						view.state === 'active' || view.state === 'failed' ? 500 : undefined
					}
					color={view.state === 'pending' ? 'grey.500' : undefined}
				>
					{label}
				</Typography>
				{hint && (
					<Typography small color="grey.600">
						{hint}
					</Typography>
				)}
			</Box>
		</Box>
	)
}
