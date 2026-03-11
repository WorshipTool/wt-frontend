import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock useAuth
const mockIsAdmin = jest.fn()
jest.mock('../../hooks/auth/useAuth', () => ({
	__esModule: true,
	default: () => ({
		isAdmin: mockIsAdmin,
	}),
}))

// Mock next/dynamic to render children synchronously in tests
jest.mock('next/dynamic', () => {
	return (loader: () => Promise<any>) => {
		const Component = React.lazy(loader)
		return function DynamicMock(props: any) {
			return (
				<React.Suspense fallback={null}>
					<Component {...props} />
				</React.Suspense>
			)
		}
	}
})

// Mock all admin components
jest.mock('../../common/components/admin/AdminOptions', () => ({
	__esModule: true,
	default: () => <div data-testid="admin-options">AdminOptions</div>,
}))

jest.mock('../../common/components/admin/GlobalAdminNavOptions', () => ({
	__esModule: true,
	default: () => (
		<div data-testid="global-admin-nav">GlobalAdminNavOptions</div>
	),
}))

jest.mock(
	'../../common/components/ImplementAndPreview/ImplementIdeaProvider',
	() => ({
		__esModule: true,
		default: () => (
			<div data-testid="implement-idea">ImplementIdeaProvider</div>
		),
	})
)

jest.mock(
	'../../common/components/admin/EditProposals/AdminEditOverlay',
	() => ({
		__esModule: true,
		default: () => (
			<div data-testid="admin-edit-overlay">AdminEditOverlay</div>
		),
	})
)

jest.mock(
	'../../common/components/admin/EditProposals/ProposalDialog',
	() => ({
		__esModule: true,
		default: () => <div data-testid="proposal-dialog">ProposalDialog</div>,
	})
)

jest.mock(
	'../../common/components/admin/EditProposals/ProposalCornerButton',
	() => ({
		__esModule: true,
		default: () => (
			<div data-testid="proposal-corner-button">ProposalCornerButton</div>
		),
	})
)

import LazyAdminComponents from './LazyAdminComponents'

describe('LazyAdminComponents', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders nothing when user is not admin', () => {
		mockIsAdmin.mockReturnValue(false)

		const { container } = render(<LazyAdminComponents />)

		expect(container.innerHTML).toBe('')
	})

	it('renders admin components when user is admin', async () => {
		mockIsAdmin.mockReturnValue(true)

		render(<LazyAdminComponents />)

		expect(
			await screen.findByTestId('admin-options')
		).toBeInTheDocument()
		expect(
			await screen.findByTestId('global-admin-nav')
		).toBeInTheDocument()
		expect(
			await screen.findByTestId('implement-idea')
		).toBeInTheDocument()
		expect(
			await screen.findByTestId('admin-edit-overlay')
		).toBeInTheDocument()
		expect(
			await screen.findByTestId('proposal-dialog')
		).toBeInTheDocument()
		expect(
			await screen.findByTestId('proposal-corner-button')
		).toBeInTheDocument()
	})
})
