'use client'

import {
	releaseSearchKeyboard,
	takeSearchKeyboard,
} from '@/app/(layout)/pisne/searchHandoff'
import { PAGE_ACTION_RESERVE } from '@/common/components/PageAction/PageAction'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useEffect, useRef, useState } from 'react'
import ImportSongBody from './components/ImportSongBody'
import ImportSongShell from './components/ImportSongShell'
import { useFilePicker } from './components/useFilePicker'
import { useSongImport } from './hooks/useSongImport'
import { consumeImportIntent, ImportIntent } from './tech/importHandoff'
import {
	handOffToEditor,
	loadImportResult,
	saveImportResult,
} from './tech/importStorage'

export default SmartPage(ImportSong, ['middleWidth'])

/**
 * "Načíst píseň": a link or a file in, songs out — read, checked and handed to
 * the "Napsat ručně" editor. Everything happens on this one screen: the form,
 * the parser's steps as they stream in, the found songs or the reason there
 * are none.
 *
 * Arriving from the create menu, the menu has already said what it wants: a
 * picked file starts processing at once, "Vložit odkaz" puts the caret in the
 * link field. Otherwise the last result list comes back (from the editor, say).
 */
function ImportSong() {
	const navigate = useSmartNavigate()

	const { state, setState, importUrl, importFile, retry, reset } =
		useSongImport()
	const [url, setUrl] = useState('')
	const urlInputRef = useRef<HTMLInputElement>(null)
	const [wantsUrlFocus, setWantsUrlFocus] = useState(false)

	const picker = useFilePicker(importFile)

	// what the create menu handed over, read once; kept in a ref so a remount of
	// the effect repeats the same arrival instead of losing it
	const intentRef = useRef<ImportIntent | null | undefined>(undefined)
	useEffect(() => {
		if (intentRef.current === undefined)
			intentRef.current = consumeImportIntent()
		const intent = intentRef.current
		if (intent?.kind === 'file') importFile(intent.file)
		else if (intent?.kind === 'link') setWantsUrlFocus(true)
		else {
			const stored = loadImportResult()
			if (stored) setState({ phase: 'done', result: stored })
		}
	}, [])

	// The caret goes into the link field once the form is on screen. A phone
	// opens its keyboard only for focus given inside a tap, so whoever asks for
	// this takes the keyboard during its tap (`takeSearchKeyboard`) and the
	// field takes it over here — see MOBILE.md, "The keyboard belongs to the tap".
	useEffect(() => {
		if (!wantsUrlFocus || state.phase !== 'idle') return
		const field = urlInputRef.current
		if (field) {
			field.focus()
			const end = field.value.length
			field.setSelectionRange(end, end)
		}
		releaseSearchKeyboard()
		setWantsUrlFocus(false)
	}, [wantsUrlFocus, state.phase])

	const focusUrlField = () => {
		takeSearchKeyboard()
		setWantsUrlFocus(true)
	}

	const songAt = (index: number) =>
		state.phase === 'done' ? state.result.songs[index] : undefined

	return (
		<ImportSongShell
			bottomInset={state.phase === 'done' ? PAGE_ACTION_RESERVE : undefined}
		>
			{picker.input}
			<ImportSongBody
				state={state}
				url={url}
				onUrlChange={setUrl}
				onSubmitUrl={() => importUrl(url)}
				onPickFile={picker.open}
				onDropFile={importFile}
				onCancel={reset}
				onRetry={retry}
				onEditLink={() => {
					reset()
					focusUrlField()
				}}
				onOtherLink={() => {
					reset()
					setUrl('')
					focusUrlField()
				}}
				onReset={() => {
					reset()
					setUrl('')
				}}
				onContinue={(index) => {
					const song = songAt(index)
					if (!song || state.phase !== 'done') return
					handOffToEditor({
						title: song.title ?? '',
						sheetData: song.sheetData,
						sourceKind: state.result.source.kind,
					})
					// Final: the user goes on with this one song. Forget the list,
					// so Back from the editor lands on an empty import page.
					saveImportResult(null)
					navigate('writeSong', {})
				}}
				urlInputRef={urlInputRef}
			/>
		</ImportSongShell>
	)
}
