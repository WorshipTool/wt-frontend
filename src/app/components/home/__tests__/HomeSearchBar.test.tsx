import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

jest.mock('../../../../common/providers/FeatureFlags/useFlag', () => ({
	useFlag: () => false,
}))

jest.mock('../../../../common/providers/News', () => ({
	NewsHighlightWrapper: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}))

jest.mock('../../../../hooks/changedelay/useChangeDelayer', () => ({
	useChangeDelayer: jest.fn(),
}))

jest.mock('../../components/analytics/analytics.tech', () => ({
	Analytics: { track: jest.fn() },
}))

import HomeSearchBar from '../HomeSearchBar'

describe('HomeSearchBar', () => {
	it('renders search input with placeholder', () => {
		render(<HomeSearchBar value="" onChange={jest.fn()} />)
		const input = screen.getByTestId('home-search-input')
		expect(input).toBeInTheDocument()
		expect(input).toHaveAttribute('placeholder', 'searchByTitleOrText')
	})

	it('displays the current value', () => {
		render(<HomeSearchBar value="test query" onChange={jest.fn()} />)
		const input = screen.getByTestId('home-search-input')
		expect(input).toHaveValue('test query')
	})

	it('calls onChange when user types', () => {
		const onChange = jest.fn()
		render(<HomeSearchBar value="" onChange={onChange} />)

		const input = screen.getByTestId('home-search-input')
		fireEvent.change(input, { target: { value: 'new search' } })
		expect(onChange).toHaveBeenCalledWith('new search')
	})

	it('does not show smart search button when flag is disabled', () => {
		render(
			<HomeSearchBar
				value=""
				onChange={jest.fn()}
				smartSearch={false}
				onSmartSearchChange={jest.fn()}
			/>
		)
		expect(
			screen.queryByLabelText('Smart search')
		).not.toBeInTheDocument()
	})
})
