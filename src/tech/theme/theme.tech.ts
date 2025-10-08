import { _muiTheme as theme } from '@/app/theme'
import { Breakpoints } from '@/tech/theme/theme.types'

const basicColors: Record<string, string> = {
	white: '#FFFFFF',
	black: '#000000',
	red: '#FF0000',
	green: '#00FF00',
	blue: '#0000FF',
	yellow: '#FFFF00',
	cyan: '#00FFFF',
	magenta: '#FF00FF',
}

export const getColorHex = (color: string) => {
	// Pokud je zadán hex kód, vrátí se přímo
	if (color.startsWith('#')) {
		return color
	}

	// Rozdělení vstupního řetězce podle tečky (např. primary.main, grey.700)
	const [colorGroup, colorShade] = color.split('.')

	// Pokud barva existuje v tématu (např. primary, secondary, error)
	if (theme.palette[colorGroup as keyof typeof theme.palette]) {
		const paletteColor = theme.palette[colorGroup as keyof typeof theme.palette]

		// Pokud je barva rozšířena o odstín (např. main, 700)
		if (colorShade && paletteColor[colorShade as keyof typeof paletteColor]) {
			return paletteColor[colorShade as keyof typeof paletteColor]
		}

		// Pokud není odstín, použije se default (např. primary.main)
		return (paletteColor as any).main || paletteColor
	}

	// Zvláštní zacházení pro přímé barvy jako "red" nebo "grey"
	if (theme.palette[color as keyof typeof theme.palette]) {
		return theme.palette[color as keyof typeof theme.palette]
	}

	// Try find in basic colors
	if (basicColors[color]) {
		return basicColors[color]
	}

	// Pokud barva neodpovídá ničemu, vrátí se výchozí
	return color // nebo jiná výchozí barva
}

export const breakpoints = {
	values: {
		xs: 0,
		sm: 600,
		md: 900,
		lg: 1200,
		xl: 1536,
	},
	up(key: Breakpoints) {
		const value = this.values[key]
		if (value === undefined) {
			throw new Error(`Invalid breakpoint key: ${key}`)
		}
		return `@media (min-width: ${value}px)`
	},
	down(key: Breakpoints) {
		const value = this.values[key]
		if (value === undefined) {
			throw new Error(`Invalid breakpoint key: ${key}`)
		}
		return `@media (max-width: ${value - 0.02}px)` // Fix for 1px precision
	},
	between(startKey: Breakpoints, endKey: Breakpoints) {
		const startValue = this.values[startKey]
		const endValue = this.values[endKey]
		if (startValue === undefined || endValue === undefined) {
			throw new Error(`Invalid breakpoint keys: ${startKey}, ${endKey}`)
		}
		return `@media (min-width: ${startValue}px) and (max-width: ${
			endValue - 0.02
		}px)`
	},
	only(key: Breakpoints) {
		const value = this.values[key]
		const nextKeyIndex = Object.keys(this.values).indexOf(key) + 1
		const nextKey = Object.keys(this.values)[nextKeyIndex] as Breakpoints
		const nextValue = nextKey ? this.values[nextKey] : null

		if (value === undefined) {
			throw new Error(`Invalid breakpoint key: ${key}`)
		}

		if (nextValue) {
			return `(min-width: ${value}px) and (max-width: ${nextValue - 0.02}px)`
		}
		return `@media (min-width: ${value}px)`
	},
}

export default breakpoints
