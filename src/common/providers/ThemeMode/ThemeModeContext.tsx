'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'wt-theme-mode'

type ThemeModeContextType = {
	mode: ThemeMode
	toggleMode: () => void
	setMode: (mode: ThemeMode) => void
}

const ThemeModeContext = createContext<ThemeModeContextType>({
	mode: 'light',
	toggleMode: () => {},
	setMode: () => {},
})

function getInitialMode(): ThemeMode {
	if (typeof window === 'undefined') return 'light'
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored === 'light' || stored === 'dark') return stored
		// Respect system preference if no stored value
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
	} catch {
		// localStorage may be unavailable
	}
	return 'light'
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
	const [mode, setModeState] = useState<ThemeMode>('light')
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setModeState(getInitialMode())
		setMounted(true)
	}, [])

	useEffect(() => {
		if (!mounted) return
		try {
			localStorage.setItem(STORAGE_KEY, mode)
		} catch {
			// localStorage may be unavailable
		}
		document.documentElement.setAttribute('data-theme', mode)
	}, [mode, mounted])

	const toggleMode = useCallback(() => {
		setModeState((prev) => (prev === 'light' ? 'dark' : 'light'))
	}, [])

	const setMode = useCallback((newMode: ThemeMode) => {
		setModeState(newMode)
	}, [])

	return (
		<ThemeModeContext.Provider value={{ mode, toggleMode, setMode }}>
			{children}
		</ThemeModeContext.Provider>
	)
}

export function useThemeMode(): ThemeModeContextType {
	return useContext(ThemeModeContext)
}
