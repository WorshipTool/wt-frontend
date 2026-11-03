'use client'

import { GeneralParserStep } from '@/api/general-parser/generalParser'
import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import {
	Box,
	Button,
	CircularProgress,
	LinearProgress,
	Typography,
} from '@/common/ui'
import {
	CheckCircleRounded,
	RadioButtonUncheckedRounded,
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { ImportSource } from '../tech/importStorage'
import { buildStepList, StepView } from '../tech/steps'
import ImportSourceRow from './ImportSourceRow'

/** Steps that can take long enough to deserve a word of explanation. */
const SLOW_STEPS: GeneralParserStep[] = ['extract', 'ocr']

type ImportProgressProps = {
	source: ImportSource
	seen: GeneralParserStep[]
	onCancel: () => void
}

/**
 * Parsing, inline on the page: what is being read, and a step list built from
 * the parser's progress lines — done ✓, the active one spinning, the rest still
 * to come. The step names are ours (translated); the parser's own message is
 * Czech-only and not shown.
 */
export default function ImportProgress(props: ImportProgressProps) {
	const t = useTranslations('upload.import.steps')
	const tCommon = useTranslations('common')
	const steps = buildStepList(props.seen, props.source.kind)

	return (
		<Box sx={{ ...SURFACE_CARD_SX, overflow: 'hidden' }}>
			<LinearProgress />
			<Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
				<ImportSourceRow source={props.source} />

				<Box
					component="ol"
					sx={{
						listStyle: 'none',
						margin: 0,
						padding: 0,
						display: 'flex',
						flexDirection: 'column',
						gap: 1.5,
					}}
				>
					{steps.map((s) => (
						<StepRow
							key={s.step}
							view={s}
							label={t(s.step)}
							hint={
								s.state === 'active' && SLOW_STEPS.includes(s.step)
									? t('slowHint')
									: undefined
							}
						/>
					))}
				</Box>

				<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
					<Button variant="outlined" onClick={props.onCancel}>
						{tCommon('cancel')}
					</Button>
				</Box>
			</Box>
		</Box>
	)
}

function StepRow({
	view,
	label,
	hint,
}: {
	view: StepView
	label: string
	hint?: string
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
				) : view.state === 'active' ? (
					<CircularProgress size={18} thickness={5} />
				) : (
					<RadioButtonUncheckedRounded sx={{ color: 'grey.300' }} />
				)}
			</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography
					strong={view.state === 'active' ? 500 : undefined}
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
