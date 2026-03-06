import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { ThemeModeProvider, useThemeMode } from '../ThemeModeContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<ThemeModeProvider>{children}</ThemeModeProvider>
)

describe('ThemeModeContext', () => {
	beforeEach(() => {
		localStorage.clear()
		document.documentElement.removeAttribute('data-theme')
	})

	it('defaults to light mode when no stored preference exists', () => {
		const { result } = renderHook(() => useThemeMode(), { wrapper })
		expect(result.current.mode).toBe('light')
	})

	it('reads stored preference from localStorage', () => {
		localStorage.setItem('wt-theme-mode', 'dark')
		const { result } = renderHook(() => useThemeMode(), { wrapper })
		// After mount effect runs
		act(() => {})
		expect(result.current.mode).toBe('dark')
	})

	it('toggleMode switches from light to dark', () => {
		const { result } = renderHook(() => useThemeMode(), { wrapper })
		act(() => {
			result.current.toggleMode()
		})
		expect(result.current.mode).toBe('dark')
	})

	it('toggleMode switches from dark to light', () => {
		localStorage.setItem('wt-theme-mode', 'dark')
		const { result } = renderHook(() => useThemeMode(), { wrapper })
		act(() => {})
		act(() => {
			result.current.toggleMode()
		})
		expect(result.current.mode).toBe('light')
	})

	it('setMode sets a specific mode', () => {
		const { result } = renderHook(() => useThemeMode(), { wrapper })
		act(() => {
			result.current.setMode('dark')
		})
		expect(result.current.mode).toBe('dark')
	})

	it('persists mode to localStorage on toggle', () => {
		const { result } = renderHook(() => useThemeMode(), { wrapper })
		act(() => {
			result.current.toggleMode()
		})
		expect(localStorage.getItem('wt-theme-mode')).toBe('dark')
	})

	it('sets data-theme attribute on documentElement', () => {
		const { result } = renderHook(() => useThemeMode(), { wrapper })
		act(() => {
			result.current.setMode('dark')
		})
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
	})
})
