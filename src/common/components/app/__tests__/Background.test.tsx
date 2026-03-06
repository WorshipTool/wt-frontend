import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// jest.mock does not resolve path aliases, so relative paths must be used
/* eslint-disable react/display-name, @next/next/no-img-element */
jest.mock('../../../ui', () => ({
	Box: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
		<div data-testid="bg-box" {...props}>
			{children}
		</div>
	),
	Image: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

jest.mock('../../../ui/mui', () => ({
	// styled(Component)(styles) is double-curried, so mock both calls
	styled:
		() =>
		() =>
		({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
			React.createElement('div', { 'data-testid': 'bg-box', ...props }, children),
}))
/* eslint-enable react/display-name, @next/next/no-img-element */

jest.mock('../../../../tech/paths.tech', () => ({
	getAssetUrl: (name: string) => `/assets/${name}`,
}))

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

import { Background } from '../Background'

const renderWithTheme = (mode: 'light' | 'dark') => {
	const theme = createTheme({ palette: { mode } })
	return render(
		<ThemeProvider theme={theme}>
			<Background />
		</ThemeProvider>
	)
}

describe('Background', () => {
	it('renders without crashing in light mode', () => {
		const { getByTestId } = renderWithTheme('light')
		expect(getByTestId('bg-box')).toBeInTheDocument()
	})

	it('renders without crashing in dark mode', () => {
		const { getByTestId } = renderWithTheme('dark')
		expect(getByTestId('bg-box')).toBeInTheDocument()
	})

	it('renders background image with alt text in light mode', () => {
		const { getByAltText } = renderWithTheme('light')
		expect(getByAltText('backgroundAlt')).toBeInTheDocument()
	})

	it('renders background image with alt text in dark mode', () => {
		const { getByAltText } = renderWithTheme('dark')
		expect(getByAltText('backgroundAlt')).toBeInTheDocument()
	})
})
