'use client'
import { useDarkMode } from '@/app/providers/DarkModeProvider'
import { lightTheme, darkTheme } from '@/common/constants/theme'
import { createTheme } from '@/common/ui/mui'
import { ThemeProvider as TP } from '@mui/material/styles'
import { responsiveFontSizes } from '@mui/material/styles'
import { csCZ } from '@mui/x-date-pickers/locales'
import { Roboto } from 'next/font/google'
import React, { useMemo } from 'react'

const roboto = Roboto({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
})

type ThemeProviderProps = {
	children: React.ReactNode
}

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

export default function ThemeProvider({ children }: ThemeProviderProps) {
	const { isDarkMode } = useDarkMode()

	const muiTheme = useMemo(() => {
		const baseTheme = isDarkMode ? darkTheme : lightTheme
		let theme = createTheme(
			{
				...baseTheme,
				typography,
			},
			csCZ
		)
		return responsiveFontSizes(theme)
	}, [isDarkMode])

	return (
		<div className={roboto.className}>
			<TP theme={muiTheme}>{children}</TP>
		</div>
	)
}
