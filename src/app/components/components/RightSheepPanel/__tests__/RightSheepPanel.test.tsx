import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

/* eslint-disable react/display-name */
jest.mock('../SheepAnimation', () => ({
	__esModule: true,
	default: ({ size, 'aria-label': ariaLabel }: { size?: number; 'aria-label'?: string }) => (
		<svg data-testid="sheep-animation" width={size} height={size} aria-label={ariaLabel} />
	),
}))

jest.mock('../../../../../common/providers/FeatureFlags/useFlag', () => ({
	useFlag: () => false,
}))

jest.mock('../../../../../common/ui', () => ({
	Box: ({
		children,
		...props
	}: {
		children?: React.ReactNode
		[key: string]: unknown
	}) => <div {...props}>{children}</div>,
	Typography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

jest.mock('../../AllListPanel/AllListPanel', () => ({
	__esModule: true,
	default: () => <div data-testid="all-list-panel" />,
}))

jest.mock('../../LastAddedPanel/LastAddedPanel', () => ({
	__esModule: true,
	default: () => <div data-testid="last-added-panel" />,
}))
/* eslint-enable react/display-name */

import RightSheepPanel from '../RightSheepPanel'

describe('RightSheepPanel', () => {
	it('renders without crashing', () => {
		render(<RightSheepPanel mobileVersion={false} />)
	})

	it('renders the SheepAnimation component', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		expect(screen.getByTestId('sheep-animation')).toBeInTheDocument()
	})

	it('renders the sheep animation with correct aria-label', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		const sheep = screen.getByTestId('sheep-animation')
		expect(sheep).toHaveAttribute('aria-label', 'sheep')
	})

	it('renders the sheep animation with 140px size', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		const sheep = screen.getByTestId('sheep-animation')
		expect(sheep).toHaveAttribute('width', '140')
		expect(sheep).toHaveAttribute('height', '140')
	})

	it('renders AllListPanel', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		expect(screen.getByTestId('all-list-panel')).toBeInTheDocument()
	})

	it('renders fallback content when showLastAdded is false', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		expect(screen.getByText('noIdea')).toBeInTheDocument()
		expect(screen.getByText('chooseSuggestion')).toBeInTheDocument()
	})

	it('renders correctly in mobile version', () => {
		render(<RightSheepPanel mobileVersion={true} />)
		expect(screen.getByTestId('sheep-animation')).toBeInTheDocument()
	})
})
