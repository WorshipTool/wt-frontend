import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { ThemeModeProvider } from '@/common/providers/ThemeMode/ThemeModeContext'
import DarkModeToggle from '../DarkModeToggle'

// Mock @/common/ui to avoid loading the full barrel (SearchBar has Jest transform issues)
// jest.mock path aliases don't resolve, so use relative path
jest.mock('../../../../../ui', () => ({
	IconButton: ({
		children,
		onClick,
		alt,
	}: {
		children: React.ReactNode
		onClick?: () => void
		alt?: string
	}) => (
		<button onClick={onClick} aria-label={alt}>
			{children}
		</button>
	),
}))

const renderWithProvider = (ui: React.ReactElement) => {
	return render(<ThemeModeProvider>{ui}</ThemeModeProvider>)
}

describe('DarkModeToggle', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	it('renders the toggle wrapper', () => {
		renderWithProvider(<DarkModeToggle />)
		expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument()
	})

	it('has accessible aria-label for switching to dark mode in light mode', () => {
		renderWithProvider(<DarkModeToggle />)
		expect(
			screen.getByRole('button', { name: /switch to dark mode/i })
		).toBeInTheDocument()
	})

	it('updates aria-label to switch to light after toggling to dark', () => {
		renderWithProvider(<DarkModeToggle />)
		const button = screen.getByRole('button', { name: /switch to dark mode/i })
		act(() => {
			fireEvent.click(button)
		})
		expect(
			screen.getByRole('button', { name: /switch to light mode/i })
		).toBeInTheDocument()
	})

	it('toggles back to light mode label on second click', () => {
		renderWithProvider(<DarkModeToggle />)
		const button = screen.getByRole('button', { name: /switch to dark mode/i })
		act(() => {
			fireEvent.click(button)
		})
		const lightButton = screen.getByRole('button', { name: /switch to light mode/i })
		act(() => {
			fireEvent.click(lightButton)
		})
		expect(
			screen.getByRole('button', { name: /switch to dark mode/i })
		).toBeInTheDocument()
	})

	it('persists dark mode to localStorage when toggled', () => {
		renderWithProvider(<DarkModeToggle />)
		const button = screen.getByRole('button', { name: /switch to dark mode/i })
		act(() => {
			fireEvent.click(button)
		})
		expect(localStorage.getItem('wt-theme-mode')).toBe('dark')
	})

	it('persists light mode to localStorage when toggled back', () => {
		renderWithProvider(<DarkModeToggle />)
		const button = screen.getByRole('button', { name: /switch to dark mode/i })
		act(() => {
			fireEvent.click(button)
		})
		const lightButton = screen.getByRole('button', { name: /switch to light mode/i })
		act(() => {
			fireEvent.click(lightButton)
		})
		expect(localStorage.getItem('wt-theme-mode')).toBe('light')
	})
})
