import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

jest.mock('framer-motion', () => ({
	motion: {
		button: ({
			children,
			onClick,
			className,
			type,
		}: {
			children?: React.ReactNode
			onClick?: () => void
			className?: string
			type?: string
		}) => (
			<button onClick={onClick} className={className} type={type}>
				{children}
			</button>
		),
	},
}))

import QuickSearchTags from '../QuickSearchTags'

describe('QuickSearchTags', () => {
	it('renders all quick search tags', () => {
		const onTagClick = jest.fn()
		render(<QuickSearchTags onTagClick={onTagClick} />)

		expect(screen.getByText('quickTags.worship')).toBeInTheDocument()
		expect(screen.getByText('quickTags.praise')).toBeInTheDocument()
		expect(screen.getByText('quickTags.psalms')).toBeInTheDocument()
		expect(screen.getByText('quickTags.christmas')).toBeInTheDocument()
		expect(screen.getByText('quickTags.easter')).toBeInTheDocument()
		expect(screen.getByText('quickTags.wedding')).toBeInTheDocument()
	})

	it('calls onTagClick with the tag text when clicked', () => {
		const onTagClick = jest.fn()
		render(<QuickSearchTags onTagClick={onTagClick} />)

		fireEvent.click(screen.getByText('quickTags.worship'))
		expect(onTagClick).toHaveBeenCalledWith('quickTags.worship')
	})

	it('renders all tags as buttons', () => {
		const onTagClick = jest.fn()
		render(<QuickSearchTags onTagClick={onTagClick} />)

		const buttons = screen.getAllByRole('button')
		expect(buttons).toHaveLength(6)
	})
})
