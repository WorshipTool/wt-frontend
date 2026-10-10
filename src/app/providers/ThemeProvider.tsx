import { _muiTheme } from '@/app/theme'
import ThemeCssVariables from '@/app/providers/ThemeCssVariables'
import { ThemeProvider as TP } from '@mui/material/styles'
import React from 'react'

type ThemeProviderProps = {
	children: React.ReactNode
}
export default function ThemeProvider({ children }: ThemeProviderProps) {
	return (
		<TP theme={_muiTheme}>
			<ThemeCssVariables />
			{children}
		</TP>
	)
}
