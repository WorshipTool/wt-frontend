import React, { useState } from 'react'
import { render, waitFor } from '@testing-library/react'
import LazyGoogleOAuthProvider, {
	GoogleOAuthScope,
	useGoogleOAuthReady,
} from './LazyGoogleOAuthProvider'

// Mock GoogleOAuthProvider as a simple passthrough wrapper
jest.mock('@react-oauth/google', () => ({
	GoogleOAuthProvider: ({
		children,
	}: {
		clientId: string
		children: React.ReactNode
	}) => <div data-testid="oauth-provider">{children}</div>,
}))

// Track mount count to detect remounts
let childMountCount = 0

function MountCounter({ testId }: { testId: string }) {
	const [id] = useState(() => ++childMountCount)
	return <div data-testid={testId} data-mount-id={id} />
}

function ReadyIndicator() {
	const ready = useGoogleOAuthReady()
	return <div data-testid="ready" data-ready={String(ready)} />
}

beforeEach(() => {
	childMountCount = 0
})

describe('LazyGoogleOAuthProvider', () => {
	it('does not remount children when Google OAuth loads', async () => {
		const { getByTestId } = render(
			<LazyGoogleOAuthProvider>
				<MountCounter testId="child" />
				<ReadyIndicator />
			</LazyGoogleOAuthProvider>,
		)

		// Child mounted exactly once
		expect(getByTestId('child').dataset.mountId).toBe('1')

		// Wait for async import to resolve and state to update
		await waitFor(() => {
			expect(getByTestId('ready').dataset.ready).toBe('true')
		})

		// Child should NOT have remounted (still mount id 1)
		expect(getByTestId('child').dataset.mountId).toBe('1')
	})

	it('GoogleOAuthScope renders children when provider is loaded', async () => {
		const { getByTestId } = render(
			<LazyGoogleOAuthProvider>
				<GoogleOAuthScope fallback={<div data-testid="fallback" />}>
					<div data-testid="scoped-child" />
				</GoogleOAuthScope>
			</LazyGoogleOAuthProvider>,
		)

		// After the async import resolves, children should be rendered inside provider
		await waitFor(() => {
			expect(getByTestId('scoped-child')).toBeTruthy()
		})
		expect(getByTestId('oauth-provider')).toBeTruthy()
	})

	it('GoogleOAuthScope shows fallback when provider is not yet loaded', () => {
		// Render GoogleOAuthScope without LazyGoogleOAuthProvider (no context)
		const { getByTestId, queryByTestId } = render(
			<GoogleOAuthScope fallback={<div data-testid="fallback" />}>
				<div data-testid="scoped-child" />
			</GoogleOAuthScope>,
		)

		expect(getByTestId('fallback')).toBeTruthy()
		expect(queryByTestId('scoped-child')).toBeNull()
	})
})
