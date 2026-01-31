'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

type DarkModeContextType = {
	isDarkMode: boolean
	toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
	undefined
)

type DarkModeProviderProps = {
	children: React.ReactNode
}

export function DarkModeProvider({ children }: DarkModeProviderProps) {
	const [isDarkMode, setIsDarkMode] = useState(false)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		const savedMode = localStorage.getItem('darkMode')
		if (savedMode !== null) {
			setIsDarkMode(savedMode === 'true')
		}
	}, [])

	const toggleDarkMode = () => {
		setIsDarkMode((prev) => {
			const newMode = !prev
			localStorage.setItem('darkMode', String(newMode))
			return newMode
		})
	}

	if (!mounted) {
		return <>{children}</>
	}

	return (
		<DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
			{children}
		</DarkModeContext.Provider>
	)
}

export function useDarkMode() {
	const context = useContext(DarkModeContext)
	if (context === undefined) {
		throw new Error('useDarkMode must be used within a DarkModeProvider')
	}
	return context
}
