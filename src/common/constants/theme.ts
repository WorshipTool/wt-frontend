import { ThemeOptions } from '@/common/ui/mui'

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
		grey: {
			50: '#faf9f7',
			100: '#f7f6f4',
			200: '#efeeec',
			300: '#e2e0dc',
			400: '#c4c1bb',
			500: '#9e9b95',
			600: '#75726c',
			700: '#5c5a55',
			800: '#3d3b37',
			900: '#1f1e1b',
		},
	},
}

// Type checks, dont remove
const a: ThemeOptions = theme
