'use client'
import { theme } from '@/common/constants/theme'
import { createTheme } from '@/common/ui/mui'
import { responsiveFontSizes } from '@mui/material/styles'
import { csCZ } from '@mui/x-date-pickers/locales'

let muiTheme = createTheme(
	{
		...theme,
		shape: {
			borderRadius: 6,
		},
		typography: {
			fontFamily: 'var(--font-orbitron), var(--font-jetbrains), monospace',
			h1: {
				fontFamily: 'var(--font-orbitron), monospace',
				fontSize: '5rem',
				fontWeight: 900,
				lineHeight: 1,
				letterSpacing: '0.06em',
				textTransform: 'uppercase' as const,
			},
			h2: {
				fontFamily: 'var(--font-orbitron), monospace',
				fontSize: '3rem',
				fontWeight: 700,
				letterSpacing: '0.04em',
				textTransform: 'uppercase' as const,
			},
			h3: {
				fontFamily: 'var(--font-orbitron), monospace',
				fontSize: '2rem',
				lineHeight: 1.4,
				letterSpacing: '0.03em',
				fontWeight: 600,
			},
			h4: {
				fontFamily: 'var(--font-orbitron), monospace',
				fontSize: '1.5rem',
				fontWeight: 600,
				letterSpacing: '0.02em',
			},
			h5: {
				fontFamily: 'var(--font-orbitron), monospace',
				fontSize: '1.25rem',
				fontWeight: 600,
				letterSpacing: '0.02em',
			},
			h6: {
				fontFamily: 'var(--font-jetbrains), monospace',
				fontSize: '1.125rem',
				fontWeight: 500,
			},
			body1: {
				fontFamily: 'var(--font-jetbrains), monospace',
				fontSize: '1rem',
			},
			body2: {
				fontFamily: 'var(--font-jetbrains), monospace',
				fontSize: '0.875rem',
			},
			button: {
				fontFamily: 'var(--font-orbitron), monospace',
				letterSpacing: '0.08em',
				fontWeight: 600,
			},
		},
	},
	csCZ
)
muiTheme = responsiveFontSizes(muiTheme)
export const _muiTheme = muiTheme
