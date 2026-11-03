'use client'

import ParserCreateTiles from '@/app/(layout)/vytvorit/components/ParserCreateTiles'
import { Box, Typography } from '@/common/ui'
import { createStory } from '../../storybook/createStory'
import ImportSongBody, {
	ImportSongBodyProps,
} from './components/ImportSongBody'
import { ImportProblem, ImportState } from './hooks/useSongImport'
import { ImportSource } from './tech/importStorage'

const link: ImportSource = {
	kind: 'link',
	label: 'https://zpevnik.example.cz/rano-ti-zpivam',
}
const file: ImportSource = { kind: 'file', label: 'ranni-pisne.pdf' }

const SONGS = [
	{
		title: 'Ráno ti zpívám',
		sheetData:
			'{V1}[G]Ráno ti zpívám, [D]když slunce vstává,\n[Em]světlo tvé [C]tváře mi [D]naději dává.\n[G]Ticho se láme, [D]srdce se budí,\n[Em]tvoje je [C]jméno, co [D]ve mně zní.\n{R}[C]Haleluja, [G]Pane můj,\n[D]celý můj den je [Em]tvůj,\n[C]haleluja, [G]vedeš mě [D]dál.\n{V2}[G]Cestou mě neseš, [D]když nohy slábnou,\n[Em]tvoje slova [C]nikdy ne[D]vadnou.',
		confidence: 0.92,
		source: { url: null, file: 'ranni-pisne.pdf', index: 0 },
	},
	{
		title: 'Jsi skála má',
		sheetData:
			'{V1}[D]Jsi skála má, [A]když vítr duje,\n[Hm]tvá ruka mě [G]pevně drží.\n{R}[G]Ty jsi můj [D]štít, [A]má síla',
		confidence: 0.55,
		source: { url: null, file: 'ranni-pisne.pdf', index: 1 },
	},
]

const noop = () => {}
const base: Omit<ImportSongBodyProps, 'state'> = {
	url: '',
	onUrlChange: noop,
	onSubmitUrl: noop,
	onPickFile: noop,
	onDropFile: noop,
	onCancel: noop,
	onRetry: noop,
	onEditLink: noop,
	onOtherLink: noop,
	onReset: noop,
	onCopy: noop,
	onEdit: noop,
}

const PROBLEMS: [ImportProblem, ImportSource][] = [
	['notFound', link],
	['unavailable', link],
	['failed', link],
	['service', file],
	['stream', file],
	['login', link],
]

const STATES: [string, ImportState][] = [
	['idle', { phase: 'idle' }],
	[
		'running',
		{ phase: 'running', source: file, seen: ['detect', 'extract', 'ocr'] },
	],
	[
		'done',
		{
			phase: 'done',
			result: {
				id: 'story',
				source: file,
				songs: SONGS,
				saved: { 0: { hex: 'abc', alias: 'rano-ti-zpivam' } },
			},
		},
	],
	...PROBLEMS.map<[string, ImportState]>(([problem, source]) => [
		problem,
		{ phase: 'problem', source, problem },
	]),
]

/**
 * Every screen of the link/file import, without a backend: the create-menu
 * tiles (shown here whatever the flag says) and each phase of the import body.
 */
function ImportSongStory() {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<ParserCreateTiles />
			{STATES.map(([name, state]) => (
				<Box
					key={name}
					sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
				>
					<Typography small color="grey.600">
						{name}
					</Typography>
					<ImportSongBody {...base} state={state} />
				</Box>
			))}
		</Box>
	)
}

createStory('ImportSong', ImportSongStory)
