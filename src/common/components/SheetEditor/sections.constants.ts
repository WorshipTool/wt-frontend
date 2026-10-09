/**
 * The song-sheet section markers, in the order they are offered to the user.
 *
 * Single source of truth for both editors — the desktop `ToolPanel` and the
 * phone `MobileSongEditor` — so adding a marker (or changing what `{R}` means)
 * is one edit, not two.
 *
 * `mark` is the letter written into the sheet as `{mark}`; `labelKey` and
 * `tooltipKey` are keys in the `songEditor` i18n namespace; `color` is the house
 * Button colour the desktop panel uses.
 */
export const SECTION_MARKS = [
	{
		mark: 'S',
		labelKey: 'verse',
		tooltipKey: 'markVerse',
		color: 'primary',
	},
	{
		mark: 'R',
		labelKey: 'chorus',
		tooltipKey: 'markChorus',
		color: 'success',
	},
	{
		mark: 'B',
		labelKey: 'bridge',
		tooltipKey: 'markBridge',
		color: 'secondary',
	},
] as const satisfies readonly {
	mark: string
	labelKey: string
	tooltipKey: string
	color: string
}[]

export type SectionMark = (typeof SECTION_MARKS)[number]
