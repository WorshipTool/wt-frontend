'use client'
import { theme } from '@/common/constants/theme'
import { createTheme } from '@/common/ui/mui'
import { responsiveFontSizes } from '@mui/material/styles'
import { csCZ } from '@mui/x-date-pickers/locales'

let muiTheme = createTheme(
	{
		...theme,
		shape: {
			borderRadius: 12,
		},
		typography: {
			fontFamily: 'var(--font-roboto)',
			h1: {
				fontSize: '5rem',
				fontWeight: 400,
				lineHeight: 1,
				letterSpacing: '-0.02em',
			},
			h2: {
				fontSize: '3rem',
				fontWeight: 300,
				letterSpacing: '-0.01em',
			},
			h3: {
				fontSize: '2rem',
				lineHeight: 1.4,
				letterSpacing: '-0.01em',
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
		},
	},
	csCZ
)
muiTheme = responsiveFontSizes(muiTheme)
export const _muiTheme = muiTheme
