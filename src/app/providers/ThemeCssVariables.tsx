'use client'
import { SURFACE, SURFACE_SHADOW } from '@/common/constants/surfaces'
import { useTheme } from '@/common/ui'
import { GlobalStyles } from '@/common/ui/mui'

const GREY_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const
const SPACING_STEPS = [1, 2, 3, 4, 5, 6] as const

/**
 * Publishes the theme's tokens as CSS variables on :root, so plain `.css`
 * files read the very same values `sx` does. They are generated, never typed
 * out: the theme is the one place a colour is written down.
 *
 * Also paints the document itself with the canvas, so an overscroll bounce or
 * a page shorter than the window shows the app's ground rather than white.
 */
export default function ThemeCssVariables() {
	const theme = useTheme()
	const { palette } = theme

	const vars: Record<string, string> = {
		'--color-primary': palette.primary.main,
		'--color-primary-dark': palette.primary.dark,
		'--color-secondary': palette.secondary.main,
		'--color-success': palette.success.main,
	}
	GREY_SHADES.forEach((shade) => {
		vars[`--color-grey-${shade}`] = palette.grey[shade]
	})
	;(Object.keys(SURFACE) as (keyof typeof SURFACE)[]).forEach((token) => {
		vars[`--surface-${token}`] = palette.surface[token]
	})
	;(Object.keys(SURFACE_SHADOW) as (keyof typeof SURFACE_SHADOW)[]).forEach(
		(lift) => {
			vars[`--shadow-${lift}`] = SURFACE_SHADOW[lift]
		},
	)
	SPACING_STEPS.forEach((step) => {
		vars[`--spacing-${step}`] = theme.spacing(step)
	})

	return (
		<GlobalStyles
			styles={{
				':root': vars,
				// <html> only: its background becomes the viewport canvas. On
				// <body> it would be painted *over* everything with a negative
				// z-index — the Background layer and home's gradient shapes.
				html: { backgroundColor: palette.surface.canvas },
			}}
		/>
	)
}
