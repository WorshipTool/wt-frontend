import { _muiTheme } from '@/app/theme'
import { ThemeProvider as TP } from '@mui/material/styles'
import React from 'react'

type ThemeProviderProps = {
	children: React.ReactNode
}
export default function ThemeProvider({ children }: ThemeProviderProps) {
	return <TP theme={_muiTheme}>{children}</TP>
}
