import { render, screen } from '@testing-library/react'
import AllListPanel from '../AllListPanel/AllListPanel'

// Mock dependencies
jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => {
		const translations: Record<string, string> = {
			'allList.browse': 'procházet',
			'allList.title': 'Seznam všech písní',
		}
		return translations[key] || key
	},
}))

jest.mock('../../../../common/ui', () => ({
	Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
	Button: ({ children, ...props }: any) => (
		<button data-testid="all-list-button" {...props}>
			{children}
		</button>
	),
	Typography: ({ children, ...props }: any) => (
		<span {...props}>{children}</span>
	),
}))

describe('AllListPanel', () => {
	it('renders the browse text', () => {
		render(<AllListPanel />)
		expect(screen.getByText('procházet')).toBeInTheDocument()
	})

	it('renders the all songs list title', () => {
		render(<AllListPanel />)
		expect(screen.getByText('Seznam všech písní')).toBeInTheDocument()
	})

	it('renders a button linking to songs list', () => {
		render(<AllListPanel />)
		const button = screen.getByTestId('all-list-button')
		expect(button).toBeInTheDocument()
	})
})
