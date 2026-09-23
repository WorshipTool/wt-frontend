'use client'

import { useSheetEditorTempData } from '@/common/components/SheetEditor/useSheetEditorTempData'
import { Z_INDEX } from '@/common/constants/zIndex'
import { Box, Button, Typography, useTheme } from '@/common/ui'
import { alpha, InputBase, styled } from '@/common/ui/mui'
import { SECTION_MARKS } from '@/common/components/SheetEditor/sections.constants'
import { AddRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'

type BlockColors = {
	chordBg: string
	chordFg: string
	sectionBg: string
	sectionFg: string
	ring: string
}

const TitleInput = styled(InputBase)(({ theme }) => ({
	fontWeight: theme.typography.fontWeightBold,
	fontSize: '1.15rem',
}))

// Identical text metrics for the transparent <textarea> and the highlight layer
// below it, so the styled chord blocks line up exactly under the typed text.
const EDITOR_METRICS = {
	margin: 0,
	padding: 0,
	fontFamily: 'inherit',
	fontSize: '1rem',
	lineHeight: 1.9,
	letterSpacing: 'normal',
	whiteSpace: 'pre-wrap',
	overflowWrap: 'break-word',
	boxSizing: 'border-box',
} as const

const SheetArea = styled('textarea')(({ theme }) => ({
	...EDITOR_METRICS,
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
	resize: 'none',
	border: 'none',
	outline: 'none',
	background: 'transparent',
	// the text itself is invisible — the highlight layer below shows it
	color: 'transparent',
	caretColor: theme.palette.grey[900],
	'&::placeholder': { color: 'transparent' },
}))

const Highlight = styled('div')(({ theme }) => ({
	...EDITOR_METRICS,
	position: 'absolute',
	inset: 0,
	overflow: 'hidden',
	pointerEvents: 'none',
	color: theme.palette.grey[900],
}))

const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H']

// 'major' is a word and needs translating; the rest are universal notation.
const TYPES: { label?: string; labelKey?: 'chordMajor'; suffix: string }[] = [
	{ labelKey: 'chordMajor', suffix: '' },
	{ label: 'm', suffix: 'm' },
	{ label: '7', suffix: '7' },
	{ label: 'm7', suffix: 'm7' },
	{ label: 'maj7', suffix: 'maj7' },
	{ label: 'sus4', suffix: 'sus4' },
]

const SECTION_COLORS: Record<string, string> = {
	S: 'primary.main',
	R: 'success.main',
	B: 'secondary.main',
}

/**
 * Split a chord body into root + suffix. Returns null for anything that isn't a
 * chord, so callers can leave unknown bracketed text (e.g. `[N.C.]`) untouched
 * instead of silently rewriting it.
 */
function parseChord(chord: string): { root: string; suffix: string } | null {
	const m = chord.match(/^([A-H](?:#|b)?)(.*)$/)
	if (!m) return null
	return { root: m[1], suffix: m[2] }
}

function chordTokenAt(
	text: string,
	pos: number
): { start: number; end: number; chord: string } | null {
	let open = -1
	for (let i = pos - 1; i >= 0; i--) {
		const ch = text[i]
		if (ch === ']' || ch === '\n') break
		if (ch === '[') {
			open = i
			break
		}
	}
	if (open === -1 && text[pos] === '[') open = pos
	if (open === -1) return null
	let close = -1
	for (let i = open + 1; i < text.length; i++) {
		const ch = text[i]
		if (ch === '[' || ch === '\n') break
		if (ch === ']') {
			close = i
			break
		}
	}
	if (close === -1 || pos > close + 1) return null
	return { start: open, end: close + 1, chord: text.substring(open + 1, close) }
}

// Render one [chord] / {section} token as a block. The brackets/braces stay in
// the text (so the block lines up under the textarea) but are drawn transparent,
// acting as the block's inner padding — only the chord/section letter shows.
function renderToken(
	tok: string,
	key: number,
	colors: BlockColors,
	active: boolean
): ReactNode {
	const isChord = tok[0] === '['
	const block = isChord
		? { backgroundColor: colors.chordBg, color: colors.chordFg }
		: { backgroundColor: colors.sectionBg, color: colors.sectionFg }
	return (
		<span
			key={key}
			style={{
				...block,
				borderRadius: 4,
				boxShadow: active ? `0 0 0 2px ${colors.ring}` : undefined,
			}}
		>
			<span style={{ color: 'transparent' }}>{tok[0]}</span>
			{tok.slice(1, -1)}
			<span style={{ color: 'transparent' }}>{tok[tok.length - 1]}</span>
		</span>
	)
}

function renderHighlight(
	text: string,
	colors: BlockColors,
	editRange: { start: number; end: number } | null
): ReactNode[] {
	const out: ReactNode[] = []
	const re = /(\[[^\]\n]*\]|\{[^}\n]*\})/g
	let last = 0
	let m: RegExpExecArray | null
	let k = 0
	while ((m = re.exec(text)) !== null) {
		if (m.index > last) out.push(<span key={k++}>{text.slice(last, m.index)}</span>)
		const end = m.index + m[0].length
		const active = !!editRange && editRange.start === m.index && editRange.end === end
		out.push(renderToken(m[0], k++, colors, active))
		last = end
	}
	// trailing text (+ a zero-width char so the last line keeps its height)
	out.push(<span key={k++}>{text.slice(last) + '​'}</span>)
	return out
}

type MobileSongEditorProps = {
	onTitleChange?: (title: string) => void
	onSheetDataChange?: (sheetData: string) => void
}

/**
 * Phone song editor with an interactive chord workflow. Lyrics are typed in a
 * full-height field where chords render as tappable colour blocks (a transparent
 * textarea over a highlight layer). One bottom row carries the section markers
 * (Sloka / Refrén / Bridge) plus an "+ Akord" button. Tapping "+ Akord" drops a
 * chord at the caret and opens a chord picker (root + type); tapping an existing
 * chord block selects it and opens the same picker. The picker rewrites the
 * chord live — no confirm step. Desktop keeps the classic SheetEditor.
 */
export default function MobileSongEditor(props: MobileSongEditorProps) {
	const t = useTranslations('songEditor')
	const theme = useTheme()

	const { title: tempTitle, sheetData: tempSheet } = useSheetEditorTempData(true)
	const [title, setTitleState] = useState(tempTitle)
	const [sheetData, setSheetDataState] = useState(tempSheet)

	const sheetRef = useRef<HTMLTextAreaElement | null>(null)
	const highlightRef = useRef<HTMLDivElement | null>(null)
	// Caret to restore after a programmatic text change. Flushed by the layout
	// effect below, which also depends on `pickerOpen` so closing the picker
	// (which doesn't change the text) still applies it.
	const pendingCaretRef = useRef<{ start: number; end: number; focus: boolean } | null>(
		null
	)
	// Last known caret offset. Kept up to date while the field is focused so that
	// inserting after the field has been blurred (the picker blurs it) still lands
	// where the user actually was, not at the end of the document.
	const caretPosRef = useRef(0)

	const [pickerOpen, setPickerOpen] = useState(false)
	const [editRange, setEditRange] = useState<{ start: number; end: number } | null>(null)
	const [root, setRoot] = useState('C')
	const [suffix, setSuffix] = useState('')

	const blockColors: BlockColors = {
		chordBg: theme.palette.primary.main,
		chordFg: theme.palette.primary.contrastText,
		sectionBg: theme.palette.grey[300],
		sectionFg: theme.palette.grey[800],
		ring: theme.palette.primary.dark,
	}

	const setTitle = (v: string) => {
		setTitleState(v)
		props.onTitleChange?.(v)
	}
	const setSheet = (v: string) => {
		setSheetDataState(v)
		props.onSheetDataChange?.(v)
	}

	// keep the highlight layer scrolled in step with the textarea
	const syncScroll = () => {
		if (highlightRef.current && sheetRef.current) {
			highlightRef.current.scrollTop = sheetRef.current.scrollTop
			highlightRef.current.scrollLeft = sheetRef.current.scrollLeft
		}
	}

	const rememberCaret = () => {
		const ta = sheetRef.current
		if (ta) caretPosRef.current = ta.selectionStart
	}

	/** Where an insert should go: live selection while focused, remembered otherwise. */
	const caretPos = () => {
		const ta = sheetRef.current
		if (ta && document.activeElement === ta) return ta.selectionStart
		return Math.min(caretPosRef.current, sheetData.length)
	}

	useLayoutEffect(() => {
		const pending = pendingCaretRef.current
		if (pending && sheetRef.current) {
			sheetRef.current.setSelectionRange(pending.start, pending.end)
			if (pending.focus) sheetRef.current.focus()
			caretPosRef.current = pending.end
			pendingCaretRef.current = null
		}
		syncScroll()
	}, [sheetData, pickerOpen])

	// the picker is a modal sheet — don't let the page scroll behind it
	useEffect(() => {
		if (!pickerOpen) return
		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previous
		}
	}, [pickerOpen])

	const insertSection = (mark: string) => {
		const pos = caretPos()
		const insert = `{${mark}}`
		setSheet(sheetData.slice(0, pos) + insert + sheetData.slice(pos))
		const c = pos + insert.length
		pendingCaretRef.current = { start: c, end: c, focus: true }
	}

	const applyChord = (nextRoot: string, nextSuffix: string, range = editRange) => {
		if (!range) return
		const token = `[${nextRoot}${nextSuffix}]`
		setSheet(sheetData.slice(0, range.start) + token + sheetData.slice(range.end))
		setEditRange({ start: range.start, end: range.start + token.length })
	}

	const pickRoot = (r: string) => {
		setRoot(r)
		applyChord(r, suffix)
	}
	const pickType = (s: string) => {
		setSuffix(s)
		applyChord(root, s)
	}

	const addChord = () => {
		const pos = caretPos()
		const token = '[C]'
		setSheet(sheetData.slice(0, pos) + token + sheetData.slice(pos))
		setEditRange({ start: pos, end: pos + token.length })
		setRoot('C')
		setSuffix('')
		setPickerOpen(true)
		sheetRef.current?.blur()
	}

	const onSheetClick = () => {
		const ta = sheetRef.current
		if (!ta || ta.selectionStart !== ta.selectionEnd) return
		rememberCaret()
		const tok = chordTokenAt(sheetData, ta.selectionStart)
		if (!tok) return
		const parsed = parseChord(tok.chord)
		// not a chord (e.g. `[N.C.]`) — leave the user's text alone
		if (!parsed) return
		setEditRange({ start: tok.start, end: tok.end })
		setRoot(parsed.root)
		setSuffix(parsed.suffix)
		setPickerOpen(true)
		ta.blur()
	}

	const closePicker = () => {
		const range = editRange
		setPickerOpen(false)
		setEditRange(null)
		if (range) {
			pendingCaretRef.current = { start: range.end, end: range.end, focus: false }
		}
	}

	return (
		<>
			<Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
				<TitleInput
					placeholder={t('titlePlaceholder')}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>

				{/* editable field: transparent textarea over a highlight layer that
				    draws the chords as colour blocks */}
				<Box sx={{ position: 'relative', flex: 1, minHeight: 0, marginTop: 1 }}>
					<Highlight ref={highlightRef} aria-hidden>
						{sheetData === '' ? (
							<span style={{ color: theme.palette.grey[500] }}>
								{t('contentPlaceholder')}
							</span>
						) : (
							renderHighlight(sheetData, blockColors, editRange)
						)}
					</Highlight>
					<SheetArea
						ref={sheetRef}
						aria-label={t('contentPlaceholder')}
						value={sheetData}
						onChange={(e) => {
							setSheet(e.target.value)
							rememberCaret()
						}}
						onClick={onSheetClick}
						onSelect={rememberCaret}
						onScroll={syncScroll}
						spellCheck={false}
						// autocorrect mangles words next to chord brackets
						autoCorrect="off"
						autoComplete="off"
					/>
				</Box>

				{/* one bottom row: section markers + add-chord */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 0.75,
						paddingTop: 1,
						paddingBottom: 0.5,
					}}
				>
					{SECTION_MARKS.map((s) => (
						<Button
							key={s.mark}
							onClick={() => insertSection(s.mark)}
							disableUppercase
							sx={{
								flexShrink: 0,
								minWidth: 0,
								height: 38,
								paddingX: 1.5,
								borderRadius: 1.5,
								bgcolor: SECTION_COLORS[s.mark],
								color: 'common.white',
								fontWeight: 700,
								fontSize: '0.82rem',
								'&:hover': { bgcolor: SECTION_COLORS[s.mark] },
							}}
						>
							{t(s.labelKey)}
						</Button>
					))}
					<Box sx={{ flex: 1 }} />
					<Button
						variant="outlined"
						onClick={addChord}
						disableUppercase
						startIcon={<AddRounded sx={{ fontSize: 18 }} />}
						sx={{
							flexShrink: 0,
							minWidth: 0,
							height: 38,
							paddingX: 1.75,
							borderRadius: 999,
							fontWeight: 700,
							fontSize: '0.85rem',
						}}
					>
						{t('chord')}
					</Button>
				</Box>
			</Box>

			{/* live chord picker — edits the selected chord as you tap, no confirm */}
			{pickerOpen && (
				<Box
					sx={{
						position: 'fixed',
						inset: 0,
						zIndex: Z_INDEX.DIALOG,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-end',
					}}
				>
					<Box
						onClick={closePicker}
						sx={{
							position: 'absolute',
							inset: 0,
							bgcolor: (th) => alpha(th.palette.common.black, 0.28),
						}}
					/>
					<Box
						sx={{
							position: 'relative',
							bgcolor: 'background.paper',
							borderTopLeftRadius: 20,
							borderTopRightRadius: 20,
							boxShadow: 6,
							padding: 2.5,
							paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)',
							display: 'flex',
							flexDirection: 'column',
							gap: 1.5,
						}}
					>
						<Box
							sx={{
								width: 40,
								height: 4,
								borderRadius: 2,
								bgcolor: 'grey.300',
								alignSelf: 'center',
							}}
						/>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<Typography strong sx={{ fontSize: '1.05rem' }}>
								{t('chord')}
							</Typography>
							<Typography strong color="primary.main" sx={{ fontSize: '1.25rem' }}>
								{root}
								{suffix}
							</Typography>
							<Box sx={{ flex: 1 }} />
							<Button
								onClick={closePicker}
								disableUppercase
								sx={{
									minWidth: 0,
									paddingX: 2.25,
									paddingY: 0.75,
									borderRadius: 999,
									fontWeight: 700,
									fontSize: '0.9rem',
								}}
							>
								{t('done')}
							</Button>
						</Box>

						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
							{ROOTS.map((r) => {
								const active = r === root
								return (
									<Button
										key={r}
										variant={active ? 'contained' : 'outlined'}
										onClick={() => pickRoot(r)}
										disableUppercase
										sx={{
											width: 52,
											minWidth: 52,
											height: 44,
											borderRadius: 2,
											fontWeight: 700,
											...(active
												? {}
												: {
														borderColor: 'grey.300',
														bgcolor: 'grey.50',
														color: 'grey.900',
													}),
										}}
									>
										{r}
									</Button>
								)
							})}
						</Box>

						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
							{TYPES.map((ty) => {
								const active = ty.suffix === suffix
								return (
									<Button
										key={ty.labelKey ?? ty.label}
										variant={active ? 'contained' : 'outlined'}
										onClick={() => pickType(ty.suffix)}
										disableUppercase
										sx={{
											minWidth: 0,
											paddingX: 1.75,
											height: 40,
											borderRadius: 999,
											fontWeight: 600,
											fontSize: '0.9rem',
											...(active
												? {}
												: {
														borderColor: 'grey.300',
														bgcolor: 'transparent',
														color: 'grey.700',
													}),
										}}
									>
										{ty.labelKey ? t(ty.labelKey) : ty.label}
									</Button>
								)
							})}
						</Box>
					</Box>
				</Box>
			)}
		</>
	)
}
