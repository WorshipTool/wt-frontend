import { ThemeOptions } from '@/common/ui/mui'

export const theme = {
	palette: {
		mode: 'dark' as const,
		primary: {
			main: '#00e5ff',
			dark: '#7b2fff',
		},
		secondary: {
			main: '#ff00e5',
		},
		success: {
			main: '#39ff14',
		},
		background: {
			default: '#0a0a0f',
			paper: '#0e0e1a',
		},
		text: {
			primary: '#e8e8ff',
			secondary: '#8888aa',
		},
		grey: {
			50: '#1a1a2e',
			100: '#1a1a2e',
			200: '#16162a',
			300: '#12122a',
			400: '#2a2a4a',
			500: '#4a4a6a',
			600: '#8888aa',
			700: '#aaaacc',
			800: '#ccccee',
			900: '#e8e8ff',
		},
	},
}

// Type checks, dont remove
const a: ThemeOptions = theme
