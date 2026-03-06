'use client'
import { createMuiTheme } from '@/app/theme'
import { ThemeModeProvider, useThemeMode } from '@/common/providers/ThemeMode/ThemeModeContext'
import { ThemeProvider as TP } from '@mui/material/styles'
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

function MuiThemeConsumer({ children }: { children: React.ReactNode }) {
	const { mode } = useThemeMode()
	const muiTheme = useMemo(() => createMuiTheme(mode), [mode])

	return <TP theme={muiTheme}>{children}</TP>
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
	return (
		<div className={roboto.className}>
			<ThemeModeProvider>
				<MuiThemeConsumer>{children}</MuiThemeConsumer>
			</ThemeModeProvider>
		</div>
	)
}
