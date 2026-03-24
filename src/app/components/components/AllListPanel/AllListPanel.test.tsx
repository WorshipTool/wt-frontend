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
			grey: { 50: '#fafafa' },
		},
	}),
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
})
