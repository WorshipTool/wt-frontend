import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import LazyGoogleOAuthProvider from '../LazyGoogleOAuthProvider'

// Mock @react-oauth/google so we don't need a real Google OAuth setup
jest.mock('@react-oauth/google', () => ({
	GoogleOAuthProvider: ({
		children,
	}: {
		children: React.ReactNode
		clientId: string
	}) => <div data-testid="google-oauth-provider">{children}</div>,
}))

describe('LazyGoogleOAuthProvider', () => {
	it('renders children after dynamic import loads', async () => {
		render(
			<LazyGoogleOAuthProvider>
				<div data-testid="child">Child content</div>
			</LazyGoogleOAuthProvider>,
		)
		await waitFor(() => {
			expect(screen.getByTestId('child')).toBeInTheDocument()
		})
		expect(screen.getByText('Child content')).toBeInTheDocument()
	})

	it('wraps children in GoogleOAuthProvider after mount', async () => {
		render(
			<LazyGoogleOAuthProvider>
				<div data-testid="child">Child content</div>
			</LazyGoogleOAuthProvider>,
		)

		await waitFor(() => {
			expect(
				screen.getByTestId('google-oauth-provider'),
			).toBeInTheDocument()
		})
		expect(screen.getByTestId('child')).toBeInTheDocument()
	})
})
