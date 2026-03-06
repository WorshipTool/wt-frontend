import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// Mock useFlag (using relative path so Jest resolves it correctly)
const mockUseFlag = jest.fn()
jest.mock('../../providers/FeatureFlags/useFlag', () => ({
	useFlag: (flag: string) => mockUseFlag(flag),
}))

// Mock useSmartNavigate
const mockNavigate = jest.fn()
jest.mock('../../../routes/useSmartNavigate', () => ({
	useSmartNavigate: () => mockNavigate,
}))

// Mock AdminOption to render a simple testable button
jest.mock('./AdminOption', () => ({
	__esModule: true,
	default: ({
		label,
		onClick,
	}: {
		label?: string
		onClick?: (e: React.MouseEvent<HTMLElement>) => void
	}) => (
		<button data-testid={`admin-option-${label}`} onClick={onClick}>
			{label}
		</button>
	),
}))

// Mock MUI icons
jest.mock('@mui/icons-material', () => ({
	AdminPanelSettings: () => <span>AdminPanelSettingsIcon</span>,
	Psychology: () => <span>PsychologyIcon</span>,
}))

import GlobalAdminNavOptions from './GlobalAdminNavOptions'

describe('GlobalAdminNavOptions', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders nothing when show_admin_page flag is false', () => {
		mockUseFlag.mockReturnValue(false)

		const { container } = render(<GlobalAdminNavOptions />)

		expect(container).toBeEmptyDOMElement()
	})

	it('renders Admin and ML Trénink options when show_admin_page flag is true', () => {
		mockUseFlag.mockReturnValue(true)

		render(<GlobalAdminNavOptions />)

		expect(screen.getByTestId('admin-option-Admin')).toBeInTheDocument()
		expect(screen.getByTestId('admin-option-ML Trénink')).toBeInTheDocument()
	})

	it('calls navigate with "admin" when Admin option is clicked', () => {
		mockUseFlag.mockReturnValue(true)

		render(<GlobalAdminNavOptions />)

		fireEvent.click(screen.getByTestId('admin-option-Admin'))

		expect(mockNavigate).toHaveBeenCalledWith('admin', {})
	})

	it('calls navigate with "adminMlTraining" when ML Trénink option is clicked', () => {
		mockUseFlag.mockReturnValue(true)

		render(<GlobalAdminNavOptions />)

		fireEvent.click(screen.getByTestId('admin-option-ML Trénink'))

		expect(mockNavigate).toHaveBeenCalledWith('adminMlTraining', {})
	})

	it('uses show_admin_page feature flag to control visibility', () => {
		mockUseFlag.mockReturnValue(true)

		render(<GlobalAdminNavOptions />)

		expect(mockUseFlag).toHaveBeenCalledWith('show_admin_page')
	})
})
