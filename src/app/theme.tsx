'use client'
import { ThemeMode } from '@/common/providers/ThemeMode/ThemeModeContext'
import { createTheme } from '@/common/ui/mui'
import { responsiveFontSizes } from '@mui/material/styles'
import { csCZ } from '@mui/x-date-pickers/locales'
import { Roboto } from 'next/font/google'

const typography = {
	h1: {
		fontSize: '5rem',
		fontWeight: 400,
		lineHeight: 1,
	},
	h2: {
		fontSize: '3rem',
		fontWeight: 300,
	},
	h3: {
		fontSize: '2rem',
		lineHeight: 1.4,
	},
	h4: {
		fontSize: '1.5rem',
	},
	h5: {
		fontSize: '1.25rem',
	},
	h6: {
		fontSize: '1.125rem',
	},
}

const sharedPalette = {
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
}

const lightPalette = {
	mode: 'light' as const,
	...sharedPalette,
}

const darkPalette = {
	mode: 'dark' as const,
	...sharedPalette,
	primary: {
		main: '#4DABFF',
		dark: '#7B5CE0',
	},
	success: {
		main: '#66bb6a',
	},
	background: {
		default: '#121212',
		paper: '#1E1E1E',
	},
}

export function createMuiTheme(mode: ThemeMode) {
	let muiTheme = createTheme(
		{
			palette: mode === 'dark' ? darkPalette : lightPalette,
			typography,
		},
		csCZ
	)
	muiTheme = responsiveFontSizes(muiTheme)
	return muiTheme
}

// Default light theme export for backward compatibility
export const _muiTheme = createMuiTheme('light')

export const roboto = Roboto({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
})
