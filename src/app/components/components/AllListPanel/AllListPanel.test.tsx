import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

jest.mock('../../../../common/ui', () => ({
	Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
	Button: ({ children, ...props }: any) => (
		<button {...props}>{children}</button>
	),
	Typography: ({ children, ...props }: any) => (
		<span {...props}>{children}</span>
	),
	useTheme: () => ({
		palette: {
			primary: { main: '#0085ff', dark: '#532ee7' },
			grey: { 50: '#fafafa', 400: '#bbb' },
		},
	}),
}))

jest.mock('@mui/icons-material/KeyboardArrowRightRounded', () => ({
	__esModule: true,
	default: () => <span data-testid="arrow-icon">arrow</span>,
}))

jest.mock('@mui/icons-material/QueueMusicRounded', () => ({
	__esModule: true,
	default: () => <span data-testid="music-icon">music</span>,
}))

import AllListPanel from './AllListPanel'

describe('AllListPanel', () => {
	it('renders desktop variant by default', () => {
		render(<AllListPanel />)
		expect(screen.getByTestId('all-list-panel')).toBeInTheDocument()
		expect(screen.getByText('allList.title')).toBeInTheDocument()
		expect(screen.getByText('allList.browse')).toBeInTheDocument()
	})

	it('renders mobile variant with card style when isMobile is true', () => {
		render(<AllListPanel isMobile />)
		const panel = screen.getByTestId('all-list-panel')
		expect(panel).toBeInTheDocument()
	})

	it('renders both browse and title text in mobile variant', () => {
		render(<AllListPanel isMobile />)
		expect(screen.getByText('allList.browse')).toBeInTheDocument()
		expect(screen.getByText('allList.title')).toBeInTheDocument()
	})

	it('renders music icon in mobile variant', () => {
		render(<AllListPanel isMobile />)
		expect(screen.getByTestId('music-icon')).toBeInTheDocument()
	})

	it('renders arrow icon in mobile variant', () => {
		render(<AllListPanel isMobile />)
		expect(screen.getByTestId('arrow-icon')).toBeInTheDocument()
	})
})
