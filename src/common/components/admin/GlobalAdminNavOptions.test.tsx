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
	PersonAdd: () => <span>PersonAddIcon</span>,
}))

// Mock useAuth used by LoginAsTestUser
const mockSignup = jest.fn()
const mockLogin = jest.fn()
jest.mock('../../../hooks/auth/useAuth', () => ({
	__esModule: true,
	default: () => ({
		signup: mockSignup,
		login: mockLogin,
	}),
}))

// Mock generateTestEmail used by LoginAsTestUser
jest.mock('../../../tech/test-user/generateTestEmail', () => ({
	generateTestEmail: () => 'testABC123@test.cz',
}))

import GlobalAdminNavOptions from './GlobalAdminNavOptions'

describe('GlobalAdminNavOptions', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders only the test user option when show_admin_page flag is false', () => {
		mockUseFlag.mockReturnValue(false)

		render(<GlobalAdminNavOptions />)

		expect(
			screen.queryByTestId('admin-option-Admin'),
		).not.toBeInTheDocument()
		expect(
			screen.queryByTestId('admin-option-ML Trénink'),
		).not.toBeInTheDocument()
		expect(
			screen.getByTestId('admin-option-Přihlásit si jako test'),
		).toBeInTheDocument()
	})

	it('renders Admin and ML Trénink options when show_admin_page flag is true', () => {
		mockUseFlag.mockReturnValue(true)

		render(<GlobalAdminNavOptions />)

		expect(screen.getByTestId('admin-option-Admin')).toBeInTheDocument()
		expect(screen.getByTestId('admin-option-ML Trénink')).toBeInTheDocument()
	})

	it('always renders LoginAsTestUser option regardless of feature flag', () => {
		mockUseFlag.mockReturnValue(false)

		render(<GlobalAdminNavOptions />)

		expect(
			screen.getByTestId('admin-option-Přihlásit si jako test'),
		).toBeInTheDocument()
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
