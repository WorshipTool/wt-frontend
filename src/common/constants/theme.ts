import { ThemeOptions } from '@/common/ui/mui'

export const lightTheme = {
	palette: {
		mode: 'light' as const,
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
	},
}

export const darkTheme = {
	palette: {
		mode: 'dark' as const,
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
	},
}

// For backward compatibility
export const theme = lightTheme

// Type checks, dont remove
const a: ThemeOptions = theme
