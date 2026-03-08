import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

const mockSignup = jest.fn()
const mockLogin = jest.fn()

jest.mock('../../../hooks/auth/useAuth', () => ({
	__esModule: true,
	default: () => ({
		signup: mockSignup,
		login: mockLogin,
	}),
}))

const GENERATED_EMAIL = 'testABC123@test.cz'
jest.mock('../../../tech/test-user/generateTestEmail', () => ({
	generateTestEmail: () => GENERATED_EMAIL,
}))

jest.mock('./AdminOption', () => ({
	__esModule: true,
	default: ({
		label,
		subtitle,
		onClick,
		loading,
	}: {
		label?: string
		subtitle?: string
		onClick?: (e: React.MouseEvent<HTMLElement>) => void
		loading?: boolean
	}) => (
		<button
			data-testid="login-as-test-user"
			data-label={label}
			data-subtitle={subtitle}
			data-loading={String(loading)}
			onClick={onClick}
		>
			{label}
		</button>
	),
}))

jest.mock('@mui/icons-material', () => ({
	PersonAdd: () => <span>PersonAddIcon</span>,
}))

import LoginAsTestUser from './LoginAsTestUser'

describe('LoginAsTestUser', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders the admin option with correct label and subtitle', () => {
		render(<LoginAsTestUser />)

		const btn = screen.getByTestId('login-as-test-user')
		expect(btn).toBeInTheDocument()
		expect(btn).toHaveAttribute('data-label', 'Přihlásit si jako test')
		expect(btn).toHaveAttribute('data-subtitle', 'Vytvořit nový random účet')
	})

	it('calls signup with correct test credentials on click', () => {
		render(<LoginAsTestUser />)

		fireEvent.click(screen.getByTestId('login-as-test-user'))

		expect(mockSignup).toHaveBeenCalledWith(
			{
				firstName: 'test',
				lastName: 'test',
				email: GENERATED_EMAIL,
				password: 'test',
			},
			expect.any(Function),
		)
	})

	it('calls login after successful signup', async () => {
		mockSignup.mockImplementation((_data: unknown, callback: (success: boolean) => void) => {
			callback(true)
		})
		mockLogin.mockResolvedValue(undefined)

		render(<LoginAsTestUser />)

		fireEvent.click(screen.getByTestId('login-as-test-user'))

		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledWith({
				email: GENERATED_EMAIL,
				password: 'test',
			})
		})
	})

	it('does not call login when signup fails', async () => {
		mockSignup.mockImplementation((_data: unknown, callback: (success: boolean) => void) => {
			callback(false)
		})

		render(<LoginAsTestUser />)

		fireEvent.click(screen.getByTestId('login-as-test-user'))

		await waitFor(() => {
			expect(mockLogin).not.toHaveBeenCalled()
		})
	})

	it('shows loading state while creating account', () => {
		// signup does not call callback - simulates in-progress state
		mockSignup.mockImplementation(() => {})

		render(<LoginAsTestUser />)

		fireEvent.click(screen.getByTestId('login-as-test-user'))

		expect(screen.getByTestId('login-as-test-user')).toHaveAttribute(
			'data-loading',
			'true',
		)
	})

	it('does not trigger a second signup if already creating', () => {
		mockSignup.mockImplementation(() => {})

		render(<LoginAsTestUser />)

		const btn = screen.getByTestId('login-as-test-user')
		fireEvent.click(btn)
		fireEvent.click(btn)

		expect(mockSignup).toHaveBeenCalledTimes(1)
	})
})
