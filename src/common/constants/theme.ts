import { SURFACE } from '@/common/constants/surfaces'
import { ThemeOptions } from '@/common/ui/mui'

declare module '@mui/material/styles' {
	interface Palette {
		surface: typeof SURFACE
	}
	interface PaletteOptions {
		surface?: typeof SURFACE
	}
}

export const theme = {
	palette: {
		primary: {
			main: '#0085FF',
			dark: '#532EE7',
		},
		secondary: {
			main: '#EBBC1E',
		},
		success: {
			main: '#43a047',
		},
		surface: SURFACE,
		background: {
			default: SURFACE.canvas,
			paper: SURFACE.card,
		},
	},
}

// Type checks, dont remove
const a: ThemeOptions = theme
