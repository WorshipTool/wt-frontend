import { grey } from '@/common/ui/mui/colors'

/**
 * The app's surfaces — what everything on screen sits on. One ladder, the same
 * on a phone and on a desktop:
 *
 *   canvas  the page ground behind everything on a desktop — a light grey,
 *           so the white cards on it have something to stand out from
 *   shell   the phone app-shell's ground. A phone is nearly all card, so its
 *           ground is lighter and only shows as a rim; also the faintest
 *           tint there is (hover of a row inside a card)
 *   card    anything that floats on the canvas: cards, panels, list groups,
 *           popups, sidebars
 *   sunken  an inset area *inside* a card: tiles, wells, quiet input fields,
 *           a pressed row
 *   border  the hairline that outlines a card and divides its rows
 *
 * The rule that keeps contrast honest: a surface only ever sits on the step
 * directly above it — a card on the canvas, a sunken well in a card. A grey
 * panel straight on the canvas is the bug this ladder exists to stop: on a
 * desktop it used to be grey.100 on a grey.200–300 canvas and barely read as a
 * card at all.
 *
 * In `sx` use the palette paths (`bgcolor: 'surface.card'`); in plain `.css`
 * files use the CSS variables generated from them (`var(--surface-card)`, see
 * ThemeCssVariables). Never copy the hexes.
 */
export const SURFACE = {
	canvas: grey[100],
	shell: grey[50],
	card: '#FFFFFF',
	sunken: grey[100],
	border: grey[200],
} as const

export type SurfaceToken = keyof typeof SURFACE

/**
 * How far a surface is lifted. A card rests; a card under the pointer rises;
 * a popup or menu floats above the page.
 */
export const SURFACE_SHADOW = {
	card: '0 1px 3px rgba(0, 0, 0, 0.06)',
	raised: '0 4px 12px rgba(0, 0, 0, 0.08)',
	floating: '0 8px 28px rgba(0, 0, 0, 0.12)',
} as const

/**
 * The card itself — the one look everything that floats on the canvas shares,
 * on every width. Spread it into `sx`; add your own padding / overflow.
 */
export const SURFACE_CARD_SX = {
	bgcolor: 'surface.card',
	border: '1px solid',
	borderColor: 'surface.border',
	borderRadius: 3,
	boxShadow: SURFACE_SHADOW.card,
} as const
