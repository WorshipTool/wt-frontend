'use client'

import { Box } from '@/common/ui'
import { ImportState } from '../hooks/useSongImport'
import ImportProgress from './ImportProgress'
import ImportResults from './ImportResults'
import ImportSourceForm from './ImportSourceForm'

export type ImportSongBodyProps = {
	state: ImportState
	url: string
	onUrlChange: (url: string) => void
	onSubmitUrl: () => void
	onPickFile: () => void
	onDropFile: (file: File) => void
	onCancel: () => void
	onRetry: () => void
	onEditLink: () => void
	onOtherLink: () => void
	onReset: () => void
	/** Continue with the chosen song — into the editor. */
	onContinue: (index: number) => void
	urlInputRef?: React.Ref<HTMLInputElement>
}

/**
 * The import screen's content for each phase — the form, the step list, the
 * found songs or the reason there are none. Pure props, so the shell around it
 * (phone header / desktop page) and the storybook can both render it.
 */
export default function ImportSongBody(props: ImportSongBodyProps) {
	const { state } = props

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			{state.phase === 'idle' && (
				<ImportSourceForm
					url={props.url}
					onUrlChange={props.onUrlChange}
					onSubmitUrl={props.onSubmitUrl}
					onPickFile={props.onPickFile}
					onDropFile={props.onDropFile}
					urlInputRef={props.urlInputRef}
				/>
			)}
			{(state.phase === 'running' || state.phase === 'problem') && (
				<ImportProgress
					source={state.source}
					seen={state.seen}
					problem={state.phase === 'problem' ? state.problem : undefined}
					onCancel={props.onCancel}
					onRetry={props.onRetry}
					onEditLink={props.onEditLink}
					onOtherLink={props.onOtherLink}
					onPickFile={props.onPickFile}
				/>
			)}
			{state.phase === 'done' && (
				<ImportResults
					result={state.result}
					onContinue={props.onContinue}
					onReset={props.onReset}
				/>
			)}
		</Box>
	)
}
